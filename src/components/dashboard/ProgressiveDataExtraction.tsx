import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search,
  Edit3,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Transaction, ParsedTransaction } from "@/types";

interface ProgressiveDataExtractionProps {
  transactions: ParsedTransaction[];
  onDataValidated: (validatedTransactions: Transaction[]) => void;
  onDataQualityUpdate: (score: number) => void;
}

interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  overall: number;
}

interface ValidationStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  description: string;
}

const ProgressiveDataExtraction = ({ 
  transactions, 
  onDataValidated, 
  onDataQualityUpdate 
}: ProgressiveDataExtractionProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([]);
  const [dataQuality, setDataQuality] = useState<DataQualityMetrics>({
    completeness: 0,
    accuracy: 0,
    consistency: 0,
    overall: 0
  });
  const [previewTransactions, setPreviewTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const steps: ValidationStep[] = [
    {
      id: 'parse',
      name: 'File Parsing',
      status: 'complete',
      progress: 100,
      description: 'Extracting data from uploaded file'
    },
    {
      id: 'categorize',
      name: 'Transaction Categorization',
      status: 'processing',
      progress: 0,
      description: 'AI is categorizing your transactions'
    },
    {
      id: 'normalize',
      name: 'Merchant Normalization',
      status: 'pending',
      progress: 0,
      description: 'Grouping similar merchants together'
    },
    {
      id: 'validate',
      name: 'Data Validation',
      status: 'pending',
      progress: 0,
      description: 'Checking data quality and completeness'
    },
    {
      id: 'review',
      name: 'Manual Review',
      status: 'pending',
      progress: 0,
      description: 'Review and edit transaction data'
    }
  ];

  useEffect(() => {
    setValidationSteps(steps);
    processTransactions();
  }, [transactions]);

  const processTransactions = async () => {
    setIsValidating(true);
    
    // Simulate progressive processing
    for (let i = 1; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setValidationSteps(prev => prev.map((step, index) => {
        if (index === i) {
          return { ...step, status: 'processing', progress: 0 };
        }
        return step;
      }));

      // Simulate processing
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setValidationSteps(prev => prev.map((step, index) => {
          if (index === i && step.status === 'processing') {
            return { ...step, progress };
          }
          return step;
        }));
      }

      setValidationSteps(prev => prev.map((step, index) => {
        if (index === i) {
          return { ...step, status: 'complete', progress: 100 };
        }
        return step;
      }));
    }

    // Generate preview data
    const processedTransactions: Transaction[] = transactions.map((t, index) => ({
      id: `txn-${index}`,
      upload_id: 'upload-1',
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: categorizeTransaction(t.description),
      merchant: normalizeMerchant(t.description),
      account_type: 'checking'
    }));

    setPreviewTransactions(processedTransactions);
    calculateDataQuality(processedTransactions);
    setIsValidating(false);
    
    toast({
      title: "Data processing complete! 🎉",
      description: "Review your transactions below and make any necessary edits.",
    });
  };

  const categorizeTransaction = (description: string): string => {
    const desc = description.toLowerCase();
    
    if (desc.includes('grocery') || desc.includes('food') || desc.includes('supermarket')) {
      return 'Food & Groceries';
    }
    if (desc.includes('gas') || desc.includes('fuel') || desc.includes('station')) {
      return 'Transportation';
    }
    if (desc.includes('coffee') || desc.includes('starbucks') || desc.includes('cafe')) {
      return 'Food & Dining';
    }
    if (desc.includes('amazon') || desc.includes('online') || desc.includes('shop')) {
      return 'Shopping';
    }
    if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('housing')) {
      return 'Housing';
    }
    if (desc.includes('utility') || desc.includes('electric') || desc.includes('water')) {
      return 'Utilities';
    }
    
    return 'Other';
  };

  const normalizeMerchant = (description: string): string => {
    // Simple merchant normalization
    const desc = description.toLowerCase();
    
    if (desc.includes('starbucks')) return 'Starbucks';
    if (desc.includes('amazon')) return 'Amazon';
    if (desc.includes('target')) return 'Target';
    if (desc.includes('walmart')) return 'Walmart';
    if (desc.includes('shell') || desc.includes('exxon')) return 'Gas Station';
    
    return description;
  };

  const calculateDataQuality = (transactions: Transaction[]) => {
    const total = transactions.length;
    const complete = transactions.filter(t => t.date && t.description && t.amount).length;
    const categorized = transactions.filter(t => t.category && t.category !== 'Other').length;
    const normalized = transactions.filter(t => t.merchant && t.merchant !== t.description).length;

    const completeness = (complete / total) * 100;
    const accuracy = (categorized / total) * 100;
    const consistency = (normalized / total) * 100;
    const overall = (completeness + accuracy + consistency) / 3;

    const quality: DataQualityMetrics = {
      completeness,
      accuracy,
      consistency,
      overall
    };

    setDataQuality(quality);
    onDataQualityUpdate(overall);
  };

  const handleTransactionEdit = (transactionId: string, field: string, value: string) => {
    setPreviewTransactions(prev => prev.map(t => 
      t.id === transactionId ? { ...t, [field]: value } : t
    ));
  };

  const handleSaveTransaction = (transactionId: string) => {
    setEditingTransaction(null);
    calculateDataQuality(previewTransactions);
    toast({
      title: "Transaction updated",
      description: "Your changes have been saved.",
    });
  };

  const handleValidateData = () => {
    onDataValidated(previewTransactions);
    toast({
      title: "Data validated! ✅",
      description: "Your transactions are ready for analysis.",
    });
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Data Extraction Progress
          </CardTitle>
          <CardDescription>
            Uncle is processing your financial data step by step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validationSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getStepIcon(step.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{step.name}</span>
                    <span className="text-sm text-muted-foreground">{step.progress}%</span>
                  </div>
                  <Progress value={step.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Score */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Assessment</CardTitle>
          <CardDescription>
            How well did Uncle extract your transaction data?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(dataQuality.completeness)}`}>
                {dataQuality.completeness.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Completeness</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(dataQuality.accuracy)}`}>
                {dataQuality.accuracy.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(dataQuality.consistency)}`}>
                {dataQuality.consistency.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Consistency</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(dataQuality.overall)}`}>
                {dataQuality.overall.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Overall</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Transaction Preview
          </CardTitle>
          <CardDescription>
            Review and edit your transactions before analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {previewTransactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <Checkbox defaultChecked />
                
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    {editingTransaction === transaction.id ? (
                      <input
                        type="date"
                        value={transaction.date}
                        onChange={(e) => handleTransactionEdit(transaction.id, 'date', e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    {editingTransaction === transaction.id ? (
                      <input
                        type="text"
                        value={transaction.description}
                        onChange={(e) => handleTransactionEdit(transaction.id, 'description', e.target.value)}
                        className="text-sm border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    {editingTransaction === transaction.id ? (
                      <select
                        value={transaction.category}
                        onChange={(e) => handleTransactionEdit(transaction.id, 'category', e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="Food & Groceries">Food & Groceries</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Housing">Housing</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-sm font-semibold">
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {editingTransaction === transaction.id ? (
                    <>
                      <Button size="sm" onClick={() => handleSaveTransaction(transaction.id)}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingTransaction(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditingTransaction(transaction.id)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {previewTransactions.length > 10 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Showing first 10 transactions. {previewTransactions.length - 10} more available.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {previewTransactions.length} transactions ready for analysis
            </div>
            <Button onClick={handleValidateData} disabled={isValidating}>
              Validate & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressiveDataExtraction;
