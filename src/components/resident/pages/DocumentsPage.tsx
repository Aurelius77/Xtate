import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Eye, Search, Filter, HardDrive, File, Clock, ChevronRight } from 'lucide-react';
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

  const getCategoryBadge = (category: string | null) => {
    switch (category) {
      case 'Governance': return <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase tracking-widest text-[10px]">Governance</Badge>;
      case 'Security': return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase tracking-widest text-[10px]">Security</Badge>;
      case 'Safety': return <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold uppercase tracking-widest text-[10px]">Safety</Badge>;
      default: return <Badge className="bg-gray-50 text-gray-500 border-gray-100 font-bold uppercase tracking-widest text-[10px]">{category || 'General'}</Badge>;
    }
  };

  const openDocument = async (document: DocumentRow, download = false) => {
    if (!document.file_url) {
      toast({ title: 'Unavailable', description: 'This document does not have a file URL yet.' });
      return;
    }

    let url = document.file_url;
    if (!/^https?:\/\//.test(document.file_url)) {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_url, 60 * 5, download ? { download: document.title } : undefined);

      if (error) {
        toast({ title: 'Unable to Open Document', description: error.message, variant: 'destructive' });
        return;
      }
      url = data.signedUrl;
    }

    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    if (download) anchor.download = document.title;
    anchor.click();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Document Center</h1>
          <p className="text-gray-500 font-medium mt-1">Access estate governance, security, and safety records</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 font-bold px-6 h-12">
            <Filter className="h-4 w-4 mr-2" />
            Category
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-blue-600/20">
            <HardDrive className="h-4 w-4 mr-2" />
            Request Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Available Documents', value: loading ? '...' : documents.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Recent Updates', value: loading ? '...' : recentUpdates, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Cloud Storage', value: 'Unlimited', icon: HardDrive, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-11 w-11 ${stat.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Estate Documents</h3>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" placeholder="Search files..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none w-64" />
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-12 text-center text-gray-400 font-medium">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-16 text-center">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Archive empty</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">Currently there are no public documents available for this estate.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-gray-50/50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-50 transition-all">
                    <File className="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{doc.title}</h4>
                      {getCategoryBadge(doc.category)}
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>{doc.file_type || 'PDF'}</span>
                      <span>•</span>
                      <span>{doc.file_size || '2.4 MB'}</span>
                      <span>•</span>
                      <span>Updated {new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="rounded-xl font-bold border-gray-100 hover:bg-white hover:border-gray-300"
                    onClick={() => openDocument(doc)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10"
                    onClick={() => openDocument(doc, true)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-gray-50/50 text-center border-t border-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Securely Hosted on EstateOS Cloud
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
