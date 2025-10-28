import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Bot, 
  Bell, 
  Shield, 
  Target, 
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type { AgentConfiguration, UnclePersonalityConfig } from "@/types";

interface AgentSettingsProps {
  sessionId?: string;
  onConfigUpdate?: (config: AgentConfiguration) => void;
}

const AgentSettings = ({ sessionId, onConfigUpdate }: AgentSettingsProps) => {
  const [config, setConfig] = useState<AgentConfiguration>({
    dataExtractionSensitivity: 3,
    spendingAlertThreshold: 25,
    savingsGoalAmount: 1000,
    riskTolerance: 'medium',
    notificationPreferences: {
      email: true,
      push: true,
      sms: false
    }
  });

  const [uncleConfig, setUncleConfig] = useState<UnclePersonalityConfig>({
    tone: 'friendly',
    adviceStyle: 'balanced',
    celebrationLevel: 'moderate'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadConfiguration();
    }
  }, [sessionId]);

  const loadConfiguration = async () => {
    try {
      const response = await apiClient.updateAgentConfig(sessionId!, {});
      if (response.success && response.data) {
        setConfig(response.data.config);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleNestedConfigChange = (parentKey: string, childKey: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey as keyof AgentConfiguration],
        [childKey]: value
      }
    }));
    setHasChanges(true);
  };

  const handleUncleConfigChange = (key: string, value: any) => {
    setUncleConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.updateAgentConfig(sessionId, {
        agentConfig: config,
        uncleConfig: uncleConfig
      });
      
      if (response.success) {
        setHasChanges(false);
        if (onConfigUpdate) {
          onConfigUpdate(config);
        }
        toast({
          title: "Settings saved! ✅",
          description: "Your agent configuration has been updated.",
        });
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast({
        title: "Save failed",
        description: "Couldn't save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setConfig({
      dataExtractionSensitivity: 3,
      spendingAlertThreshold: 25,
      savingsGoalAmount: 1000,
      riskTolerance: 'medium',
      notificationPreferences: {
        email: true,
        push: true,
        sms: false
      }
    });
    setUncleConfig({
      tone: 'friendly',
      adviceStyle: 'balanced',
      celebrationLevel: 'moderate'
    });
    setHasChanges(true);
  };

  const getSensitivityLabel = (value: number) => {
    switch (value) {
      case 1: return 'Very Conservative';
      case 2: return 'Conservative';
      case 3: return 'Balanced';
      case 4: return 'Aggressive';
      case 5: return 'Very Aggressive';
      default: return 'Balanced';
    }
  };

  const getRiskToleranceColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Agent Configuration
          </CardTitle>
          <CardDescription>
            Customize how Uncle's agents analyze your financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasChanges ? (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              <span className="text-sm text-muted-foreground">
                {hasChanges ? 'Unsaved changes' : 'All changes saved'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetToDefaults}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={saveConfiguration} disabled={!hasChanges || isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Agent Settings</TabsTrigger>
          <TabsTrigger value="uncle">Uncle Personality</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Agent Settings Tab */}
        <TabsContent value="agents" className="space-y-6">
          {/* Data Extraction Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Data Extraction Agent
              </CardTitle>
              <CardDescription>
                Configure how the AI categorizes and processes your transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="sensitivity">Extraction Sensitivity</Label>
                <div className="space-y-2">
                  <Slider
                    id="sensitivity"
                    min={1}
                    max={5}
                    step={1}
                    value={[config.dataExtractionSensitivity]}
                    onValueChange={(value) => handleConfigChange('dataExtractionSensitivity', value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Conservative</span>
                    <span className="font-medium">{getSensitivityLabel(config.dataExtractionSensitivity)}</span>
                    <span>Aggressive</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Higher sensitivity means more aggressive categorization and pattern detection
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Spending Analysis Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Spending Analysis Agent
              </CardTitle>
              <CardDescription>
                Set thresholds and preferences for spending analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="alertThreshold">Spending Alert Threshold</Label>
                <div className="space-y-2">
                  <Slider
                    id="alertThreshold"
                    min={10}
                    max={50}
                    step={5}
                    value={[config.spendingAlertThreshold]}
                    onValueChange={(value) => handleConfigChange('spendingAlertThreshold', value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>10%</span>
                    <span className="font-medium">{config.spendingAlertThreshold}%</span>
                    <span>50%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get alerts when spending increases by this percentage
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="savingsGoal">Monthly Savings Goal</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">$</span>
                  <Input
                    id="savingsGoal"
                    type="number"
                    value={config.savingsGoalAmount}
                    onChange={(e) => handleConfigChange('savingsGoalAmount', parseInt(e.target.value) || 0)}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">per month</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uncle will track your progress toward this goal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Assessment Agent
              </CardTitle>
              <CardDescription>
                Configure risk tolerance and alert preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                <Select
                  value={config.riskTolerance}
                  onValueChange={(value) => handleConfigChange('riskTolerance', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select risk tolerance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Low Risk</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span>Medium Risk</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span>High Risk</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  <span className={getRiskToleranceColor(config.riskTolerance)}>
                    {config.riskTolerance.charAt(0).toUpperCase() + config.riskTolerance.slice(1)} risk tolerance
                  </span> - 
                  {config.riskTolerance === 'low' && ' Conservative approach with early warnings'}
                  {config.riskTolerance === 'medium' && ' Balanced approach with moderate alerts'}
                  {config.riskTolerance === 'high' && ' Aggressive approach with minimal alerts'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Uncle Personality Tab */}
        <TabsContent value="uncle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Uncle's Personality
              </CardTitle>
              <CardDescription>
                Customize Uncle's communication style and advice approach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="tone">Communication Tone</Label>
                <Select
                  value={uncleConfig.tone}
                  onValueChange={(value) => handleUncleConfigChange('tone', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly & Warm</SelectItem>
                    <SelectItem value="professional">Professional & Direct</SelectItem>
                    <SelectItem value="humorous">Humorous & Playful</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How Uncle communicates with you
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="adviceStyle">Advice Style</Label>
                <Select
                  value={uncleConfig.adviceStyle}
                  onValueChange={(value) => handleUncleConfigChange('adviceStyle', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select advice style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative & Safe</SelectItem>
                    <SelectItem value="balanced">Balanced & Practical</SelectItem>
                    <SelectItem value="aggressive">Aggressive & Bold</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How aggressive Uncle's financial advice is
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="celebrationLevel">Celebration Level</Label>
                <Select
                  value={uncleConfig.celebrationLevel}
                  onValueChange={(value) => handleUncleConfigChange('celebrationLevel', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select celebration level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subtle">Subtle & Calm</SelectItem>
                    <SelectItem value="moderate">Moderate & Encouraging</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic & Excited</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How much Uncle celebrates your financial wins
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive updates from Uncle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive analysis summaries and important alerts via email
                    </p>
                  </div>
                  <Switch
                    id="email"
                    checked={config.notificationPreferences.email}
                    onCheckedChange={(checked) => handleNestedConfigChange('notificationPreferences', 'email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Get real-time alerts for spending anomalies and insights
                    </p>
                  </div>
                  <Switch
                    id="push"
                    checked={config.notificationPreferences.push}
                    onCheckedChange={(checked) => handleNestedConfigChange('notificationPreferences', 'push', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sms">SMS Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive urgent alerts via text message
                    </p>
                  </div>
                  <Switch
                    id="sms"
                    checked={config.notificationPreferences.sms}
                    onCheckedChange={(checked) => handleNestedConfigChange('notificationPreferences', 'sms', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Extraction Sensitivity:</span>
                <span className="font-medium">{getSensitivityLabel(config.dataExtractionSensitivity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alert Threshold:</span>
                <span className="font-medium">{config.spendingAlertThreshold}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Savings Goal:</span>
                <span className="font-medium">${config.savingsGoalAmount}/month</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk Tolerance:</span>
                <span className={`font-medium ${getRiskToleranceColor(config.riskTolerance)}`}>
                  {config.riskTolerance.charAt(0).toUpperCase() + config.riskTolerance.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uncle's Tone:</span>
                <span className="font-medium">{uncleConfig.tone.charAt(0).toUpperCase() + uncleConfig.tone.slice(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notifications:</span>
                <span className="font-medium">
                  {Object.values(config.notificationPreferences).filter(Boolean).length} enabled
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentSettings;
