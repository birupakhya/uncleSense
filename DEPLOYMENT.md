# UncleSense Deployment Guide

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Cloudflare API Token**: Create at [developers.cloudflare.com/fundamentals/api/get-started/create-token/](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
3. **HuggingFace API Key**: Get from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

## Deployment Steps

### 1. Set Up Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" template
4. Set permissions:
   - **Account**: `Cloudflare D1:Edit`
   - **Zone**: `Zone:Read`, `Zone Settings:Edit`
   - **Account**: `Account Settings:Read`
5. Set account resources to include your account
6. Copy the token and set it as an environment variable:

```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
```

### 2. Deploy the Backend Worker

```bash
# Deploy the Cloudflare Worker
npm run worker:deploy
```

This will deploy your API to `unclesense-api.your-subdomain.workers.dev`

### 3. Set Up Production Database

```bash
# Run database migrations in production
npm run db:migrate:prod
```

### 4. Deploy Frontend to Cloudflare Pages

#### Option A: Using Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard > Pages](https://dash.cloudflare.com/pages)
2. Click "Create a project"
3. Choose "Upload assets"
4. Upload the `dist/` folder from your build
5. Set project name: `unclesense`
6. Deploy

#### Option B: Using Wrangler CLI

```bash
# Install Pages CLI
npm install -g wrangler

# Deploy to Pages
wrangler pages deploy dist --project-name=unclesense
```

### 5. Configure Environment Variables

In Cloudflare Pages dashboard:
1. Go to your project settings
2. Add environment variables:
   - `VITE_API_BASE_URL`: `https://unclesense-api.your-subdomain.workers.dev`
   - `VITE_HUGGINGFACE_API_KEY`: Your HuggingFace API key

### 6. Update API Base URL

Update the frontend to use the production API URL:

```typescript
// In src/lib/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://unclesense-api.your-subdomain.workers.dev';
```

## Production URLs

After deployment, your app will be available at:
- **Frontend**: `https://unclesense.pages.dev`
- **API**: `https://unclesense-api.your-subdomain.workers.dev`

## Testing Production Deployment

1. Visit your Cloudflare Pages URL
2. Upload a sample CSV file with financial data
3. Test the chat functionality
4. Verify insights are generated correctly

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Cloudflare Worker has CORS headers
2. **Database Connection**: Verify D1 database is properly configured
3. **API Key Issues**: Check HuggingFace API key is valid and has sufficient credits
4. **Build Errors**: Ensure all dependencies are installed and TypeScript compiles

### Debug Commands

```bash
# Check worker logs
wrangler tail

# Test local worker
wrangler dev

# Check database
wrangler d1 execute unclesense-db --command "SELECT * FROM users LIMIT 5"
```

## Monitoring

- **Cloudflare Analytics**: Monitor traffic and performance
- **Worker Logs**: Check for errors in Cloudflare Dashboard
- **D1 Database**: Monitor usage and performance

## Scaling Considerations

- **Free Tier Limits**:
  - Cloudflare Workers: 100,000 requests/day
  - Cloudflare D1: 5GB storage, 25M reads/day
  - HuggingFace: Rate limits based on model

- **Upgrade Path**:
  - Cloudflare Pro: $20/month for higher limits
  - HuggingFace Pro: $9/month for higher rate limits
  - Consider caching strategies for frequently accessed data

## Security Notes

- Keep API keys secure and never commit them to version control
- Use Cloudflare's security features (WAF, Bot Management)
- Regularly rotate API keys
- Monitor for unusual activity

## Support

For deployment issues:
1. Check Cloudflare status page
2. Review Cloudflare documentation
3. Check HuggingFace API status
4. Open an issue in the repository
