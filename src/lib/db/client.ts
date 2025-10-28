import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

// Database client factory
export function createDbClient(d1Database: D1Database) {
  return drizzle(d1Database, { schema });
}

// Database operations
export class DatabaseService {
  private db: ReturnType<typeof createDbClient>;

  constructor(d1Database: D1Database) {
    this.db = createDbClient(d1Database);
  }

  // User operations
  async createUser(user: schema.NewUser) {
    return await this.db.insert(schema.users).values(user).returning();
  }

  async getUserById(id: string) {
    return await this.db.select().from(schema.users).where(eq(schema.users.id, id)).get();
  }

  async getUserByEmail(email: string) {
    return await this.db.select().from(schema.users).where(eq(schema.users.email, email)).get();
  }

  // Session operations
  async createSession(session: schema.NewSession) {
    try {
      return await this.db.insert(schema.sessions).values(session).returning();
    } catch (error) {
      // Fallback for databases without upload_id column
      if (error.message && error.message.includes('no column named upload_id')) {
        console.log('Creating session without upload_id (fallback)');
        const { upload_id, ...sessionWithoutUploadId } = session as any;
        return await this.db.insert(schema.sessions).values(sessionWithoutUploadId).returning();
      }
      console.log('Session creation error:', error.message);
      console.log('Error details:', error);
      console.log('Session object:', session);
      console.log('Error type:', typeof error);
      console.log('Error constructor:', error.constructor.name);
      console.log('Error stack:', error.stack);
      throw error;
    }
  }

  async getSessionById(id: string) {
    return await this.db.select().from(schema.sessions).where(eq(schema.sessions.id, id)).get();
  }

  // Upload operations
  async createUpload(upload: schema.NewUpload) {
    try {
      return await this.db.insert(schema.uploads).values(upload).returning();
    } catch (error) {
      // Fallback for databases without session_id column
      if (error.message && error.message.includes('session_id')) {
        console.log('Creating upload without session_id (fallback)');
        const { session_id, ...uploadWithoutSessionId } = upload as any;
        return await this.db.insert(schema.uploads).values(uploadWithoutSessionId).returning();
      }
      throw error;
    }
  }

  async getUploadsByUserId(userId: string) {
    return await this.db.select().from(schema.uploads).where(eq(schema.uploads.user_id, userId)).all();
  }

  async updateUploadStatus(id: string, status: 'processing' | 'analyzed' | 'error', transactionCount?: number) {
    const updateData: any = { status };
    if (transactionCount !== undefined) {
      updateData.transaction_count = transactionCount;
    }
    return await this.db.update(schema.uploads).set(updateData).where(eq(schema.uploads.id, id)).returning();
  }

  // Transaction operations
  async createTransactions(transactions: schema.NewTransaction[]) {
    // SQLite has a limit on the number of parameters, so we need to batch inserts
    const batchSize = 10; // Smaller batch size for SQLite
    const results = [];
    
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const batchResult = await this.db.insert(schema.transactions).values(batch).returning();
      results.push(...batchResult);
    }
    
    return results;
  }

  async getTransactionsByUploadId(uploadId: string) {
    return await this.db.select().from(schema.transactions).where(eq(schema.transactions.upload_id, uploadId)).all();
  }

  async getTransactionsBySessionId(sessionId: string) {
    try {
      // For now, treat sessionId as uploadId since we're using upload_id as session_id
      return await this.db
        .select()
        .from(schema.transactions)
        .where(eq(schema.transactions.upload_id, sessionId))
        .all();
    } catch (error) {
      console.log('Error getting transactions by session:', error);
      return [];
    }
  }

  // Insight operations
  async createInsight(insight: schema.NewInsight) {
    return await this.db.insert(schema.insights).values(insight).returning();
  }

  async getInsightsBySessionId(sessionId: string) {
    return await this.db.select().from(schema.insights).where(eq(schema.insights.session_id, sessionId)).all();
  }

  async getInsightsByAgentType(sessionId: string, agentType: string) {
    return await this.db
      .select()
      .from(schema.insights)
      .where(and(eq(schema.insights.session_id, sessionId), eq(schema.insights.agent_type, agentType)))
      .all();
  }

  // Chat message operations
  async createChatMessage(message: schema.NewChatMessage) {
    return await this.db.insert(schema.chatMessages).values(message).returning();
  }

  async getChatMessagesBySessionId(sessionId: string) {
    return await this.db
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.session_id, sessionId))
      .orderBy(asc(schema.chatMessages.created_at))
      .all();
  }

  // Utility functions
  async getSessionWithData(sessionId: string) {
    const session = await this.getSessionById(sessionId);
    if (!session) return null;

    const transactions = await this.getTransactionsBySessionId(sessionId);
    const insights = await this.getInsightsBySessionId(sessionId);
    const chatMessages = await this.getChatMessagesBySessionId(sessionId);

    return {
      session,
      transactions,
      insights,
      chatMessages,
    };
  }
}

// Import Drizzle operators
import { eq, and, asc, desc } from 'drizzle-orm';
