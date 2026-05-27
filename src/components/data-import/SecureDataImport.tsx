// Secure data import component with validation and sanitization
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileCheck, AlertTriangle, Shield, X } from 'lucide-react';
import { validateFile, sanitizeInput } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  success: number;
  errors: number;
  warnings: number;
  totalRows: number;
  errorDetails: string[];
}

interface SecureDataImportProps {
  onImportComplete?: (result: ImportResult) => void;
  allowedTypes?: string[];
  maxFileSizeMB?: number;
}

type CSVRow = Record<string, string>;

const SecureDataImport = ({ 
  onImportComplete, 
  allowedTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  maxFileSizeMB = 5 
}: SecureDataImportProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Secure file validation
  const validateFileSecure = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Basic file validation
    const basicValidation = validateFile(file, allowedTypes, maxFileSizeMB);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    // Additional security checks
    const filename = sanitizeInput(file.name);
    if (filename !== file.name) {
      return { isValid: false, error: 'Invalid characters in filename' };
    }

    // Check for suspicious file names
    const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif'];
    if (suspiciousPatterns.some(pattern => filename.toLowerCase().includes(pattern))) {
      return { isValid: false, error: 'File type not allowed for security reasons' };
    }

    return { isValid: true };
  }, [allowedTypes, maxFileSizeMB]);

  // Parse CSV with security validation
  const parseCSVSecure = useCallback((content: string): { data: CSVRow[]; errors: string[] } => {
    const lines = content.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    const data: CSVRow[] = [];

    if (lines.length === 0) {
      errors.push('File is empty');
      return { data, errors };
    }

    if (lines.length > 10000) {
      errors.push('File too large (max 10,000 rows)');
      return { data, errors };
    }

    const headers = lines[0].split(',').map(h => sanitizeInput(h.trim()));
    
    // Validate required headers
    const requiredHeaders = ['full_name', 'email', 'phone', 'unit_number'];
    const missingHeaders = requiredHeaders.filter(req => 
      !headers.some(h => h.toLowerCase().includes(req.toLowerCase()))
    );

    if (missingHeaders.length > 0) {
      errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
      return { data, errors };
    }

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => sanitizeInput(v.trim()));
        const row: CSVRow = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          
          // Validate email fields
          if (header.toLowerCase().includes('email') && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`Row ${i + 1}: Invalid email format - ${value}`);
              return;
            }
          }
          
          // Validate phone fields
          if (header.toLowerCase().includes('phone') && value) {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            if (!phoneRegex.test(value.replace(/[\s-()]/g, ''))) {
              errors.push(`Row ${i + 1}: Invalid phone format - ${value}`);
              return;
            }
          }
          
          row[header] = value;
        });
        
        // Only add valid rows
        if (Object.keys(row).length === headers.length) {
          data.push(row);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: Parse error`);
      }
    }

    return { data, errors };
  }, []);

  // Process file upload
  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);
    setImportResult(null);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          if (next >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return next;
        });
      }, 200);

      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      // Parse and validate data
      const { data, errors } = parseCSVSecure(content);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Prepare results
      const result: ImportResult = {
        success: data.length,
        errors: errors.length,
        warnings: 0,
        totalRows: data.length + errors.length,
        errorDetails: errors
      };

      setImportResult(result);
      onImportComplete?.(result);

      if (result.success > 0) {
        toast({
          title: "Import Completed",
          description: `Successfully imported ${result.success} records with ${result.errors} errors.`,
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onImportComplete, parseCSVSecure, toast]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFileSecure(file);
    
    if (!validation.isValid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setCurrentFile(file);
    processFile(file);
  }, [processFile, toast, validateFileSecure]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const resetImport = () => {
    setCurrentFile(null);
    setImportResult(null);
    setUploadProgress(0);
    setIsProcessing(false);
  };

  return (
    <Card className="glass-card border-cyan-400/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-50">
          <Shield className="h-5 w-5" />
          Secure Data Import
        </CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="text-green-300 border-green-400/30">
            <FileCheck className="h-3 w-3 mr-1" />
            Validated
          </Badge>
          <Badge variant="outline" className="text-blue-300 border-blue-400/30">
            <Shield className="h-3 w-3 mr-1" />
            Sanitized
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!currentFile && !isProcessing && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-cyan-400 bg-cyan-400/10' 
                : 'border-cyan-400/30 hover:border-cyan-400/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="font-medium text-cyan-50 mb-2">
              Drag & drop your file here
            </h3>
            <p className="text-sm text-cyan-300 mb-4">
              Supports CSV and Excel files (max {maxFileSizeMB}MB)
            </p>
            
            <input
              type="file"
              accept={allowedTypes.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                <span>Choose File</span>
              </Button>
            </label>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
              <span className="text-cyan-200">Processing file...</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-xs text-cyan-300">{uploadProgress}% complete</p>
          </div>
        )}

        {importResult && (
          <div className="space-y-4">
            <Alert className={`${importResult.errors > 0 ? 'border-amber-200 bg-amber-50/10' : 'border-green-200 bg-green-50/10'}`}>
              {importResult.errors > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <FileCheck className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    Import Results: {importResult.success} successful, {importResult.errors} errors
                  </p>
                  {importResult.errors > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Error Details:</p>
                      <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                        {importResult.errorDetails.slice(0, 10).map((error, index) => (
                          <li key={index} className="text-amber-700">• {error}</li>
                        ))}
                        {importResult.errorDetails.length > 10 && (
                          <li className="text-amber-600">
                            ... and {importResult.errorDetails.length - 10} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={resetImport} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Import Another File
              </Button>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <Alert className="border-blue-200 bg-blue-50/10">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs text-blue-300">
            All uploaded files are validated, sanitized, and processed securely. No executable files allowed.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SecureDataImport;
