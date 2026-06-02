import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type DocumentRow = Tables<'documents'>;

const DocumentsPage = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        setDocuments(data ?? []);
      }
      setLoading(false);
    };

    void fetchDocuments();
  }, [toast]);

  const recentUpdates = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return documents.filter((document) => new Date(document.created_at).getTime() >= cutoff).length;
  }, [documents]);

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Governance': return 'bg-blue-500/20 text-blue-300';
      case 'Security': return 'bg-green-500/20 text-green-300';
      case 'Safety': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const openDocument = (document: DocumentRow, download = false) => {
    if (!document.file_url) {
      toast({ title: 'Unavailable', description: 'This document does not have a file URL yet.' });
      return;
    }

    const anchor = window.document.createElement('a');
    anchor.href = document.file_url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    if (download) anchor.download = document.title;
    anchor.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-white/60">Access estate documents and important files</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Available Documents', value: loading ? '...' : documents.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-600/20' },
          { label: 'Recent Updates', value: loading ? '...' : recentUpdates, icon: Eye, color: 'text-green-400', bg: 'bg-green-600/20' },
          { label: 'Downloads', value: 'On demand', icon: Download, color: 'text-purple-400', bg: 'bg-purple-600/20' },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`h-10 w-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Available Documents</CardTitle>
          <CardDescription className="text-white/60">Estate documents available for residents</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white/60">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-white/60">No documents are available yet.</p>
          ) : (
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
                        <span>{document.file_type || 'File'}{document.file_size ? ` - ${document.file_size}` : ''}</span>
                        <span>Updated: {new Date(document.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getCategoryColor(document.category)}>
                      {document.category || 'General'}
                    </Badge>
                    <Button size="sm" variant="outline" className="glass border-white/20" onClick={() => openDocument(document)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="glass border-white/20" onClick={() => openDocument(document, true)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;
