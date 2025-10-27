// Insights Dashboard Component

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  PiggyBank,
  Shield,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type { Insight, Transaction } from "@/types";

interface InsightsDashboardProps {
  sessionId?: string;
}

const InsightsDashboard = ({ sessionId }: InsightsDashboardProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadInsights();
    }
  }, [sessionId]);

  const loadInsights = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.getInsights(sessionId);
      if (response.success && response.data) {
        setInsights(response.data.insights);
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
      toast({
        title: "Failed to load insights",
        description: "Couldn't fetch your financial insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'spending_analysis':
        return <BarChart3 className="w-5 h-5" />;
      case 'savings_insight':
        return <PiggyBank className="w-5 h-5" />;
      case 'risk_assessment':
        return <Shield className="w-5 h-5" />;
      case 'uncle_personality':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'negative':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const formatAgentType = (agentType: string) => {
    return agentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.agent_type]) {
      acc[insight.agent_type] = [];
    }
    acc[insight.agent_type].push(insight);
    return acc;
  }, {} as Record<string, Insight[]>);

  if (!sessionId) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            Your Financial Insights
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Upload your statements to see Uncle's analysis of your finances
          </p>
          <div className="bg-card rounded-2xl p-12 border border-border">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No insights yet</h3>
            <p className="text-muted-foreground">
              Upload your bank or credit card statements to get personalized financial insights from Uncle!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-4xl font-display font-bold mb-4">
          What Uncle Found
        </h2>
        <p className="text-xl text-muted-foreground">
          Your personalized financial insights and recommendations
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center">
          <div className="bg-card rounded-2xl p-12 border border-border">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analysis in progress</h3>
            <p className="text-muted-foreground">
              Uncle is analyzing your transactions. This might take a moment...
            </p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue={Object.keys(groupedInsights)[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {Object.keys(groupedInsights).map((agentType) => (
              <TabsTrigger key={agentType} value={agentType} className="flex items-center gap-2">
                {getAgentIcon(agentType)}
                {formatAgentType(agentType)}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedInsights).map(([agentType, agentInsights]) => (
            <TabsContent key={agentType} value={agentType} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {agentInsights.map((insight) => (
                  <Card key={insight.id} className="hover-lift transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getAgentIcon(agentType)}
                          <CardTitle className="text-lg">{insight.insight_data.title}</CardTitle>
                        </div>
                        <Badge className={`${getSentimentColor(insight.sentiment)} flex items-center gap-1`}>
                          {getSentimentIcon(insight.sentiment)}
                          {insight.sentiment}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {insight.insight_data.description}
                      </CardDescription>
                      
                      {insight.insight_data.key_numbers && (
                        <div className="space-y-2 mb-4">
                          {Object.entries(insight.insight_data.key_numbers).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{key}:</span>
                              <span className="font-semibold">
                                {typeof value === 'number' && key.toLowerCase().includes('amount') 
                                  ? `$${value.toLocaleString()}` 
                                  : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {insight.insight_data.recommendations && insight.insight_data.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Recommendations:</h4>
                          <ul className="space-y-1">
                            {insight.insight_data.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {transactions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Total Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Categories Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {new Set(transactions.map(t => t.category)).size}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
};

export default InsightsDashboard;