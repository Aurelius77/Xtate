
import React from 'react';
import { FileText, Upload, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DocumentsPage = () => {
  const documents = [
    { 
      id: 1, 
      title: 'Estate Bylaws 2024', 
      type: 'PDF',
      size: '2.4 MB',
      uploadedBy: 'Admin',
      uploadDate: '2024-01-15',
      isPublic: true
    },
    { 
      id: 2, 
      title: 'Security Guidelines', 
      type: 'PDF',
      size: '1.8 MB',
      uploadedBy: 'Security Manager',
      uploadDate: '2024-01-10',
      isPublic: true
    },
    { 
      id: 3, 
      title: 'Maintenance Schedule', 
      type: 'XLSX',
      size: '856 KB',
      uploadedBy: 'Maintenance Team',
      uploadDate: '2024-01-08',
      isPublic: false
    },
    { 
      id: 4, 
      title: 'Emergency Procedures', 
      type: 'PDF',
      size: '3.2 MB',
      uploadedBy: 'Admin',
      uploadDate: '2024-01-05',
      isPublic: true
    },
  ];

  const getFileIcon = (type: string) => {
    return <FileText className="h-5 w-5 text-blue-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="text-white/60">Manage estate documents and files</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Total Documents</p>
                <p className="text-2xl font-semibold text-blue-400">24</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Public Documents</p>
                <p className="text-2xl font-semibold text-green-400">18</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Storage Used</p>
                <p className="text-2xl font-semibold text-purple-400">45MB</p>
              </div>
              <div className="h-10 w-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription className="text-white/60">Estate documents and files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-4 glass rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    {getFileIcon(document.type)}
                  </div>
                  <div>
                    <h3 className="font-medium">{document.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{document.type} • {document.size}</span>
                      <span>by {document.uploadedBy}</span>
                      <span>{document.uploadDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={document.isPublic ? 'default' : 'secondary'}>
                    {document.isPublic ? 'Public' : 'Private'}
                  </Badge>
                  <Button size="sm" variant="outline" className="glass border-white/20">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="glass border-white/20">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;
