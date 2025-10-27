import { useState } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import FileUploadSidebar from "@/components/dashboard/FileUploadSidebar";
import AgentInsights from "@/components/dashboard/AgentInsights";
import ChatSidebar from "@/components/dashboard/ChatSidebar";

const Dashboard = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="flex gap-4 p-4 max-w-[1800px] mx-auto">
        {/* Left Sidebar - File Upload (30%) */}
        <div className="hidden lg:block w-[30%]">
          <FileUploadSidebar 
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
        </div>

        {/* Center Panel - Agent Insights (45%) */}
        <div className="w-full lg:w-[45%]">
          <AgentInsights hasFiles={uploadedFiles.length > 0} />
        </div>

        {/* Right Sidebar - Chat (25%) */}
        <div className="hidden lg:block w-[25%]">
          <ChatSidebar />
        </div>
      </main>

      {/* Mobile tabs - shown on tablet/mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex justify-around">
        <button className="flex flex-col items-center p-2 text-sm">
          <span>Upload</span>
        </button>
        <button className="flex flex-col items-center p-2 text-sm">
          <span>Insights</span>
        </button>
        <button className="flex flex-col items-center p-2 text-sm">
          <span>Chat</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
