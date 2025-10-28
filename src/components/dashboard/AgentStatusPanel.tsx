import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Bot,
  Search,
  BarChart3,
  PiggyBank,
  Shield,
  Lightbulb,
  RefreshCw,
  Settings
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type { AgentStatus } from "@/types";

interface AgentStatusPanelProps {
  sessionId?: string;
  onAnalysisComplete?: () => void;
  onStatusUpdate?: (statuses: AgentStatus[]) => void;
}

const AgentStatusPanel = ({ sessionId, onAnalysisComplete, onStatusUpdate }: AgentStatusPanelProps) => {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const defaultAgents: AgentStatus[] = [
    {
      id: 'data_extraction',
      name: 'Data Extraction Agent',
      status: 'idle',
      progress: 0,
      currentTask: 'Waiting for data...',
      lastUpdate: new Date(),
      insights: []
    },
    {
      id: 'spending_analysis',
      name: 'Spending Analysis Agent',
      status: 'idle',
      progress: 0,
      currentTask: 'Waiting for data...',
      lastUpdate: new Date(),
      insights: []
    },
    {
      id: 'savings_insight',
      name: 'Savings Insight Agent',
      status: 'idle',
      progress: 0,
      currentTask: 'Waiting for data...',
      lastUpdate: new Date(),
      insights: []
    },
    {
      id: 'risk_assessment',
      name: 'Risk Assessment Agent',
      status: 'idle',
      progress: 0,
      currentTask: 'Waiting for data...',
      lastUpdate: new Date(),
      insights: []
    },
    {
      id: 'uncle_personality',
      name: 'Uncle Personality Agent',
      status: 'idle',
      progress: 0,
      currentTask: 'Waiting for insights...',
      lastUpdate: new Date(),
      insights: []
    }
  ];

  useEffect(() => {
    setAgentStatuses(defaultAgents);
    if (sessionId) {
      startAnalysis();
    }
  }, [sessionId]);

  useEffect(() => {
    if (onStatusUpdate) {
      onStatusUpdate(agentStatuses);
    }
  }, [agentStatuses, onStatusUpdate]);

  const startAnalysis = async () => {
    if (!sessionId) return;
    
    setIsPolling(true);
    try {
      const response = await apiClient.analyzeFinances(sessionId);
      if (response.success) {
        toast({
          title: "Analysis started! 🚀",
          description: "Uncle's agents are now analyzing your finances...",
        });
        pollAgentStatus();
      }
    } catch (error) {
      console.error('Failed to start analysis:', error);
      toast({
        title: "Analysis failed",
        description: "Couldn't start the analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pollAgentStatus = async () => {
    if (!sessionId || !isPolling) return;

    try {
      // Simulate agent progress for demo purposes
      const updatedStatuses = agentStatuses.map(agent => {
        if (agent.status === 'idle') {
          return {
            ...agent,
            status: 'processing' as const,
            progress: Math.min(agent.progress + Math.random() * 20, 100),
            currentTask: getCurrentTask(agent.id, agent.progress)
          };
        } else if (agent.status === 'processing' && agent.progress >= 100) {
          return {
            ...agent,
            status: 'complete' as const,
            progress: 100,
            currentTask: 'Analysis complete!'
          };
        }
        return agent;
      });

      setAgentStatuses(updatedStatuses);

      // Calculate overall progress
      const totalProgress = updatedStatuses.reduce((sum, agent) => sum + agent.progress, 0);
      const averageProgress = totalProgress / updatedStatuses.length;
      setOverallProgress(averageProgress);

      // Check if all agents are complete
      const allComplete = updatedStatuses.every(agent => agent.status === 'complete');
      if (allComplete && onAnalysisComplete) {
        setIsPolling(false);
        onAnalysisComplete();
        toast({
          title: "Analysis complete! 🎉",
          description: "Uncle has finished analyzing your finances. Check the insights tab!",
        });
      } else {
        // Continue polling
        setTimeout(pollAgentStatus, 2000);
      }
    } catch (error) {
      console.error('Failed to poll agent status:', error);
      setIsPolling(false);
    }
  };

  const getCurrentTask = (agentId: string, progress: number): string => {
    const tasks = {
      data_extraction: [
        'Parsing transaction data...',
        'Categorizing transactions...',
        'Normalizing merchant names...',
        'Detecting patterns...',
        'Calculating data quality...'
      ],
      spending_analysis: [
        'Analyzing spending patterns...',
        'Calculating category totals...',
        'Identifying trends...',
        'Comparing time periods...',
        'Generating insights...'
      ],
      savings_insight: [
        'Identifying saving opportunities...',
        'Analyzing positive behaviors...',
        'Calculating potential savings...',
        'Generating recommendations...',
        'Finalizing insights...'
      ],
      risk_assessment: [
        'Scanning for anomalies...',
        'Analyzing spending velocity...',
        'Checking for unusual patterns...',
        'Assessing financial risks...',
        'Generating alerts...'
      ],
      uncle_personality: [
        'Reading agent insights...',
        'Adding Uncle\'s personality...',
        'Generating friendly advice...',
        'Creating recommendations...',
        'Finalizing Uncle\'s response...'
      ]
    };

    const agentTasks = tasks[agentId as keyof typeof tasks] || ['Processing...'];
    const taskIndex = Math.floor((progress / 100) * agentTasks.length);
    return agentTasks[Math.min(taskIndex, agentTasks.length - 1)];
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'data_extraction':
        return <Search className="w-5 h-5" />;
      case 'spending_analysis':
        return <BarChart3 className="w-5 h-5" />;
      case 'savings_insight':
        return <PiggyBank className="w-5 h-5" />;
      case 'risk_assessment':
        return <Shield className="w-5 h-5" />;
      case 'uncle_personality':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!sessionId) {
    return (
      <div className="text-center py-12">
        <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No active session</h3>
        <p className="text-muted-foreground">
          Upload your financial statements to see Uncle's agents in action
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Analysis Progress
          </CardTitle>
          <CardDescription>
            Uncle's agents are working hard to analyze your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isPolling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analysis in progress...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Analysis complete!</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Agent Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agentStatuses.map((agent) => (
          <Card key={agent.id} className="hover-lift transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    agent.status === 'complete' ? 'bg-green-100 text-green-600' :
                    agent.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                    agent.status === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getAgentIcon(agent.id)}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                  </div>
                </div>
                <Badge className={`${getStatusColor(agent.status)} flex items-center gap-1`}>
                  {getStatusIcon(agent.status)}
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Progress</span>
                  <span>{Math.round(agent.progress)}%</span>
                </div>
                <Progress value={agent.progress} className="h-1" />
              </div>
              <div className="text-xs text-muted-foreground">
                {agent.currentTask}
              </div>
              <div className="text-xs text-muted-foreground">
                Last update: {agent.lastUpdate.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Agent Configuration
          </CardTitle>
          <CardDescription>
            Customize how Uncle's agents analyze your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Extraction Sensitivity</label>
              <div className="flex items-center space-x-2">
                <input type="range" min="1" max="5" defaultValue="3" className="flex-1" />
                <span className="text-xs text-muted-foreground">Balanced</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Spending Alert Threshold</label>
              <div className="flex items-center space-x-2">
                <input type="range" min="10" max="50" defaultValue="25" className="flex-1" />
                <span className="text-xs text-muted-foreground">25%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentStatusPanel;
