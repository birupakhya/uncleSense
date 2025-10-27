import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// Sessions table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// Uploads table
export const uploads = sqliteTable('uploads', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  filename: text('filename').notNull(),
  file_type: text('file_type', { enum: ['csv', 'excel', 'pdf'] }).notNull(),
  upload_date: text('upload_date').notNull().default('CURRENT_TIMESTAMP'),
  status: text('status', { enum: ['processing', 'analyzed', 'error'] }).notNull().default('processing'),
  transaction_count: integer('transaction_count'),
});

// Transactions table
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  upload_id: text('upload_id').notNull().references(() => uploads.id),
  date: text('date').notNull(),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  merchant: text('merchant'),
  account_type: text('account_type', { enum: ['checking', 'savings', 'credit'] }),
});

// Insights table
export const insights = sqliteTable('insights', {
  id: text('id').primaryKey(),
  session_id: text('session_id').notNull().references(() => sessions.id),
  agent_type: text('agent_type', { 
    enum: ['data_extraction', 'spending_analysis', 'savings_insight', 'risk_assessment', 'uncle_personality'] 
  }).notNull(),
  insight_data: text('insight_data', { mode: 'json' }).notNull(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  sentiment: text('sentiment', { enum: ['positive', 'neutral', 'negative'] }).notNull().default('neutral'),
});

// Chat messages table
export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  session_id: text('session_id').notNull().references(() => sessions.id),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  related_insights: text('related_insights', { mode: 'json' }),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Insight = typeof insights.$inferSelect;
export type NewInsight = typeof insights.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
