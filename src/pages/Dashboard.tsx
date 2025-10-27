import { useState } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import FileUpload from "@/components/FileUpload";
import InsightsDashboard from "@/components/InsightsDashboard";
import ChatInterface from "@/components/ChatInterface";
import type { UploadResponse } from "@/types";

const Dashboard = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'upload' | 'insights' | 'chat'>('upload');

  const handleUploadComplete = (uploadData: UploadResponse) => {
    setCurrentSessionId(uploadData.session_id);
    setActiveTab('insights'); // Switch to insights after upload
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="flex gap-4 p-4 max-w-[1800px] mx-auto">
        {/* Left Sidebar - File Upload (30%) */}
        <div className="hidden lg:block w-[30%]">
          <div className="sticky top-4">
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>
        </div>

        {/* Center Panel - Agent Insights (45%) */}
        <div className="w-full lg:w-[45%]">
          <InsightsDashboard sessionId={currentSessionId} />
        </div>

        {/* Right Sidebar - Chat (25%) */}
        <div className="hidden lg:block w-[25%]">
          <div className="sticky top-4">
            <ChatInterface sessionId={currentSessionId} />
          </div>
        </div>
      </main>

      {/* Mobile tabs - shown on tablet/mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex justify-around z-50">
        <button 
          onClick={() => setActiveTab('upload')}
          className={`flex flex-col items-center p-2 text-sm transition-colors ${
            activeTab === 'upload' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <span>Upload</span>
        </button>
        <button 
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center p-2 text-sm transition-colors ${
            activeTab === 'insights' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <span>Insights</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center p-2 text-sm transition-colors ${
            activeTab === 'chat' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <span>Chat</span>
        </button>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden pb-20">
        {activeTab === 'upload' && (
          <FileUpload onUploadComplete={handleUploadComplete} />
        )}
        {activeTab === 'insights' && (
          <InsightsDashboard sessionId={currentSessionId} />
        )}
        {activeTab === 'chat' && (
          <ChatInterface sessionId={currentSessionId} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
