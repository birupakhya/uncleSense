import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  MessageCircle, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type { ContextualChatMessage, Insight } from "@/types";

interface ContextualChatInterfaceProps {
  sessionId?: string;
  insights?: Insight[];
  onInsightQuestion?: (insightId: string, question: string) => void;
}

const ContextualChatInterface = ({ 
  sessionId, 
  insights = [], 
  onInsightQuestion 
}: ContextualChatInterfaceProps) => {
  const [messages, setMessages] = useState<ContextualChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
      generateSuggestedQuestions();
    }
  }, [sessionId, insights]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    if (!sessionId) return;
    
    try {
      const response = await apiClient.getChatHistory(sessionId);
      if (response.success && response.data) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const generateSuggestedQuestions = () => {
    const suggestions = [
      "How can I save more money?",
      "What's my biggest expense?",
      "Am I overspending on anything?",
      "Show me my spending trends",
      "What should I focus on improving?",
      "How does my spending compare to last month?"
    ];
    setSuggestedQuestions(suggestions);
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !sessionId) return;

    const userMessage: ContextualChatMessage = {
      id: `user-${Date.now()}`,
      session_id: sessionId,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
      context: {
        suggestedQuestions: generateContextualQuestions(messageText),
        quickActions: generateQuickActions(messageText)
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiClient.sendChatMessage(sessionId, messageText);
      if (response.success && response.data) {
        const uncleMessage: ContextualChatMessage = {
          id: `uncle-${Date.now()}`,
          session_id: sessionId,
          role: 'assistant',
          content: response.data.message,
          created_at: new Date().toISOString(),
          context: {
            relatedInsight: response.data.relatedInsight,
            suggestedQuestions: response.data.followUpQuestions || [],
            quickActions: response.data.quickActions || []
          }
        };
        setMessages(prev => [...prev, uncleMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Message failed",
        description: "Couldn't send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateContextualQuestions = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
      return [
        "Show me my top spending categories",
        "How can I reduce my expenses?",
        "What's my average daily spending?"
      ];
    }
    
    if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      return [
        "What are my biggest saving opportunities?",
        "How much could I save per month?",
        "What should I cut back on?"
      ];
    }
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('plan')) {
      return [
        "Help me create a budget",
        "What should my budget categories be?",
        "How do I stick to my budget?"
      ];
    }
    
    return [
      "Tell me more about this",
      "What else should I know?",
      "How can I improve?"
    ];
  };

  const generateQuickActions = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
      return ["View Spending Analysis", "Set Budget Alert", "Create Savings Goal"];
    }
    
    if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      return ["View Savings Opportunities", "Set Savings Goal", "Track Progress"];
    }
    
    return ["View Insights", "Ask Another Question", "Get Recommendations"];
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    sendMessage(question);
  };

  const handleInsightQuestion = (insightId: string) => {
    const insight = insights.find(i => i.id === insightId);
    if (insight && onInsightQuestion) {
      const question = `Tell me more about this insight: "${insight.insight_data.title}"`;
      onInsightQuestion(insightId, question);
    }
  };

  const getMessageIcon = (role: string) => {
    if (role === 'user') {
      return <User className="w-5 h-5" />;
    }
    return <Bot className="w-5 h-5" />;
  };

  const getMessageColor = (role: string) => {
    if (role === 'user') {
      return 'bg-primary text-primary-foreground';
    }
    return 'bg-muted text-foreground';
  };

  if (!sessionId) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat with Uncle
          </CardTitle>
          <CardDescription>
            Upload your statements to start chatting with Uncle about your finances
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active session</h3>
            <p className="text-muted-foreground">
              Upload your financial statements to start chatting with Uncle
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat with Uncle
        </CardTitle>
        <CardDescription>
          Ask Uncle anything about your finances
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Welcome to Uncle's Chat!</h3>
                <p className="text-muted-foreground mb-4">
                  I'm here to help you understand your finances better. Ask me anything!
                </p>
                
                {/* Suggested Questions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestedQuestion(question)}
                        className="text-xs"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-3">
                  <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                    }`}>
                      {getMessageIcon(message.role)}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Contextual Actions */}
                      {message.context && (
                        <div className="mt-2 space-y-2">
                          {message.context.suggestedQuestions && message.context.suggestedQuestions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {message.context.suggestedQuestions.map((question, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSuggestedQuestion(question)}
                                  className="text-xs h-6 px-2"
                                >
                                  {question}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          {message.context.quickActions && message.context.quickActions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {message.context.quickActions.map((action, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`text-xs text-muted-foreground ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(message.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-muted text-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Uncle is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input */}
        <div className="p-6 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Uncle about your finances..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
              disabled={isLoading}
            />
            <Button 
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick Actions */}
          {suggestedQuestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedQuestions.slice(0, 4).map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs h-6 px-2"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContextualChatInterface;
