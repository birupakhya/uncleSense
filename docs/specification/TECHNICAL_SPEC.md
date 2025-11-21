# Technical Specifications

## Overview

UncleSense is a multi-agent AI system designed to provide personalized financial advice through natural language processing and machine learning. This document outlines the technical implementation details for building a scalable, secure, and user-friendly personal finance platform.

## System Requirements

### Minimum Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Network**: 1 Mbps minimum connection
- **Storage**: 50MB local storage
- **JavaScript**: ES2020+ support required

### Recommended Specifications
- **Device**: Desktop/laptop for best experience
- **Network**: 5+ Mbps for smooth real-time updates
- **Screen**: 1280x720 minimum resolution

## Technology Stack

### Frontend
```
Framework: React 18.3.1
Language: TypeScript 5.8.3
Build Tool: Vite 5.4.19
Styling: TailwindCSS 3.4.17 + shadcn/ui
State Management: React Query 5.83.0
Routing: React Router 6.30.1
Charts: Recharts 2.15.4
Forms: React Hook Form 7.61.1
Validation: Zod 3.25.76
```

### Backend
```
Runtime: Cloudflare Workers
Framework: Hono 4.6.3
Database: Cloudflare D1 (SQLite)
ORM: Drizzle ORM 0.36.4
File Storage: Cloudflare R2 (future)
Cache: Cloudflare Cache API
```

### AI/ML Pipeline
```
LLM Provider: HuggingFace Inference API
Primary Model: GPT-2/DistilBERT variants
Financial Models: FinBERT, custom fine-tuned
Embeddings: Sentence Transformers
Vector DB: Planned - Cloudflare Vectorize
```

## API Specifications

### RESTful Endpoints

#### Upload Endpoint
```typescript
POST /api/upload
Content-Type: multipart/form-data

Request:
{
  file: File, // CSV or Excel file
  userId: string,
  sessionId?: string
}

Response:
{
  success: boolean,
  sessionId: string,
  fileId: string,
  extractedData: {
    transactionCount: number,
    dateRange: { start: string, end: string },
    accounts: string[]
  }
}
```

#### Analysis Endpoint
```typescript
POST /api/analyze
Content-Type: application/json

Request:
{
  sessionId: string,
  userId: string,
  preferences?: {
    communicationStyle: 'formal' | 'casual' | 'gen-z' | 'millennial',
    focusAreas: string[],
    financialGoals: string[]
  }
}

Response:
{
  success: boolean,
  analysisId: string,
  status: 'processing' | 'completed' | 'failed',
  agents: {
    [agentName: string]: {
      status: string,
      progress: number,
      insights?: any
    }
  }
}
```

#### Chat Endpoint
```typescript
POST /api/chat
Content-Type: application/json

Request:
{
  sessionId: string,
  userId: string,
  message: string,
  context?: {
    currentInsights: string[],
    previousTopics: string[]
  }
}

Response:
{
  success: boolean,
  reply: string,
  suggestions: string[],
  relatedInsights: string[]
}
```

### WebSocket Events (Future)
```typescript
// Client -> Server
{
  type: 'subscribe',
  sessionId: string
}

// Server -> Client
{
  type: 'agent_update',
  agent: string,
  status: string,
  progress: number,
  data?: any
}
```

## Database Schema

### Tables

#### uploads
```sql
CREATE TABLE uploads (
  id TEXT PRIMARY KEY,
  upload_id TEXT UNIQUE NOT NULL,
  session_id TEXT,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### transactions
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  upload_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT,
  account TEXT,
  transaction_type TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (upload_id) REFERENCES uploads(upload_id)
);
```

#### analysis_results
```sql
CREATE TABLE analysis_results (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  insights JSON NOT NULL,
  confidence_score REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES uploads(session_id)
);
```

#### chat_history
```sql
CREATE TABLE chat_history (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Specifications

### Authentication & Authorization
- JWT-based authentication
- Session tokens with 24-hour expiry
- Refresh token rotation
- Role-based access control (future)

### Data Security
- All API communication over HTTPS
- End-to-end encryption for sensitive data
- PII anonymization in logs
- GDPR-compliant data handling

### API Security
- Rate limiting: 100 requests/minute per IP
- CORS configuration for allowed origins
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

## Performance Specifications

### Target Metrics
- Page Load: < 2 seconds
- API Response: < 500ms (p95)
- File Upload: < 10 seconds for 10MB
- Agent Analysis: < 30 seconds total

### Optimization Strategies
- CDN for static assets
- Edge computing via Workers
- Lazy loading for components
- Virtual scrolling for large datasets
- WebAssembly for heavy computations

## Scalability Considerations

### Horizontal Scaling
- Stateless worker architecture
- Database read replicas
- Queue-based agent processing
- Distributed caching

### Vertical Scaling
- Worker size optimization
- Database connection pooling
- Batch processing for bulk operations
- Resource monitoring and auto-scaling

## Error Handling

### Client-Side
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    retryable: boolean;
  };
}
```

### Server-Side
- Structured logging with correlation IDs
- Error categorization (user/system/network)
- Automatic retry for transient failures
- Dead letter queues for failed jobs

## Monitoring & Observability

### Metrics
- Request rate and latency
- Error rates by endpoint
- Agent processing times
- Database query performance

### Logging
- Structured JSON logs
- Log levels: DEBUG, INFO, WARN, ERROR
- Centralized log aggregation
- Real-time alerting

### Tracing
- Distributed tracing with OpenTelemetry
- Request flow visualization
- Performance bottleneck identification

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- API endpoint testing with Vitest
- Agent logic testing with mocked data
- Coverage target: 80%

### Integration Tests
- End-to-end user flows
- API integration testing
- Database transaction testing
- File upload/processing flows

### Performance Tests
- Load testing with k6
- Stress testing for peak usage
- Latency benchmarking
- Resource usage profiling

## Development Workflow

### Version Control
- Git flow branching model
- Feature branches from develop
- Semantic versioning
- Automated changelog generation

### CI/CD Pipeline
```yaml
stages:
  - lint
  - test
  - build
  - deploy

lint:
  - ESLint + Prettier
  - TypeScript type checking

test:
  - Unit tests
  - Integration tests
  - Coverage reports

build:
  - Frontend bundle
  - Worker compilation
  - Asset optimization

deploy:
  - Staging environment
  - Production (manual approval)
```

## Browser Support

### Supported Browsers
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Version 14+
- Mobile: iOS Safari 14+, Chrome Android

### Progressive Enhancement
- Core functionality without JavaScript
- Graceful degradation for older browsers
- Feature detection for advanced APIs
- Polyfills for critical features

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus indicators
- Alt text for images
- ARIA labels and roles

## Internationalization (Future)

### Supported Languages
- English (US) - Default
- Spanish (ES)
- French (FR)
- German (DE)

### Implementation
- i18n framework integration
- RTL layout support
- Locale-specific formatting
- Currency conversion

## Data Retention & Privacy

### Retention Policies
- Transaction data: 7 years
- Chat history: 90 days
- Uploaded files: 24 hours
- Analytics: 13 months

### Privacy Controls
- Data export functionality
- Account deletion
- Consent management
- Cookie preferences

---

*This specification is a living document and will be updated as the project evolves.*