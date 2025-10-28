import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Bot, 
  BarChart3, 
  MessageCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Settings,
  TrendingUp,
  PiggyBank,
  Shield,
  Search,
  Lightbulb,
  Terminal
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import InsightsDashboard from "@/components/InsightsDashboard";
import ChatInterface from "@/components/ChatInterface";
import AgentStatusPanel from "./AgentStatusPanel";
import InteractiveSpendingDashboard from "./InteractiveSpendingDashboard";
import AgentSettings from "./AgentSettings";
import LoggingPanel from "./LoggingPanel";
import type { UploadResponse, AgentStatus, AgentConfiguration } from "@/types";

interface UnifiedDashboardProps {
  sessionId?: string;
}

const UnifiedDashboard = ({ sessionId: initialSessionId }: UnifiedDashboardProps) => {
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [activeTab, setActiveTab] = useState<'upload' | 'agents' | 'insights' | 'chat' | 'settings' | 'logs'>('upload');
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfiguration | null>(null);

  const handleUploadComplete = (uploadData: UploadResponse) => {
    setSessionId(uploadData.session_id);
    setIsAnalyzing(true);
    setActiveTab('agents'); // Switch to agents tab to show progress
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    setActiveTab('insights'); // Switch to insights when complete
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
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
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-warm rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-display font-bold">UncleSense Dashboard</h1>
              </div>
              {sessionId && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Session Active
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Agents
              {isAnalyzing && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FileUpload onUploadComplete={handleUploadComplete} />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sessionId ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm">File processed successfully</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Session ID: {sessionId.slice(0, 8)}...
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Upload your financial statements to get started
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">Supported Formats:</p>
                      <p className="text-muted-foreground">CSV, Excel (.xlsx, .xls)</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Required Columns:</p>
                      <p className="text-muted-foreground">Date, Description, Amount</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Privacy:</p>
                      <p className="text-muted-foreground">Your data is processed securely and never stored permanently</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <AgentStatusPanel 
              sessionId={sessionId}
              onAnalysisComplete={handleAnalysisComplete}
              onStatusUpdate={setAgentStatuses}
            />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {sessionId ? (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <InteractiveSpendingDashboard sessionId={sessionId} />
                </div>
                <div className="space-y-4">
                  <InsightsDashboard sessionId={sessionId} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No insights yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your statements to see Uncle's analysis
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  Upload Files
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChatInterface sessionId={sessionId} />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Chat Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">Ask Uncle about:</p>
                      <ul className="text-muted-foreground space-y-1 mt-1">
                        <li>• Your spending patterns</li>
                        <li>• Budget recommendations</li>
                        <li>• Saving opportunities</li>
                        <li>• Financial goals</li>
                      </ul>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Example questions:</p>
                      <ul className="text-muted-foreground space-y-1 mt-1">
                        <li>• "How can I save more?"</li>
                        <li>• "What's my biggest expense?"</li>
                        <li>• "Am I overspending?"</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <AgentSettings 
              sessionId={sessionId}
              onConfigUpdate={setAgentConfig}
            />
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <LoggingPanel sessionId={sessionId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
