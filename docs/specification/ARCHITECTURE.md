# Architecture Specification

## Executive Summary

UncleSense is designed as a modern, scalable web application with a clear path to mobile platforms. The architecture emphasizes separation of concerns between deterministic components (data processing, ML/analytics) and non-deterministic components (UI/UX, personality), all orchestrated through an intelligent agent system.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Web App (React)  │  iOS App (Future)  │  Android (Future)  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Gateway                          │
├─────────────────────────────────────────────────────────────┤
│              Cloudflare Workers (Edge Computing)             │
│                    Authentication/Rate Limiting              │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Agent Orchestrator                       │
├─────────────────────────────────────────────────────────────┤
│  Workflow Engine  │  Task Queue  │  Agent Communication     │
└─────────────────────────────────────────────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        ▼                                             ▼
┌─────────────────────┐                    ┌──────────────────┐
│ Deterministic Layer │                    │Non-Deterministic │
├─────────────────────┤                    ├──────────────────┤
│ • Data Extraction   │                    │ • Uncle AI       │
│ • Analytics Engine  │                    │ • Chat Interface │
│ • ML Models         │                    │ • Tone Adapter   │
│ • Risk Calculator   │                    │ • UI Generation  │
└─────────────────────┘                    └──────────────────┘
        │                                             │
        └──────────────────────┬──────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
├─────────────────────────────────────────────────────────────┤
│   D1 Database   │   Vector Store   │   Object Storage (R2)  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Client Layer

#### Web Application (Current)
- **Framework**: React 18 with TypeScript
- **State Management**: React Query + Context API
- **UI Components**: shadcn/ui (Radix UI + TailwindCSS)
- **Build System**: Vite
- **Key Features**:
  - Progressive Web App capabilities
  - Offline-first architecture
  - Real-time updates via SSE/WebSockets

#### Mobile Applications (Future)
- **iOS**: React Native or Swift (TBD)
- **Android**: React Native or Kotlin (TBD)
- **Shared Logic**: TypeScript core library
- **Native Features**: Biometric auth, push notifications

### 2. API Gateway Layer

#### Cloudflare Workers
- **Purpose**: Edge computing for low latency
- **Responsibilities**:
  - Request routing
  - Authentication/Authorization
  - Rate limiting
  - Request/Response transformation
  - CORS handling

#### API Design
- **Protocol**: REST with GraphQL consideration for v2
- **Format**: JSON with MessagePack for binary data
- **Versioning**: URL-based (v1, v2)
- **Documentation**: OpenAPI 3.0 specification

### 3. Agent Orchestration Layer

#### Core Orchestrator
```typescript
interface Orchestrator {
  // Manages agent lifecycle
  registerAgent(agent: Agent): void;
  
  // Executes workflows
  executeWorkflow(workflow: Workflow): Promise<Result>;
  
  // Handles inter-agent communication
  publishEvent(event: AgentEvent): void;
  subscribeToEvents(handler: EventHandler): void;
}
```

#### Agent Communication Protocol
- **Message Queue**: In-memory for v1, Redis/RabbitMQ for scale
- **Event Bus**: Pub/Sub pattern for agent coordination
- **Workflow Engine**: State machine for complex flows

### 4. Deterministic Components

#### Data Extraction Pipeline
```
Raw File → Parser → Normalizer → Categorizer → Storage
```

- **Parser**: Handles CSV, Excel, PDF (future)
- **Normalizer**: Standardizes date, amount, description formats
- **Categorizer**: ML-based transaction categorization
- **Validation**: Schema validation with Zod

#### Analytics Engine
- **Time Series Analysis**: Spending trends, seasonality
- **Statistical Analysis**: Mean, median, standard deviation
- **Anomaly Detection**: Z-score, isolation forest
- **Forecasting**: ARIMA models for budget predictions

#### ML/Data Science Stack
```typescript
interface MLPipeline {
  // Feature extraction
  extractFeatures(transactions: Transaction[]): Features;
  
  // Model inference
  predict(features: Features): Predictions;
  
  // Model monitoring
  logPrediction(prediction: Prediction): void;
}
```

- **Models**:
  - Transaction categorization (FinBERT)
  - Spending pattern detection (Custom CNN)
  - Risk assessment (XGBoost)
  - Savings opportunity identification (Rule engine + ML)

### 5. Non-Deterministic Components

#### Uncle Personality Engine
```typescript
interface PersonalityEngine {
  // Adapts tone based on user profile
  adaptTone(message: string, userProfile: UserProfile): string;
  
  // Generates contextual responses
  generateResponse(context: Context): Promise<Response>;
  
  // Maintains conversation coherence
  updateConversationState(message: Message): void;
}
```

#### Tone Adaptation System
- **User Profiles**: Gen-Z, Millennial, Gen-X, Boomer
- **Communication Styles**: Formal, Casual, Humorous, Encouraging
- **Context Awareness**: Financial situation, emotional state
- **Cultural Sensitivity**: Regional idioms and references

