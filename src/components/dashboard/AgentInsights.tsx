import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  PiggyBank, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface AgentInsightsProps {
  hasFiles: boolean;
}

type AgentType = "spending" | "savings" | "risk" | "extraction";
type SentimentType = "positive" | "warning" | "alert";

interface Insight {
  id: number;
  agentName: string;
  agentType: AgentType;
  title: string;
  description: string;
  keyNumber?: string;
  sentiment: SentimentType;
  timestamp: Date;
  chartType?: "bar" | "progress" | "trend";
}

const AgentInsights = ({ hasFiles }: AgentInsightsProps) => {
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const mockInsights: Insight[] = [
    {
      id: 1,
      agentName: "Spending Detective",
      agentType: "spending",
      title: "Coffee expenses up 45% this month",
      description: "You've spent $127 on coffee this month. That's $40 more than your average. Maybe brew at home a few days?",
      keyNumber: "$127",
      sentiment: "warning",
      timestamp: new Date(Date.now() - 300000),
      chartType: "trend"
    },
    {
      id: 2,
      agentName: "Savings Spotter",
      agentType: "savings",
      title: "Great job on groceries! 🎉",
      description: "Your grocery spending is down 23% compared to last month. You've saved an extra $120!",
      keyNumber: "$120",
      sentiment: "positive",
      timestamp: new Date(Date.now() - 600000),
      chartType: "progress"
    },
    {
      id: 3,
      agentName: "Risk Radar",
      agentType: "risk",
      title: "Unusual transaction detected",
      description: "A $450 charge at 'TechStore' is 3x higher than your typical purchases there. Want to verify this?",
      keyNumber: "$450",
      sentiment: "alert",
      timestamp: new Date(Date.now() - 900000),
    },
    {
      id: 4,
      agentName: "Data Extraction Agent",
      agentType: "extraction",
      title: "Statement processed successfully",
      description: "Extracted 87 transactions from your January statement. All categories identified and ready for analysis.",
      keyNumber: "87",
      sentiment: "positive",
      timestamp: new Date(Date.now() - 1200000),
    },
  ];

  const getAgentIcon = (type: AgentType) => {
    switch (type) {
      case "spending":
        return <TrendingUp className="w-5 h-5" />;
      case "savings":
        return <PiggyBank className="w-5 h-5" />;
      case "risk":
        return <Shield className="w-5 h-5" />;
      case "extraction":
        return <Search className="w-5 h-5" />;
    }
  };

  const getAgentColor = (type: AgentType) => {
    switch (type) {
      case "spending":
        return "bg-primary/10 text-primary";
      case "savings":
        return "bg-success/10 text-success";
      case "risk":
        return "bg-warning/10 text-warning";
      case "extraction":
        return "bg-accent/10 text-accent-foreground";
    }
  };

  const getSentimentColor = (sentiment: SentimentType) => {
    switch (sentiment) {
      case "positive":
        return "border-success/50 bg-success/5";
      case "warning":
        return "border-warning/50 bg-warning/5";
      case "alert":
        return "border-destructive/50 bg-destructive/5";
    }
  };

  const getSentimentBadge = (sentiment: SentimentType) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-success text-white">Good News</Badge>;
      case "warning":
        return <Badge className="bg-warning text-white">Heads Up</Badge>;
      case "alert":
        return <Badge className="bg-destructive text-white">Action Needed</Badge>;
    }
  };

  if (!hasFiles) {
    return (
      <Card className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-12 text-center">
        <div className="w-32 h-32 bg-gradient-warm rounded-full flex items-center justify-center mb-6 animate-bounce-in">
          <Sparkles className="w-16 h-16 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-display font-bold mb-3">Upload a statement to get started!</h3>
        <p className="text-muted-foreground max-w-md">
          Uncle's ready to analyze your spending and help you save. Just drop your bank statement in the left panel.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold">What Uncle Found</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="spending">Spending</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="risk">Risks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Insights Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          // Loading skeletons
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : (
          mockInsights.map((insight) => (
            <Card 
              key={insight.id} 
              className={`p-6 border-2 transition-all duration-300 hover:shadow-hover animate-slide-up ${getSentimentColor(insight.sentiment)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getAgentColor(insight.agentType)}`}>
                    {getAgentIcon(insight.agentType)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{insight.agentName}</p>
                    <h3 className="font-display font-bold text-lg">{insight.title}</h3>
                  </div>
                </div>
                {getSentimentBadge(insight.sentiment)}
              </div>

              <p className="text-muted-foreground mb-4">
                {insight.description}
              </p>

              {insight.keyNumber && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="px-4 py-2 bg-card rounded-lg border border-border">
                    <span className="text-2xl font-display font-bold">{insight.keyNumber}</span>
                  </div>
                  {insight.sentiment === "positive" && (
                    <TrendingDown className="w-5 h-5 text-success" />
                  )}
                  {insight.sentiment === "warning" && (
                    <TrendingUp className="w-5 h-5 text-warning" />
                  )}
                  {insight.sentiment === "alert" && (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {insight.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary hover:bg-primary/10"
                >
                  Ask Uncle About This
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
};

export default AgentInsights;
