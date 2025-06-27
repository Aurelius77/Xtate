
import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const DataImportPage = () => {
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [importResults, setImportResults] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('uploading');
    
    // Simulate file processing
    setTimeout(() => {
      setImportStatus('processing');
      setTimeout(() => {
        setImportStatus('success');
        setImportResults({
          residents: 25,
          dues: 15,
          payments: 8,
          errors: 2
        });
      }, 2000);
    }, 1000);
  };

  const downloadTemplate = () => {
    // Create a sample CSV content
    const csvContent = `Full Name,Email,Phone,Unit Number,Date Moved In,Emergency Contact,Due Title,Due Amount,Due Date,Payment Status
John Doe,john@email.com,+234 801 234 5678,A-101,2023-01-15,Jane Doe - +234 802 345 6789,Monthly Service Charge,50000,2024-01-01,paid
Sarah Johnson,sarah@email.com,+234 803 456 7890,B-205,2023-03-20,Mike Johnson - +234 804 567 8901,Quarterly Maintenance,75000,2024-02-01,pending
Emily Rodriguez,emily@email.com,+234 805 678 9012,C-301,2023-06-10,Carlos Rodriguez - +234 806 789 0123,Annual Security Fee,25000,2024-03-01,overdue`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estate_data_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Data Import</h1>
          <p className="text-cyan-200">Import your existing Excel/CSV data into EstateConnect</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Download className="h-5 w-5" />
              Download Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cyan-200 text-sm">
              Download our Excel template to format your existing data correctly before importing.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-cyan-300">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Resident information (Name, Email, Phone, Unit)
              </div>
              <div className="flex items-center gap-2 text-sm text-cyan-300">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Due records and payment status
              </div>
              <div className="flex items-center gap-2 text-sm text-cyan-300">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Emergency contacts
              </div>
            </div>
            <Button onClick={downloadTemplate} className="w-full bg-cyan-600 hover:bg-cyan-700">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cyan-200 text-sm">
              Upload your formatted Excel or CSV file to import resident and payment data.
            </p>
            
            {importStatus === 'idle' && (
              <div className="border-2 border-dashed border-cyan-400/30 rounded-lg p-6 text-center">
                <FileSpreadsheet className="h-12 w-12 text-cyan-400 mx-auto mb-3" />
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <span>Choose File to Upload</span>
                  </Button>
                </label>
                <p className="text-xs text-cyan-300 mt-2">Supports CSV, Excel files</p>
              </div>
            )}

            {importStatus === 'uploading' && (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3"></div>
                <p className="text-cyan-200">Uploading file...</p>
              </div>
            )}

            {importStatus === 'processing' && (
              <div className="text-center py-6">
                <div className="animate-pulse">
                  <FileSpreadsheet className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
                </div>
                <p className="text-cyan-200">Processing data...</p>
              </div>
            )}

            {importStatus === 'success' && importResults && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Import Successful!</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-300">{importResults.residents} Residents</span>
                    </div>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-blue-300">{importResults.dues} Due Records</span>
                    </div>
                  </div>
                </div>
                {importResults.errors > 0 && (
                  <div className="flex items-center gap-2 text-orange-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{importResults.errors} rows had errors (skipped)</span>
                  </div>
                )}
                <Button onClick={() => setImportStatus('idle')} variant="outline" className="w-full mt-3">
                  Import Another File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-50">Import Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-cyan-100 mb-3">Required Fields</h4>
              <ul className="space-y-2 text-sm text-cyan-300">
                <li>• Full Name (required)</li>
                <li>• Email Address (required)</li>
                <li>• Phone Number (required)</li>
                <li>• Unit Number (required)</li>
                <li>• Date Moved In (YYYY-MM-DD format)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-cyan-100 mb-3">Optional Fields</h4>
              <ul className="space-y-2 text-sm text-cyan-300">
                <li>• Emergency Contact</li>
                <li>• Due Title & Amount</li>
                <li>• Payment Status (paid/pending/overdue)</li>
                <li>• Due Date (YYYY-MM-DD format)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImportPage;
