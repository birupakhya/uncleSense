import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Mic, Bot, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "uncle";
  timestamp: Date;
}

const ChatSidebar = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey there! I'm Uncle, your friendly financial advisor. I've been looking at your statements and I'm ready to help you make sense of your spending. What would you like to know?",
      sender: "uncle",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickSuggestions = [
    "Explain this",
    "How can I save more?",
    "What's my biggest expense?"
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate Uncle's response
    setTimeout(() => {
      const uncleMessage: Message = {
        id: messages.length + 2,
        text: "Great question! Based on what I see in your statements, I can help you with that. Let me break it down for you...",
        sender: "uncle",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, uncleMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <Card className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-warm rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display font-bold">Chat with Uncle</h3>
          <p className="text-xs text-muted-foreground">Always here to help</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-2 animate-slide-up ${
              message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === "uncle"
                  ? "bg-gradient-warm"
                  : "bg-gradient-sage"
              }`}
            >
              {message.sender === "uncle" ? (
                <Bot className="w-4 h-4 text-primary-foreground" />
              ) : (
                <User className="w-4 h-4 text-secondary-foreground" />
              )}
            </div>

            {/* Message Bubble */}
            <div className="flex-1 max-w-[85%]">
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.sender === "uncle"
                    ? "bg-muted"
                    : "bg-gradient-warm text-primary-foreground"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
              <p
                className={`text-xs mt-1 px-2 ${
                  message.sender === "uncle"
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-gradient-warm rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      <div className="px-4 py-2 border-t border-border flex gap-2 flex-wrap">
        {quickSuggestions.map((suggestion, index) => (
          <Badge
            key={index}
            variant="outline"
            className="cursor-pointer hover:bg-muted transition-colors"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            placeholder="Ask Uncle anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-card border-border focus:ring-primary"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="bg-gradient-warm hover:shadow-hover transition-all"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-border hover:bg-muted"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatSidebar;
