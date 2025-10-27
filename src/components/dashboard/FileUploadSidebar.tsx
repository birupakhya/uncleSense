import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FileUploadSidebarProps {
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
}

type FileStatus = "processing" | "analyzed" | "error";

interface FileWithStatus {
  file: File;
  status: FileStatus;
  uploadDate: Date;
}

const FileUploadSidebar = ({ uploadedFiles, setUploadedFiles }: FileUploadSidebarProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [filesWithStatus, setFilesWithStatus] = useState<FileWithStatus[]>([]);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.csv') || 
              file.name.endsWith('.xlsx') || 
              file.name.endsWith('.xls') ||
              file.name.endsWith('.pdf')
    );

    if (files.length > 0) {
      const newFilesWithStatus = files.map(file => ({
        file,
        status: "processing" as FileStatus,
        uploadDate: new Date(),
      }));
      
      setFilesWithStatus(prev => [...prev, ...newFilesWithStatus]);
      setUploadedFiles([...uploadedFiles, ...files]);
      
      // Simulate processing
      setTimeout(() => {
        setFilesWithStatus(prev => 
          prev.map(f => ({ ...f, status: "analyzed" as FileStatus }))
        );
      }, 2000);

      toast({
        title: "Files uploaded! 🎉",
        description: `Uncle's analyzing your ${files.length} statement${files.length > 1 ? 's' : ''}...`,
      });
    } else {
      toast({
        title: "Whoops!",
        description: "Uncle needs CSV, Excel, or PDF files.",
        variant: "destructive",
      });
    }
  }, [toast, uploadedFiles, setUploadedFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFilesWithStatus = files.map(file => ({
        file,
        status: "processing" as FileStatus,
        uploadDate: new Date(),
      }));
      
      setFilesWithStatus(prev => [...prev, ...newFilesWithStatus]);
      setUploadedFiles([...uploadedFiles, ...files]);
      
      setTimeout(() => {
        setFilesWithStatus(prev => 
          prev.map(f => ({ ...f, status: "analyzed" as FileStatus }))
        );
      }, 2000);

      toast({
        title: "Looking good! 📊",
        description: `Uncle received your statements.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setFilesWithStatus(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "processing":
        return <Clock className="w-4 h-4 text-warning animate-pulse" />;
      case "analyzed":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const totalTransactions = filesWithStatus.length * 87; // Mock number

  return (
    <Card className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-display font-bold mb-2">Your Financial Statements</h2>
        <div className="flex gap-2">
          <Badge variant="outline">CSV</Badge>
          <Badge variant="outline">Excel</Badge>
          <Badge variant="outline">PDF</Badge>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="p-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? "border-primary bg-primary/5 shadow-hover"
              : "border-border bg-card/50"
          }`}
        >
          <input
            type="file"
            id="dashboard-file-upload"
            multiple
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <label htmlFor="dashboard-file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                dragActive ? "bg-gradient-warm" : "bg-muted"
              }`}>
                <Upload className={`w-8 h-8 ${dragActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              
              <div className="space-y-1">
                <p className="font-semibold text-sm">
                  {dragActive ? "Drop it right here! 🔥" : "Drop your statements here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV, Excel, or PDF files
                </p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto px-6">
        {filesWithStatus.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm">
              Uploaded Files ({filesWithStatus.length})
            </h3>
            
            {filesWithStatus.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-muted/30 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-sage rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{(item.file.size / 1024).toFixed(1)} KB</span>
                      {getStatusIcon(item.status)}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border space-y-3">
        {filesWithStatus.length > 0 && (
          <Card className="p-4 bg-gradient-sage">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-secondary-foreground">Total Transactions</span>
              <span className="text-2xl font-display font-bold text-secondary-foreground">{totalTransactions}</span>
            </div>
          </Card>
        )}
        <Button className="w-full bg-gradient-warm hover:shadow-hover transition-all">
          <Upload className="w-4 h-4 mr-2" />
          Upload New Statement
        </Button>
      </div>
    </Card>
  );
};

export default FileUploadSidebar;
