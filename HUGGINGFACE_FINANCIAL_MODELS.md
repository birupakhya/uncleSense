# Hugging Face Financial Models Integration

This document describes the integration of Hugging Face financial models for the UncleSense data extraction agent.

## Overview

The data extraction agent now uses specialized Hugging Face models to perform:

1. **Transaction Categorization** - Using Financial RoBERTa model
2. **Merchant Name Normalization** - Using SetFit financial text embeddings
3. **Pattern Detection** - Using statistical analysis and anomaly detection
4. **Data Quality Scoring** - Based on model confidence and categorization accuracy

## Models Used

### 1. Financial RoBERTa (`soleimanian/financial-roberta-large-sentiment`)
- **Purpose**: Transaction categorization and sentiment analysis
- **Input**: Transaction description + amount
- **Output**: Category with confidence score
- **Categories**: 15 predefined financial categories

### 2. SetFit Financial Text (`nickmuchi/setfit-finetuned-financial-text`)
- **Purpose**: Merchant name normalization and clustering
- **Input**: Merchant names/descriptions
- **Output**: Embeddings for similarity comparison
- **Use Case**: Grouping similar merchant names (e.g., "AMZN", "Amazon.com", "AMAZON Mktplace")

### 3. FinMA 7B (`TheFinAI/finma-7b-full`)
- **Purpose**: Financial pattern analysis and reasoning
- **Input**: Transaction patterns and temporal data
- **Output**: Pattern descriptions and frequency analysis
- **Use Case**: Detecting recurring subscriptions and unusual spending patterns

## Implementation Details

### FinancialModelsClient Class

The `FinancialModelsClient` class provides a unified interface for all financial model operations:

```typescript
import { FinancialModelsClient } from './src/lib/huggingface/financial-models';

const client = new FinancialModelsClient();
await client.initialize();

// Categorize a transaction
const category = await client.categorizeTransaction("AMZN Mktp US *23AB4", -45.99);

// Normalize merchant names
const normalization = await client.normalizeMerchantNames([
  "AMZN", "Amazon.com*123", "AMAZON Mktplace"
]);

// Detect recurring patterns
const pattern = await client.detectRecurringPattern(
  "Netflix", 
  [-15.99, -15.99, -15.99], 
  ["2024-01-15", "2024-01-14", "2024-01-13"]
);
```

### Transaction Categories

The system categorizes transactions into 15 predefined categories:

- Groceries & Food
- Dining & Restaurants
- Transportation
- Utilities & Bills
- Entertainment & Recreation
- Shopping & Retail
- Healthcare & Medical
- Insurance
- Subscriptions & Services
- Travel & Hotels
- Education
- Investments & Savings
- Income & Deposits
- Transfers
- Other

### Pattern Detection

The system detects:

1. **Recurring Transactions**: Monthly subscriptions, weekly payments, etc.
2. **Unusual Transactions**: Amounts significantly different from typical patterns
3. **Merchant Clustering**: Groups similar merchant names together

### Data Quality Scoring

The data quality score is calculated based on:

- **Confidence Score**: Percentage of transactions with high confidence (>0.8)
- **Categorization Score**: Percentage of transactions successfully categorized (not "Other")
- **Final Score**: Average of confidence and categorization scores

## Usage Examples

### Basic Transaction Analysis

```typescript
import { DataExtractionAgent } from './src/lib/agents/data-extraction';

const agent = new DataExtractionAgent();
const transactions = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'NETFLIX.COM',
    amount: -15.99,
    category: '',
    merchant: '',
    account: 'checking'
  }
];

const result = await agent.execute(transactions);
console.log(result.metadata.categorized_transactions);
```

### Testing the Integration

1. **Node.js Test**: Run `node test-financial-models.js`
2. **Browser Test**: Open `test-financial-models.html` in a web browser
3. **Unit Tests**: The models include fallback mechanisms for testing without API access

## Fallback Mechanisms

The implementation includes robust fallback mechanisms:

1. **Model Loading Failure**: Falls back to rule-based categorization
2. **API Errors**: Uses local pattern matching and heuristics
3. **Low Confidence**: Provides alternative categorization methods
4. **Network Issues**: Continues operation with cached results

## Performance Considerations

- **Model Loading**: Models are loaded once and cached for subsequent use
- **Batch Processing**: Multiple transactions are processed efficiently
- **Quantized Models**: Uses quantized versions for faster inference
- **Error Handling**: Graceful degradation when models are unavailable

## Configuration

### Environment Variables

```bash
# Hugging Face API Key (required for Inference API)
HUGGINGFACE_API_KEY=your_api_key_here

# Model Configuration (optional)
HF_MODELS_CACHE_DIR=./models
HF_MODELS_QUANTIZED=true
```

### Model Selection

You can customize which models to use by modifying the `FinancialModelsClient` constructor:

```typescript
const client = new FinancialModelsClient({
  classificationModel: 'soleimanian/financial-roberta-large-sentiment',
  embeddingModel: 'nickmuchi/setfit-finetuned-financial-text',
  patternModel: 'TheFinAI/finma-7b-full'
});
```

## Troubleshooting

### Common Issues

1. **Model Loading Errors**: Check internet connection and API key
2. **Low Categorization Accuracy**: Verify transaction descriptions are clear
3. **Pattern Detection Issues**: Ensure sufficient transaction history
4. **Performance Issues**: Consider using quantized models or local inference

### Debug Mode

Enable debug logging by setting:

```typescript
const client = new FinancialModelsClient();
client.setDebugMode(true);
```

## Future Enhancements

- **Custom Model Training**: Fine-tune models on specific transaction data
- **Real-time Processing**: Stream processing for live transaction analysis
- **Multi-language Support**: Extend to non-English transaction descriptions
- **Advanced Anomaly Detection**: Machine learning-based fraud detection
- **Integration with Banking APIs**: Direct integration with financial institutions

## Contributing

When contributing to the financial models integration:

1. Test with various transaction types and amounts
2. Ensure fallback mechanisms work correctly
3. Update documentation for new features
4. Consider performance implications
5. Maintain backward compatibility
