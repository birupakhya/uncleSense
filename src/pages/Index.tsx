import { useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import InsightsDashboard from "@/components/InsightsDashboard";

const Index = () => {
  const [activeSection, setActiveSection] = useState("hero");

  const handleGetStarted = () => {
    setActiveSection("upload");
  };

  return (
    <div className="min-h-screen bg-background">
      {activeSection !== "hero" && (
        <Navigation activeSection={activeSection} onNavigate={setActiveSection} />
      )}
      
      {activeSection === "hero" && <HeroSection onGetStarted={handleGetStarted} />}
      {activeSection === "upload" && <FileUpload />}
      {activeSection === "chat" && <ChatInterface />}
      {activeSection === "insights" && <InsightsDashboard />}
      {activeSection === "settings" && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-display font-bold mb-4">Settings</h2>
            <p className="text-xl text-muted-foreground">
              Coming soon! Uncle's working on some cool customization options.
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-warm rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">U</span>
              </div>
              <span className="font-display font-bold text-foreground">UncleSense</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 UncleSense. Your uncle's got your finances covered.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
