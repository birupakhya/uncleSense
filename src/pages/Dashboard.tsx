import { useState } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import UnifiedDashboard from "@/components/dashboard/UnifiedDashboard";
import type { UploadResponse } from "@/types";

const Dashboard = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();

  const handleUploadComplete = (uploadData: UploadResponse) => {
    setCurrentSessionId(uploadData.session_id);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <UnifiedDashboard sessionId={currentSessionId} />
    </div>
  );
};

export default Dashboard;