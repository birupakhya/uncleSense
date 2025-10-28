import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Terminal, 
  RefreshCw, 
  Trash2, 
  Play, 
  Pause,
  AlertCircle,
  CheckCircle,
  Info,
  Clock
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  source: 'frontend' | 'backend' | 'huggingface';
}

interface LoggingPanelProps {
  sessionId?: string;
}

const LoggingPanel = ({ sessionId }: LoggingPanelProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Add a log entry
  const addLog = (level: LogEntry['level'], message: string, details?: any, source: LogEntry['source'] = 'frontend') => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
      source
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep only last 100 logs
  };

  // Clear all logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Fetch logs from backend
  const fetchLogs = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
      const url = `${apiBaseUrl}/api/logs?session_id=${sessionId}`;
      
      addLog('info', `Fetching logs from: ${url}`, { sessionId }, 'frontend');
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.logs) {
          setLogs(prev => [...data.logs, ...prev].slice(0, 100));
          addLog('success', `Retrieved ${data.logs.length} logs from backend`, null, 'frontend');
        }
      } else {
        addLog('error', `API request failed: ${response.status} ${response.statusText}`, { url }, 'frontend');
      }
    } catch (error) {
      addLog('error', 'Failed to fetch logs from backend', error, 'frontend');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate some test logs
  const addTestLogs = () => {
    addLog('info', 'Starting Hugging Face model analysis', null, 'huggingface');
    addLog('info', 'Loading financial RoBERTa model...', { model: 'soleimanian/financial-roberta-large-sentiment' }, 'huggingface');
    addLog('success', 'Model loaded successfully', { confidence: 0.95 }, 'huggingface');
    addLog('info', 'Processing transaction data...', { count: 10 }, 'backend');
    addLog('warning', 'Some transactions have low confidence scores', { lowConfidence: 2 }, 'backend');
    addLog('success', 'Analysis completed successfully', { insights: 5 }, 'backend');
  };

  // Auto-refresh when live mode is on
  useEffect(() => {
    if (isLive && sessionId) {
      const interval = setInterval(fetchLogs, 2000); // Fetch every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isLive, sessionId]);

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSourceColor = (source: LogEntry['source']) => {
    switch (source) {
      case 'huggingface':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'backend':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              <CardTitle>System Logs</CardTitle>
              {sessionId && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Session: {sessionId.slice(0, 8)}...
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className={isLive ? 'bg-green-100 text-green-800' : ''}
              >
                {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isLive ? 'Live' : 'Paused'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addTestLogs}
              >
                <Terminal className="w-4 h-4 mr-2" />
                Test Logs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
          <CardDescription>
            Real-time logs from the UncleSense system. Monitor Hugging Face API calls, agent processing, and system events.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Logs Display */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="p-4 space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No logs yet. Upload a file to see the analysis process.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getLevelColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getSourceColor(log.source)}>
                          {log.source.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{log.message}</p>
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Log Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter(l => l.level === 'info').length}
              </div>
              <div className="text-xs text-muted-foreground">Info</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {logs.filter(l => l.level === 'success').length}
              </div>
              <div className="text-xs text-muted-foreground">Success</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {logs.filter(l => l.level === 'warning').length}
              </div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(l => l.level === 'error').length}
              </div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoggingPanel;
