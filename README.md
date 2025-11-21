# UncleSense - Your Personal Finance Uncle 🧑‍💼💰

> *"Your Uncle's Got Your Back (and Your Budget)"*

UncleSense is an AI-powered personal finance advisor that brings fun into financial planning. By analyzing your bank and credit card statements, UncleSense provides practical, personalized financial advice in a tone you can relate to - whether you're Gen Z, Millennial, or anyone looking to achieve financial independence.

## 🎯 What is UncleSense?

UncleSense transforms boring financial data into engaging, actionable insights. Think of it as having a wise, funny uncle who:
- Understands your spending habits without judgment
- Explains complex financial concepts in your language
- Helps you plan for financial independence and retirement
- Makes personal finance fun and relatable

## ✨ Key Features

### Multi-Agent AI System
- **5 Specialized AI Agents**: Each agent focuses on different aspects of your financial health
- **Personalized Communication**: Adapts tone and language to your generation and preferences
- **Real-time Analysis**: Instant insights from your financial statements

### Core Capabilities
- **Smart File Processing**: Supports CSV and Excel formats from any bank or credit card
- **Interactive Chat**: Have natural conversations about your finances with Uncle
- **Comprehensive Dashboard**: Visual insights and spending patterns at a glance
- **Progressive Analysis**: Watch as AI agents work through your data in real-time
- **Mobile-First Design**: Full functionality on all devices

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for lightning-fast development
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: React Query for server state
- **Routing**: React Router v6

### Backend Infrastructure
- **Runtime**: Cloudflare Workers (Edge computing)
- **API Framework**: Hono (lightweight, fast)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **File Storage**: Cloudflare R2 (when needed)

### AI/ML Pipeline
- **LLM Integration**: HuggingFace Inference API
- **Financial Models**: FinBERT and custom fine-tuned models
- **Agent Orchestration**: Custom multi-agent framework
- **Vector Search**: For contextual financial insights

## 🤖 The Agent System

Our multi-agent architecture ensures comprehensive financial analysis:

1. **Data Extraction Agent** 📊
   - Intelligently parses and categorizes transactions
   - Handles various bank statement formats
   - Normalizes data for consistent analysis

2. **Spending Analysis Agent** 💳
   - Identifies spending patterns and trends
   - Detects unusual transactions
   - Provides category-wise breakdowns

3. **Savings Insight Agent** 💰
   - Discovers saving opportunities
   - Celebrates positive financial behaviors
   - Suggests actionable saving strategies

4. **Risk Assessment Agent** ⚠️
   - Flags concerning financial patterns
   - Identifies potential risks
   - Provides early warning signals

5. **Uncle Personality Agent** 🎭
   - Transforms insights into relatable advice
   - Adapts communication style to user preferences
   - Adds humor and encouragement

