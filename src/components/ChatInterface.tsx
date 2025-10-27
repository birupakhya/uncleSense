import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@/types";

interface ChatInterfaceProps {
  sessionId?: string;
}

const ChatInterface = ({ sessionId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load chat history when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
    } else {
      // Show welcome message when no session
      setMessages([{
        id: 'welcome',
        session_id: 'welcome',
        role: 'assistant',
        content: "Hey there! Uncle here. Upload your statements and I'll help you make sense of your spending. What's on your mind?",
        created_at: new Date().toISOString(),
      }]);
    }
  }, [sessionId]);

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

  const handleSend = async () => {
    if (!inputValue.trim() || !sessionId) return;

    setIsLoading(true);
    const messageText = inputValue.trim();
    setInputValue("");

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      session_id: sessionId,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await apiClient.sendChatMessage(sessionId, messageText);
      
      if (response.success && response.data) {
        const uncleMessage: ChatMessage = {
          id: `uncle-${Date.now()}`,
          session_id: sessionId,
          role: 'assistant',
          content: response.data.response,
          created_at: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, uncleMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        session_id: sessionId,
        role: 'assistant',
        content: "Hey there, buddy! I'm having a bit of trouble processing your question right now. But don't worry - try asking me again in a moment! 😄",
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Chat error",
        description: "Uncle had trouble responding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-4xl font-display font-bold mb-4">
          Chat with Uncle
        </h2>
        <p className="text-xl text-muted-foreground">
          Ask me anything about your finances - I'm here to help!
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 animate-slide-up ${
                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "assistant"
                    ? "bg-gradient-warm"
                    : "bg-gradient-sage"
                }`}
              >
                {message.role === "assistant" ? (
                  <Bot className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <User className="w-6 h-6 text-secondary-foreground" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  message.role === "assistant"
                    ? "bg-muted"
                    : "bg-gradient-warm text-primary-foreground"
                }`}
              >
                <p className="text-sm md:text-base">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === "assistant"
                      ? "text-muted-foreground"
                      : "text-primary-foreground/70"
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3 animate-slide-up">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-warm">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="max-w-[70%] rounded-2xl p-4 bg-muted">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Uncle is thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex space-x-3">
            <Input
              placeholder={sessionId ? "Ask Uncle about your finances..." : "Upload statements first to chat with Uncle"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-card border-border focus:ring-primary"
              disabled={!sessionId || isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!sessionId || isLoading || !inputValue.trim()}
              className="bg-gradient-warm hover:shadow-hover transition-all duration-300 px-6 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {sessionId ? "Uncle's here to help - ask anything! 😊" : "Upload your financial statements to start chatting with Uncle! 📊"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;
