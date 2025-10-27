import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "uncle";
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey there! Uncle here. Upload your statements and I'll help you make sense of your spending. What's on your mind?",
      sender: "uncle",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

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

    // Simulate Uncle's response
    setTimeout(() => {
      const uncleMessage: Message = {
        id: messages.length + 2,
        text: "I hear you! Let me take a look at that for you. Once you upload your statements, I can give you some real insights about your spending patterns. 💡",
        sender: "uncle",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, uncleMessage]);
    }, 1000);
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
                message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === "uncle"
                    ? "bg-gradient-warm"
                    : "bg-gradient-sage"
                }`}
              >
                {message.sender === "uncle" ? (
                  <Bot className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <User className="w-6 h-6 text-secondary-foreground" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  message.sender === "uncle"
                    ? "bg-muted"
                    : "bg-gradient-warm text-primary-foreground"
                }`}
              >
                <p className="text-sm md:text-base">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.sender === "uncle"
                      ? "text-muted-foreground"
                      : "text-primary-foreground/70"
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
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex space-x-3">
            <Input
              placeholder="Ask Uncle about your finances..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-card border-border focus:ring-primary"
            />
            <Button
              onClick={handleSend}
              className="bg-gradient-warm hover:shadow-hover transition-all duration-300 px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Uncle's here to help - ask anything! 😊
          </p>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;