#### UI/UX Generation
- **Dynamic Dashboards**: Based on user data and preferences
- **Adaptive Layouts**: Responsive to user behavior
- **Theme Engine**: Light/dark/custom themes
- **Micro-interactions**: Delightful animations and feedback

### 6. Data Layer Architecture

#### Database Design (D1/SQLite)
```sql
-- Core schema relationships
Users ←→ Sessions ←→ Uploads ←→ Transactions
  ↓        ↓          ↓           ↓
Preferences  Chats   Analysis   Categories
```

#### Vector Store (Future)
- **Purpose**: Semantic search, recommendation engine
- **Technology**: Cloudflare Vectorize or Pinecone
- **Use Cases**:
  - Similar transaction finding
  - Personalized advice matching
  - FAQ semantic search

#### Object Storage (R2)
- **Purpose**: Large file storage, backups
- **Structure**:
  ```
  /uploads/{user_id}/{upload_id}/original.csv
  /exports/{user_id}/{export_id}/report.pdf
  /models/{model_version}/{model_name}.onnx
  ```

## Security Architecture

### Authentication Flow
```
Client → API Gateway → Auth Service → Token Generation
   ↓                                          ↓
Session Storage ← Refresh Token ← Access Token
```

### Data Security Layers
1. **Transport**: TLS 1.3 minimum
2. **Application**: Input validation, output encoding
3. **Storage**: Encryption at rest, key rotation
4. **Access**: Row-level security, audit logging

### Privacy by Design
- **Data Minimization**: Only collect necessary data
- **Purpose Limitation**: Clear data usage policies
- **Anonymization**: PII removal in analytics
- **User Control**: Data export/deletion capabilities

## Scalability Strategy

### Phase 1: MVP (Current)
- **Users**: 1-10K
- **Infrastructure**: Single region, basic caching
- **Cost**: Cloudflare free tier + minimal

### Phase 2: Growth
- **Users**: 10K-100K
- **Infrastructure**: Multi-region, Redis caching
- **Features**: Real-time collaboration, advanced ML
- **Cost**: ~$500-2000/month

### Phase 3: Scale
- **Users**: 100K-1M+
- **Infrastructure**: Global edge network, dedicated clusters
- **Features**: Mobile apps, B2B offerings
- **Cost**: Custom enterprise pricing

### Performance Optimization
1. **Edge Caching**: Static assets, API responses
2. **Database Optimization**: Indexes, query optimization
3. **Code Splitting**: Lazy loading, tree shaking
4. **Asset Optimization**: WebP images, Brotli compression

## Monitoring & Observability

### Metrics Collection
```typescript
interface Metrics {
  // Business metrics
  activeUsers: Counter;
  uploadsProcessed: Counter;
  
  // Technical metrics
  apiLatency: Histogram;
  errorRate: Gauge;
  
  // Agent metrics
  agentProcessingTime: Histogram;
  agentSuccessRate: Gauge;
}
```

### Logging Strategy
- **Structured Logging**: JSON format
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Correlation IDs**: Trace requests across services
- **Retention**: 30 days hot, 1 year cold storage

### Alerting Rules
1. **P0**: Service down, data loss risk
2. **P1**: Degraded performance, high error rate
3. **P2**: Anomalous patterns, capacity warnings

## Development & Deployment

### CI/CD Pipeline
```yaml
Pipeline:
  - Lint & Format
  - Type Check
  - Unit Tests (>80% coverage)
  - Integration Tests
  - Security Scan
  - Build & Bundle
  - Deploy to Staging
  - E2E Tests
  - Production Deploy (manual approval)
```

### Environment Strategy
1. **Local**: Full stack on developer machine
2. **Preview**: Per-PR deployments
3. **Staging**: Production mirror
4. **Production**: Blue-green deployment

### Feature Flags
```typescript
interface FeatureFlags {
  // Gradual rollout
  enableNewDashboard: { percentage: 20 };
  
  // A/B testing
  chatUIVariant: { variants: ['A', 'B'] };
  
  // Kill switches
  enableMLPredictions: { enabled: true };
}
```

## Future Considerations

### Platform Evolution
1. **Web**: Continue as primary platform
2. **Mobile**: Native apps by Q3 2025
3. **API**: Public API for partners
4. **Integrations**: Bank APIs, accounting software

### Technology Upgrades
- **GraphQL**: For mobile app efficiency
- **gRPC**: For internal service communication
- **WebAssembly**: For client-side ML inference
- **Blockchain**: For audit trails (research phase)

### AI/ML Roadmap
1. **Current**: Rule-based + basic ML
2. **6 months**: Custom financial LLM
3. **1 year**: Predictive analytics
4. **2 years**: Autonomous financial assistant

---

*This architecture is designed to scale from MVP to millions of users while maintaining flexibility for future requirements.*