import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Upload, MessageCircle, BarChart3, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const DashboardNav = () => {
  const location = useLocation();
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "upload", label: "Upload", icon: Upload, path: "/upload" },
    { id: "chat", label: "Chat with Uncle", icon: MessageCircle, path: "/chat" },
    { id: "insights", label: "Insights", icon: BarChart3, path: "/insights" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-warm rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">U</span>
            </div>
            <h1 className="text-2xl font-display font-bold bg-gradient-warm bg-clip-text text-transparent">
              UncleSense
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={isActive(item.path) ? "default" : "ghost"}
                asChild
                className={`transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-gradient-warm hover:shadow-hover" 
                    : "hover:bg-muted"
                }`}
              >
                <Link to={item.path}>
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>

          {/* User Profile */}
          <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            <AvatarFallback className="bg-gradient-sage text-secondary-foreground">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
