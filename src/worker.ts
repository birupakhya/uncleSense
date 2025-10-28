// Cloudflare Worker for UncleSense API

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { DatabaseService } from './lib/db/client';
import { AgentOrchestrator } from './lib/orchestrator/agent-orchestrator';
import { FileParser } from './lib/parsers/file-parser';

type Bindings = {
  DB: D1Database;
  HUGGINGFACE_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint to check environment variables
app.get('/api/debug', (c) => {
  return c.json({ 
    hasHuggingFaceKey: !!c.env.HUGGINGFACE_API_KEY,
    keyLength: c.env.HUGGINGFACE_API_KEY?.length || 0,
    keyPrefix: c.env.HUGGINGFACE_API_KEY?.substring(0, 10) || 'none'
  });
});

// Logs endpoint
app.get('/api/logs', async (c) => {
  try {
    const sessionId = c.req.query('session_id');
    
    if (!sessionId) {
      return c.json({ success: false, error: 'Session ID required' }, 400);
    }

    // For now, return mock logs - in production this would fetch from a logging service
    const mockLogs = [
      {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Session started',
        source: 'backend'
      },
      {
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Hugging Face API key loaded',
        source: 'huggingface',
        details: { hasKey: !!c.env.HUGGINGFACE_API_KEY }
      }
    ];

    return c.json({ success: true, logs: mockLogs });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch logs' }, 500);
  }
});

// File upload endpoint
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    // Validate file type - be more flexible with CSV files
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    const isCSV = fileName.endsWith('.csv') || 
                  fileType === 'text/csv' || 
                  fileType === 'application/csv' ||
                  fileType === 'text/plain';
    
    const isExcel = fileName.endsWith('.xlsx') || 
                    fileName.endsWith('.xls') ||
                    fileType === 'application/vnd.ms-excel' || 
                    fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    if (!isCSV && !isExcel) {
      return c.json({ 
        success: false, 
        error: 'Invalid file type. Please upload CSV or Excel files.',
        details: { fileName, fileType, isCSV, isExcel }
      }, 400);
    }

    // Parse file
    let parseResult;
    if (isCSV) {
      parseResult = await FileParser.parseCSV(file);
    } else {
      parseResult = await FileParser.parseExcel(file);
    }

    if (!parseResult.success) {
      return c.json({ success: false, error: 'Failed to parse file', details: parseResult.metadata.errors }, 400);
    }

    // Create database service
    const db = new DatabaseService(c.env.DB);
    
    // Create or get existing demo user
    const demoEmail = 'demo@unclesense.com';
    let user = await db.getUserByEmail(demoEmail);
    
    if (!user) {
      const userId = 'demo-user-' + Date.now();
      const newUser = await db.createUser({ id: userId, email: demoEmail });
      user = newUser[0];
    }
    
    const userId = user.id;

    // Create session
    const sessionId = 'session-' + Date.now();
    await db.createSession({ id: sessionId, user_id: userId });

    // Create upload record
    const uploadId = 'upload-' + Date.now();
    await db.createUpload({
      id: uploadId,
      user_id: userId,
      filename: file.name,
      file_type: isCSV ? 'csv' : 'excel',
      status: 'processing',
    });

    // Convert parsed transactions to database format
    const transactions = parseResult.transactions.map((t, index) => ({
      id: `txn-${uploadId}-${index}`,
      upload_id: uploadId,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: 'Uncategorized', // Will be updated by Data Extraction Agent
    }));

    // Store transactions
    await db.createTransactions(transactions);

    // Update upload status
    await db.updateUploadStatus(uploadId, 'analyzed', transactions.length);

    return c.json({
      success: true,
      data: {
        upload_id: uploadId,
        session_id: sessionId,
        transaction_count: transactions.length,
        status: 'analyzed',
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ 
      success: false, 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

// Analysis endpoint
app.post('/api/analyze', async (c) => {
  try {
    const { session_id } = await c.req.json();
    
    if (!session_id) {
      return c.json({ success: false, error: 'Session ID required' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const sessionData = await db.getSessionWithData(session_id);
    
    if (!sessionData) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }

    // Run agent orchestration
    const orchestrator = new AgentOrchestrator(c.env.HUGGINGFACE_API_KEY);
    const analysisResult = await orchestrator.executeAnalysis(session_id, sessionData.transactions);

    // Store insights in database
    for (const agentResponse of analysisResult.agent_responses || []) {
      for (const insight of agentResponse.insights) {
        await db.createInsight({
          id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          session_id: session_id,
          agent_type: agentResponse.agent_type as any,
          insight_data: insight,
          sentiment: insight.sentiment || 'neutral',
        });
      }
    }

    return c.json({
      success: true,
      data: {
        session_id: session_id,
        analysis_complete: analysisResult.current_step === 'complete',
        uncle_response: analysisResult.uncle_response,
        insights_count: analysisResult.agent_responses?.length || 0,
      },
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({ success: false, error: 'Analysis failed' }, 500);
  }
});

// Get insights endpoint
app.get('/api/insights/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const db = new DatabaseService(c.env.DB);
    
    const insights = await db.getInsightsBySessionId(sessionId);
    const transactions = await db.getTransactionsBySessionId(sessionId);
    
    return c.json({
      success: true,
      data: {
        insights,
        transactions,
        session_id: sessionId,
      },
    });

  } catch (error) {
    console.error('Get insights error:', error);
    return c.json({ success: false, error: 'Failed to fetch insights' }, 500);
  }
});

// Chat endpoint
app.post('/api/chat', async (c) => {
  try {
    const { session_id, message } = await c.req.json();
    
    if (!session_id || !message) {
      return c.json({ success: false, error: 'Session ID and message required' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    
    // Store user message
    await db.createChatMessage({
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      session_id: session_id,
      role: 'user',
      content: message,
    });

    // Get previous insights for context
    const insights = await db.getInsightsBySessionId(session_id);
    
    // Generate Uncle's response
    const orchestrator = new AgentOrchestrator(c.env.HUGGINGFACE_API_KEY);
    const uncleResponse = await orchestrator.executeChatResponse(session_id, message, insights);

    // Store Uncle's response
    await db.createChatMessage({
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      session_id: session_id,
      role: 'assistant',
      content: uncleResponse,
    });

    return c.json({
      success: true,
      data: {
        response: uncleResponse,
        session_id: session_id,
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ success: false, error: 'Chat failed' }, 500);
  }
});

// Get chat history endpoint
app.get('/api/chat/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const db = new DatabaseService(c.env.DB);
    
    const messages = await db.getChatMessagesBySessionId(sessionId);
    
    return c.json({
      success: true,
      data: {
        messages,
        session_id: sessionId,
      },
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    return c.json({ success: false, error: 'Failed to fetch chat history' }, 500);
  }
});

export default app;
