# UncleSense - Agentic Finance App

Your Uncle's Got Your Back (and Your Budget) 🧑‍💼💰

UncleSense is a multi-agent financial analysis application that uses AI agents to analyze your bank and credit card statements, providing quirky, practical financial advice in the voice of a wise uncle.

## Features

- **Multi-Agent Analysis**: 5 specialized AI agents analyze different aspects of your finances
- **File Upload**: Support for CSV and Excel bank/credit card statements
- **Real-time Chat**: Chat with Uncle about your financial insights
- **Agent Insights**: Detailed analysis from spending, savings, risk, and data extraction agents
- **Uncle Personality**: Quirky, encouraging financial advice with humor and practical wisdom
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Architecture

- **Frontend**: Vite + React + TypeScript + TailwindCSS
- **Backend**: Cloudflare Workers with Hono framework
- **Database**: Cloudflare D1 (SQLite)
- **AI/Agents**: HuggingFace Inference API with custom agent orchestration
- **Deployment**: Cloudflare Pages + Workers

## Agent System

1. **Data Extraction Agent**: Categorizes and normalizes financial transactions
2. **Spending Analysis Agent**: Analyzes spending patterns and trends
3. **Savings Insight Agent**: Identifies saving opportunities and positive behaviors
4. **Risk Assessment Agent**: Flags concerning patterns and risks
5. **Uncle Personality Agent**: Transforms technical insights into quirky, practical advice

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- HuggingFace account and API key

### 1. Clone and Install

```bash
git clone https://github.com/birupakhya/uncle-sense-money-pal.git
cd uncle-sense-money-pal
npm install
```

### 2. Environment Setup

Set up your environment variables:
```bash
# Create .env.local file from template
./setup-env.sh

# Edit .env.local with your API keys
nano .env.local  # or use your preferred editor
```

Required variables in `.env.local`:
```
CLOUDFLARE_API_TOKEN=your_cloudflare_token_here
HUGGINGFACE_API_KEY=hf_your_huggingface_key_here
VITE_API_BASE_URL=http://localhost:8787
```

### 3. Database Setup

Set up the local D1 database:
```bash
npm run db:migrate
```

### 4. Development

Start the backend worker:
```bash
npm run worker:dev
```

In a new terminal, start the frontend:
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8787

### 5. Testing

1. Upload a CSV or Excel file with your bank/credit card transactions
2. Wait for the agents to analyze your data
3. Chat with Uncle about your financial insights
4. Explore the insights dashboard

**Sample Data**: Use `sample-transactions.csv` for testing

## File Format Requirements

Your CSV/Excel files should contain columns for:
- **Date**: Transaction date (any format)
- **Description**: Transaction description/memo
- **Amount**: Transaction amount (positive or negative)

The system will automatically detect and normalize these columns.

## Deployment

### Quick Deploy

1. Set up environment variables:
   ```bash
   ./setup-env.sh
   # Edit .env.local with your API keys
   ```

2. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

3. Deploy frontend to Cloudflare Pages:
   - Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
   - Create new project
   - Upload the `dist/` folder
   - Set environment variables in Pages settings

### Manual Deploy

1. Deploy the worker:
   ```bash
   npm run worker:deploy
   ```

2. Set up production database:
   ```bash
   npm run db:migrate:prod
   ```

3. Build and deploy frontend:
   ```bash
   npm run build
   # Upload dist/ folder to Cloudflare Pages
   ```

### Environment Variables for Production

Set these in Cloudflare Pages:
- `VITE_API_BASE_URL`: Your worker URL
- `VITE_HUGGINGFACE_API_KEY`: Your HuggingFace API key

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## API Endpoints

- `POST /api/upload` - Upload financial statements
- `POST /api/analyze` - Trigger financial analysis
- `GET /api/insights/:sessionId` - Get analysis insights
- `POST /api/chat` - Send chat message to Uncle
- `GET /api/chat/:sessionId` - Get chat history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please open a GitHub issue or contact the development team.

---

Made with ❤️ by the UncleSense team