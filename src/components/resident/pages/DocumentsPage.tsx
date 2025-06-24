
import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';
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
      uploadDate: '2024-01-15',
      category: 'Governance'
    },
    { 
      id: 2, 
      title: 'Security Guidelines', 
      type: 'PDF',
      size: '1.8 MB',
      uploadDate: '2024-01-10',
      category: 'Security'
    },
    { 
      id: 3, 
      title: 'Emergency Procedures', 
      type: 'PDF',
      size: '3.2 MB',
      uploadDate: '2024-01-05',
      category: 'Safety'
    },
    { 
      id: 4, 
      title: 'Community Rules & Regulations', 
      type: 'PDF',
      size: '1.5 MB',
      uploadDate: '2023-12-20',
      category: 'Governance'
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Governance': return 'bg-blue-500/20 text-blue-300';
      case 'Security': return 'bg-green-500/20 text-green-300';
      case 'Safety': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-white/60">Access estate documents and important files</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Available Documents</p>
                <p className="text-2xl font-semibold text-blue-400">18</p>
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
                <p className="text-xs text-white/60">Recent Updates</p>
                <p className="text-2xl font-semibold text-green-400">3</p>
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
                <p className="text-xs text-white/60">Downloads</p>
                <p className="text-2xl font-semibold text-purple-400">24</p>
              </div>
              <div className="h-10 w-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Available Documents</CardTitle>
          <CardDescription className="text-white/60">Estate documents available for residents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-4 glass rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{document.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{document.type} • {document.size}</span>
                      <span>Updated: {document.uploadDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getCategoryColor(document.category)}>
                    {document.category}
                  </Badge>
                  <Button size="sm" variant="outline" className="glass border-white/20">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="glass border-white/20">
                    <Download className="h-4 w-4 mr-1" />
                    Download
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