## 🚀 Developer Setup Guide

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Git**: For version control
- **Cloudflare Account**: Free tier works ([Sign up here](https://dash.cloudflare.com/sign-up))
- **HuggingFace Account**: For AI models ([Sign up here](https://huggingface.co/join))

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/[your-org]/unclesense.git

# Or clone via SSH (recommended)
git clone git@github.com:[your-org]/unclesense.git

cd unclesense
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Environment Configuration

#### 3.1 Create Environment Files

```bash
# Copy the environment template
cp env.template .env.local

# For production deployment
cp env.template .env.production.local
```

#### 3.2 Configure Required Variables

Edit `.env.local` with your credentials:

```bash
# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id  # Optional, for custom domains

# HuggingFace Configuration
HUGGINGFACE_API_KEY=hf_your_api_key_here
HUGGINGFACE_MODEL_ID=distilbert-base-uncased-finetuned-sst-2-english  # Default model

# API Configuration
VITE_API_BASE_URL=http://localhost:8787
VITE_APP_URL=http://localhost:5173

# Database Configuration (auto-generated)
DATABASE_URL=.wrangler/state/v3/d1/miniflare-D1DatabaseObject

# Optional: Advanced Settings
ENABLE_DEBUG_LOGS=true
MAX_FILE_SIZE_MB=10
SESSION_TIMEOUT_MINUTES=30
```

#### 3.3 Obtain API Keys

**Cloudflare API Token:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Set permissions:
   - Account: Cloudflare Workers Scripts:Edit
   - Account: D1:Edit
   - Zone: Workers Routes:Edit (if using custom domain)
5. Copy the token to `.env.local`

**HuggingFace API Key:**
1. Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Name it "UncleSense"
4. Set role to "read"
5. Copy the token to `.env.local`

### Alternative: Using Ollama for Local LLMs

For enhanced privacy and offline capability, you can run LLMs locally using Ollama instead of HuggingFace:

#### Setting up Ollama

1. **Install Ollama**
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

2. **Pull Required Models**
   ```bash
   # For general chat and personality
   ollama pull llama2:7b
   
   # For financial analysis (smaller, faster)
   ollama pull phi
   
   # For code generation (if needed)
   ollama pull codellama:7b
   ```

3. **Start Ollama Server**
   ```bash
   ollama serve
   # Default runs on http://localhost:11434
   ```

4. **Configure UncleSense for Ollama**
   
   Update your `.env.local`:
   ```bash
   # Disable HuggingFace
   # HUGGINGFACE_API_KEY=hf_your_api_key_here
   
   # Enable Ollama
   LLM_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama2:7b
   OLLAMA_EMBEDDING_MODEL=nomic-embed-text
   
   # Optional: Ollama performance settings
   OLLAMA_NUM_THREADS=8
   OLLAMA_NUM_GPU=1  # If you have GPU support
   ```

5. **Install Ollama Adapter** (if not already included)
   ```bash
   npm install ollama-js
   ```

#### Benefits of Local LLMs

- **Privacy**: All data stays on your machine
- **No API Costs**: Run unlimited queries
- **Offline Mode**: Works without internet
- **Customization**: Fine-tune models for your needs
- **Speed**: Lower latency for small models

#### Recommended Models for UncleSense

| Use Case | Model | Size | Notes |
|----------|-------|------|-------|
| General Chat | llama2:7b | 3.8GB | Best balance of quality/speed |
| Fast Analysis | phi | 1.6GB | Fastest responses |
| Financial Focus | nous-hermes2 | 7.7GB | Good financial understanding |
| Multilingual | aya:8b | 4.1GB | Supports 23 languages |

#### Performance Tips

1. **GPU Acceleration**: Install CUDA for NVIDIA GPUs
2. **Model Quantization**: Use smaller quantized versions
3. **Context Window**: Adjust based on your RAM
4. **Batch Processing**: Process multiple queries together

For detailed Ollama configuration, see [docs/development/OLLAMA_SETUP.md](./docs/development/OLLAMA_SETUP.md).

### Step 4: Database Setup

```bash
# Create local D1 database
wrangler d1 create unclesense-db --local

# Run migrations
npm run db:migrate

# Verify database
wrangler d1 execute unclesense-db --local --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### Step 5: Start Development Servers

```bash
# Terminal 1: Start the backend worker
npm run worker:dev

# Terminal 2: Start the frontend dev server
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8787
- API Documentation: http://localhost:8787/api/docs

### Step 6: Verify Installation

```bash
# Run the test suite
npm test

# Check linting
npm run lint

# Test with sample data
curl -X POST http://localhost:8787/api/upload \
  -F "file=@sample-transactions.csv" \
  -F "userId=test-user"
```

## 📁 Working with Financial Data

### Supported File Formats

- **CSV**: Comma-separated values (most common)
- **Excel**: .xlsx and .xls files
- **PDF**: Bank statements (coming soon)

### Required Columns

Your files must include these columns (names are flexible):

| Column | Description | Examples |
|--------|-------------|----------|
| **Date** | Transaction date | "2024-01-15", "01/15/2024", "15-Jan-2024" |
| **Description** | Transaction details | "STARBUCKS #1234", "Direct Deposit - Salary" |
| **Amount** | Transaction amount | "-25.50", "2500.00", "($25.50)" |

### Optional Columns

These enhance analysis if available:

| Column | Description | Benefit |
|--------|-------------|----------|
| **Category** | Transaction category | Pre-categorized analysis |
| **Account** | Account name/number | Multi-account tracking |
| **Balance** | Running balance | Cash flow analysis |
| **Type** | Credit/Debit indicator | Transaction classification |

### Data Privacy

- All data processing happens locally in your browser
- Server only stores anonymized insights
- Original files are never permanently stored
- You can delete your data anytime

## 🌐 Deployment Guide

### Option 1: Automated Deployment (Recommended)

```bash
# Run the complete deployment script
./deploy.sh --production

# This will:
# 1. Build the frontend
# 2. Deploy the worker
# 3. Run database migrations
# 4. Configure Cloudflare Pages
# 5. Set up custom domain (if provided)
```

### Option 2: Manual Deployment

#### Deploy Backend (Cloudflare Worker)

```bash
# Build and deploy worker
npm run worker:deploy:prod

# Verify deployment
curl https://unclesense-api.[your-subdomain].workers.dev/health
```

#### Deploy Frontend (Cloudflare Pages)

```bash
# Build frontend
npm run build

# Deploy to Pages via CLI
wrangler pages deploy dist/ --project-name=unclesense

# Or use the dashboard:
# 1. Go to https://dash.cloudflare.com/pages
# 2. Create new project
# 3. Connect to Git or upload dist/
```

#### Configure Production Environment

In Cloudflare Dashboard, set these variables:

**Pages Environment Variables:**
```
VITE_API_BASE_URL=https://unclesense-api.[your-subdomain].workers.dev
VITE_HUGGINGFACE_API_KEY=hf_your_production_key
VITE_APP_ENV=production
```

**Worker Environment Variables:**
```
HUGGINGFACE_API_KEY=hf_your_production_key
ENVIRONMENT=production
CORS_ORIGIN=https://unclesense.pages.dev
```

### Custom Domain Setup

```bash
# Add custom domain to Pages
wrangler pages deployment create \
  --project-name=unclesense \
  --custom-domain=app.yourdomain.com

# Configure DNS (in Cloudflare DNS)
# CNAME app -> unclesense.pages.dev
```

For detailed deployment instructions, see [docs/deployment/DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md).

## 🔌 API Reference

### Core Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload` | Upload financial statements | Yes |
| POST | `/api/analyze` | Trigger AI analysis | Yes |
| GET | `/api/insights/:sessionId` | Retrieve analysis results | Yes |
| POST | `/api/chat` | Send message to Uncle | Yes |
| GET | `/api/chat/:sessionId` | Get conversation history | Yes |
| GET | `/api/health` | Service health check | No |
| GET | `/api/docs` | API documentation | No |

### Authentication

All authenticated endpoints require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.unclesense.com/api/insights/session123
```

### Example Requests

**Upload File:**
```bash
curl -X POST https://api.unclesense.com/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@bank-statement.csv" \
  -F "userId=user123"
```

**Start Analysis:**
```bash
curl -X POST https://api.unclesense.com/api/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session123",
    "userId": "user123",
    "preferences": {
      "communicationStyle": "gen-z",
      "focusAreas": ["savings", "budgeting"]
    }
  }'
```

Full API documentation available at `/api/docs` when running locally.

## 🤝 Contributing

### Development Workflow

1. **Fork & Clone**
   ```bash
   # Fork on GitHub, then:
   git clone git@github.com:[your-username]/unclesense.git
   cd unclesense
   git remote add upstream git@github.com:[org]/unclesense.git
   ```

2. **Create Feature Branch**
   ```bash
   # Always branch from main
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

3. **Development Guidelines**
   - Follow existing code style (Prettier + ESLint)
   - Write tests for new features
   - Update documentation
   - Keep commits atomic and descriptive

4. **Testing**
   ```bash
   # Run all tests
   npm test
   
   # Run specific test suite
   npm test -- --grep "Agent"
   
   # Test coverage
   npm run test:coverage
   ```

5. **Submit Pull Request**
   - Ensure all tests pass
   - Update CHANGELOG.md
   - Fill out PR template completely
   - Link related issues

### Code Style Guide

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Styling**: TailwindCSS utility classes
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for public APIs

### Commit Message Format

```
type(scope): subject

body

footer
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Example**:
```
feat(agents): add retirement planning agent

Implemented new agent specializing in retirement savings analysis.
Integrates with existing spending analysis for holistic advice.

Closes #123
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "D1_ERROR: no such table" | Run `npm run db:migrate` |
| "Failed to fetch" CORS error | Check `CORS_ORIGIN` in worker config |
| "Invalid API key" | Verify HuggingFace key starts with `hf_` |
| Build fails on Windows | Use WSL or Git Bash |
| "Module not found" | Delete node_modules and reinstall |

### Debug Mode

Enable detailed logging:

```bash
# In .env.local
ENABLE_DEBUG_LOGS=true
LOG_LEVEL=debug

# View browser logs
localStorage.setItem('debug', 'unclesense:*')
```

## 📚 Resources

### Documentation
- [Full Documentation](./docs/README.md)
- [API Reference](./docs/api/README.md)
- [Architecture Guide](./docs/architecture/README.md)
- [Deployment Guide](./docs/deployment/README.md)

### External Links
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference/index)
- [React Documentation](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/[org]/unclesense/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[org]/unclesense/discussions)
- **Email**: support@unclesense.com
- **Discord**: [Join our community](https://discord.gg/unclesense)

---

Made with ❤️ and lots of ☕ by the UncleSense team

*Remember: Your uncle's always got your back (and your budget)!* 🧑‍💼💰