-- UncleSense Database Schema Migration
-- Run this with: wrangler d1 execute unclesense-db --local --file=./migrations/schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'excel', 'pdf')),
    upload_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'analyzed', 'error')),
    transaction_count INTEGER
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    upload_id TEXT NOT NULL REFERENCES uploads(id),
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    merchant TEXT,
    account_type TEXT CHECK (account_type IN ('checking', 'savings', 'credit'))
);

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    agent_type TEXT NOT NULL CHECK (agent_type IN ('data_extraction', 'spending_analysis', 'savings_insight', 'risk_assessment', 'uncle_personality')),
    insight_data TEXT NOT NULL, -- JSON data
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sentiment TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative'))
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    related_insights TEXT -- JSON array of insight IDs
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_upload_id ON transactions(upload_id);
CREATE INDEX IF NOT EXISTS idx_insights_session_id ON insights(session_id);
CREATE INDEX IF NOT EXISTS idx_insights_agent_type ON insights(agent_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
