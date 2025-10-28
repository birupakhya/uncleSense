# UncleSense LLM Integration Setup Guide

This guide provides step-by-step instructions for integrating Hugging Face LLMs with your UncleSense data extraction and spending analysis agents.

## 🎯 Overview

The integration enhances your agents with:
- **AI-powered transaction categorization** using Financial RoBERTa models
- **LLM-generated insights** for spending patterns and recommendations
- **Enhanced merchant analysis** with semantic understanding
- **Personalized financial advice** with Uncle's personality
- **Robust fallback mechanisms** for reliability

## 📋 Prerequisites

1. **Hugging Face Account**: Sign up at [huggingface.co](https://huggingface.co)
2. **API Key**: Generate a read token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. **Node.js**: Version 16+ for running tests
4. **Modern Browser**: For HTML testing interface

## 🔧 Setup Steps

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```bash
# Copy the template
cp env.template .env.local
```

Edit `.env.local` and add your Hugging Face API key:

```bash
# HuggingFace API Key
HUGGINGFACE_API_KEY=hf_your_actual_api_key_here
```

### 2. Verify Integration

Run the test suite to verify everything is working:

```bash
# Node.js test
node test-llm-integration.js

# Browser test
open test-llm-integration.html
```

### 3. Test with Sample Data

The integration includes sample transaction data for testing. You can modify the test files to use your own data.

## 🚀 Enhanced Features

### Data Extraction Agent Enhancements

**New LLM-Powered Capabilities:**
- **AI Transaction Categorization Analysis**: Deep analysis of categorization accuracy
- **AI Pattern Analysis Insights**: Advanced pattern detection and interpretation
- **AI Data Quality Assessment**: Comprehensive data quality evaluation
- **AI Merchant Analysis**: Semantic merchant relationship analysis

**Example Usage:**
```typescript
import { DataExtractionAgent } from './src/lib/agents/data-extraction';

const agent = new DataExtractionAgent(process.env.HUGGINGFACE_API_KEY);
const result = await agent.execute(transactions);

// Access LLM-generated insights
result.insights.forEach(insight => {
  console.log(`${insight.title}: ${insight.description}`);
});
```

### Spending Analysis Agent Enhancements

**New LLM-Powered Capabilities:**
- **AI Spending Pattern Analysis**: Deep spending behavior analysis
- **AI Budget Optimization Recommendations**: Personalized budget advice
- **AI Financial Health Assessment**: Comprehensive health scoring
- **AI Personalized Financial Recommendations**: Tailored action plans

**Example Usage:**
```typescript
import { SpendingAnalysisAgent } from './src/lib/agents/spending-analysis';

const agent = new SpendingAnalysisAgent(process.env.HUGGINGFACE_API_KEY);
const result = await agent.execute(transactions);

// Access hybrid analysis (rule-based + LLM)
console.log(`Analysis Method: ${result.metadata.analysis_method}`);
console.log(`LLM Insights: ${result.metadata.llm_generated_insights}`);
```

## 🧠 Model Configuration

### Available Models

The integration uses specialized models for different tasks:

```typescript
import { MODELS } from './src/lib/huggingface/client';

// Financial Analysis Models
MODELS.FINANCIAL_ROBERTA    // Transaction categorization
MODELS.FINANCIAL_SETFIT     // Merchant normalization
MODELS.FINMA_7B            // Financial reasoning

// Enhanced Models
MODELS.FLAN_T5_BASE        // Instruction following
MODELS.BLOOM_3B            // Conversational responses
MODELS.ANALYSIS_MODEL      // Financial analysis
MODELS.RECOMMENDATION_MODEL // Recommendations
MODELS.INSIGHT_MODEL       // Insights generation
```

### Model Selection

You can customize which models to use by modifying the agent constructors:

```typescript
// Use specific model for insights
const agent = new SpendingAnalysisAgent(apiKey, MODELS.FLAN_T5_BASE);
```

## 🔄 Fallback Mechanisms

The integration includes robust fallback mechanisms:

1. **API Unavailable**: Falls back to rule-based analysis
2. **Model Loading Failure**: Uses local pattern matching
3. **Low Confidence**: Provides alternative categorization
4. **Network Issues**: Continues with cached results

## 📊 Performance Optimization

### Caching Strategy

```typescript
// Models are loaded once and cached
const client = new HuggingFaceClient(apiKey);
await client.initialize(); // Loads models once
```

### Batch Processing

```typescript
// Process multiple insights efficiently
const insights = await client.generateBatchInsights(prompts, options);
```

### Error Handling

```typescript
try {
  const insight = await agent.generateFinancialInsight(prompt);
} catch (error) {
  // Graceful fallback
  console.log('Using fallback analysis methods');
}
```

## 🧪 Testing

### Unit Tests

```bash
# Run specific agent tests
node -e "
import('./src/lib/agents/data-extraction.js').then(module => {
  const agent = new module.DataExtractionAgent('test-key');
  return agent.execute(sampleTransactions);
}).then(result => console.log('Test passed:', result.agent_type));
"
```

### Integration Tests

```bash
# Run full test suite
node test-llm-integration.js
```

### Browser Tests

Open `test-llm-integration.html` in your browser to test the integration in a web environment.

## 🎛️ Configuration Options

### Temperature Settings

Control the creativity vs. consistency of LLM responses:

```typescript
// Conservative (more consistent)
const response = await agent.generateResponse(prompt, { temperature: 0.3 });

// Creative (more varied)
const response = await agent.generateResponse(prompt, { temperature: 0.8 });
```

### Token Limits

Control response length:

```typescript
// Short responses
const response = await agent.generateResponse(prompt, { maxTokens: 100 });

// Detailed responses
const response = await agent.generateResponse(prompt, { maxTokens: 500 });
```

## 🔍 Monitoring and Debugging

### Enable Debug Logging

```typescript
// Set debug mode
process.env.DEBUG = 'true';
```

### Monitor Performance

```typescript
// Track API usage
const startTime = Date.now();
const result = await agent.execute(transactions);
const duration = Date.now() - startTime;
console.log(`Analysis completed in ${duration}ms`);
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify key is correct and has read permissions
   - Check if key is properly set in environment variables

2. **Models Not Loading**
   - Check internet connection
   - Verify model names are correct
   - Check Hugging Face service status

3. **Slow Performance**
   - Use quantized models
   - Implement caching
   - Reduce token limits

4. **Low Quality Insights**
   - Adjust temperature settings
   - Improve prompt quality
   - Use more specific models

### Debug Commands

```bash
# Test API connectivity
curl -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
     https://api-inference.huggingface.co/models/google/flan-t5-base

# Check environment variables
echo $HUGGINGFACE_API_KEY
```

## 📈 Next Steps

1. **Custom Model Training**: Fine-tune models on your specific transaction data
2. **Real-time Processing**: Implement streaming for live transaction analysis
3. **Multi-language Support**: Extend to non-English transaction descriptions
4. **Advanced Analytics**: Add more sophisticated financial metrics
5. **Integration Testing**: Test with real banking data

## 🤝 Contributing

When contributing to the LLM integration:

1. Test with various transaction types and amounts
2. Ensure fallback mechanisms work correctly
3. Update documentation for new features
4. Consider performance implications
5. Maintain backward compatibility

## 📚 Additional Resources

- [Hugging Face Documentation](https://huggingface.co/docs)
- [Financial Models Hub](https://huggingface.co/models?pipeline_tag=text-classification&search=financial)
- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js)
- [UncleSense Architecture Guide](./README.md)

---

**Need Help?** Check the troubleshooting section or open an issue in the repository.
