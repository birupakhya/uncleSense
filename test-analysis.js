// Test the analysis endpoint directly
const API_BASE_URL = 'https://unclesense-api.ucancallmebiru.workers.dev';

async function testAnalysis() {
  console.log('Testing analysis endpoint...');
  
  try {
    // First upload a file
    console.log('1. Uploading file...');
    const formData = new FormData();
    formData.append('file', new Blob(['Date,Description,Amount\n2025-10-28,AMAZON.COM AMZN.COM/BILL WA,-45.99\n2025-10-28,STARBUCKS COFFEE,-5.50'], { type: 'text/csv' }), 'test.csv');
    
    const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    const uploadData = await uploadResponse.json();
    console.log('Upload result:', uploadData);
    
    if (!uploadData.success) {
      throw new Error('Upload failed');
    }
    
    const sessionId = uploadData.data.session_id;
    console.log('Session ID:', sessionId);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Then analyze
    console.log('2. Analyzing...');
    const analyzeResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ session_id: sessionId })
    });
    
    const analyzeData = await analyzeResponse.json();
    console.log('Analysis result:', analyzeData);
    
    // Check logs
    console.log('3. Checking logs...');
    const logsResponse = await fetch(`${API_BASE_URL}/api/logs?session_id=${sessionId}`);
    const logsData = await logsResponse.json();
    console.log('Logs:', logsData);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAnalysis();
