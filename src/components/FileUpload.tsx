import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/client";
import type { UploadResponse } from "@/types";

interface FileUploadProps {
  onUploadComplete?: (uploadData: UploadResponse) => void;
}

const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadResults, setUploadResults] = useState<Map<string, UploadResponse>>(new Map());
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

  const uploadFile = async (file: File) => {
    const fileKey = `${file.name}-${file.size}`;
    setUploadingFiles(prev => new Set(prev).add(fileKey));

    try {
      const response = await apiClient.uploadFile(file);
      
      if (response.success && response.data) {
        setUploadResults(prev => new Map(prev).set(fileKey, response.data!));
        
        toast({
          title: "File processed! 🎉",
          description: `Uncle found ${response.data.transaction_count} transactions in ${file.name}`,
        });

        // Trigger analysis
        const analysisResponse = await apiClient.analyzeFinances(response.data.session_id);
        if (analysisResponse.success) {
          toast({
            title: "Analysis complete! 📊",
            description: "Uncle has finished analyzing your finances. Check the insights below!",
          });
          
          if (onUploadComplete) {
            onUploadComplete(response.data);
          }
        }
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.csv') || 
              file.name.endsWith('.xlsx') || 
              file.name.endsWith('.xls')
    );

    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      
      // Upload each file
      files.forEach(file => {
        uploadFile(file);
      });
      
      toast({
        title: "Files uploaded! 🎉",
        description: `Uncle's checking out your ${files.length} file${files.length > 1 ? 's' : ''}...`,
      });
    } else {
      toast({
        title: "Whoops!",
        description: "Uncle needs CSV or Excel files to help you out.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
      
      // Upload each file
      files.forEach(file => {
        uploadFile(file);
      });
      
      toast({
        title: "Looking good! 📊",
        description: `Uncle received your statements.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-4xl font-display font-bold mb-4">
          Show Uncle Your Receipts
        </h2>
        <p className="text-xl text-muted-foreground">
          Drop your bank statements here and let's see what we're working with!
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 hover-lift ${
          dragActive
            ? "border-primary bg-primary/5 shadow-hover"
            : "border-border bg-card/50"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              dragActive ? "bg-gradient-warm" : "bg-muted"
            }`}>
              <Upload className={`w-10 h-10 ${dragActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {dragActive ? "Drop it like it's hot! 🔥" : "Drag & drop your files here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse • CSV, Excel files supported
              </p>
            </div>

            <Button 
              type="button"
              variant="outline"
              className="mt-4 border-2 hover:bg-muted"
            >
              Choose Files
            </Button>
          </div>
        </label>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8 space-y-3 animate-slide-up">
          <h3 className="font-display font-semibold text-lg flex items-center">
            <CheckCircle2 className="w-5 h-5 text-success mr-2" />
            Uploaded Files ({uploadedFiles.length})
          </h3>
          
          {uploadedFiles.map((file, index) => {
            const fileKey = `${file.name}-${file.size}`;
            const isUploading = uploadingFiles.has(fileKey);
            const uploadResult = uploadResults.get(fileKey);
            
            return (
              <div
                key={index}
                className="flex items-center justify-between bg-card p-4 rounded-xl shadow-card border border-border hover-lift"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-sage rounded-lg flex items-center justify-center">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 text-secondary-foreground animate-spin" />
                    ) : uploadResult ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-secondary-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                      {uploadResult && ` • ${uploadResult.transaction_count} transactions`}
                    </p>
                    {isUploading && (
                      <p className="text-xs text-blue-600">Processing...</p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FileUpload;
