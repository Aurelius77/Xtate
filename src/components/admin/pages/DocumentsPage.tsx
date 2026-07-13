import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Upload, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEstateId } from '@/hooks/useEstateId';
import type { Tables } from '@/integrations/supabase/types';

type DocumentRow = Tables<'documents'>;

interface DocumentFormState {
  title: string;
  category: string;
  isPublic: boolean;
  file: File | null;
}

const emptyDocumentForm: DocumentFormState = {
  title: '',
  category: 'General',
  isPublic: true,
  file: null,
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const getFileExtension = (fileName: string) => {
  const extension = fileName.split('.').pop();
  return extension ? extension.toUpperCase() : 'FILE';
};

const getCategoryColor = (category: string | null) => {
  switch (category) {
    case 'Governance': return 'bg-blue-50 text-blue-600';
    case 'Security': return 'bg-emerald-50 text-emerald-600';
    case 'Safety': return 'bg-rose-50 text-rose-600';
    case 'Finance': return 'bg-amber-50 text-amber-600';
    default: return 'bg-gray-100 text-gray-500';
  }
};

const DocumentsPage = () => {
  const estateId = useEstateId();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DocumentFormState>(emptyDocumentForm);

  const loadDocuments = useCallback(async () => {
    if (!estateId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setDocuments(data ?? []);
    }
    setLoading(false);
  }, [estateId, toast]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const resetForm = () => {
    setForm(emptyDocumentForm);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleUploadDocument = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!estateId) {
      toast({ title: 'Estate Not Ready', description: 'Cannot upload without an estate.', variant: 'destructive' });
      return;
    }

    if (!form.file) {
      toast({ title: 'File Required', description: 'Select a document to upload.', variant: 'destructive' });
      return;
    }

    if (!form.title.trim()) {
      toast({ title: 'Title Required', description: 'Enter a document title.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const safeName = form.file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const filePath = `${estateId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, form.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: form.file.type || undefined,
        });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('documents').insert({
        title: form.title.trim(),
        category: form.category.trim() || 'General',
        estate_id: estateId,
        file_url: filePath,
        file_type: form.file.type || getFileExtension(form.file.name),
        file_size: formatBytes(form.file.size),
        is_public: form.isPublic,
        uploaded_by: user?.id || null,
      });

      if (insertError) throw insertError;

      toast({ title: 'Document Uploaded', description: `${form.title.trim()} is now available.` });
      resetForm();
      setDialogOpen(false);
      await loadDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not upload document.';
      toast({ title: 'Upload Failed', description: message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const stats = useMemo(() => {
    const storageUsed = documents.reduce((sum, document) => {
      const match = document.file_size?.match(/^([\d.]+)\s*(B|KB|MB)$/i);
      if (!match) return sum;
      const value = Number(match[1]);
      const unit = match[2].toUpperCase();
      if (unit === 'MB') return sum + value * 1024 * 1024;
      if (unit === 'KB') return sum + value * 1024;
      return sum + value;
    }, 0);

    return {
      total: documents.length,
      publicDocs: documents.filter((document) => document.is_public).length,
      storageUsed: formatBytes(storageUsed),
    };
  }, [documents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="text-gray-400">Manage estate documents and files</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100 bg-white text-gray-900 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Upload Document</DialogTitle>
            <DialogDescription className="text-gray-500">
              Upload a document and choose whether residents can see it.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleUploadDocument}>
            <div className="space-y-2">
              <Label htmlFor="document-title" className="text-gray-700">Title</Label>
              <Input
                id="document-title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Estate bylaws"
                className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400"
                disabled={uploading}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document-category" className="text-gray-700">Category</Label>
                <select
                  id="document-category"
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="flex h-10 w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={uploading}
                >
                  <option value="General">General</option>
                  <option value="Governance">Governance</option>
                  <option value="Security">Security</option>
                  <option value="Safety">Safety</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-file" className="text-gray-700">File</Label>
                <Input
                  ref={fileInputRef}
                  id="document-file"
                  type="file"
                  onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
                  className="bg-gray-50 border-gray-100 text-gray-900 file:text-gray-700"
                  disabled={uploading}
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(event) => setForm((current) => ({ ...current, isPublic: event.target.checked }))}
                className="rounded"
                disabled={uploading}
              />
              <span className="text-sm">Visible to residents</span>
            </label>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="bg-gray-50 border-gray-100 text-gray-700 hover:bg-blue-50"
                onClick={() => setDialogOpen(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Documents</p>
                <p className="text-2xl font-semibold text-blue-400">{loading ? '...' : stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Public Documents</p>
                <p className="text-2xl font-semibold text-green-400">{loading ? '...' : stats.publicDocs}</p>
              </div>
              <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Storage Used</p>
                <p className="text-2xl font-semibold text-purple-400">{loading ? '...' : stats.storageUsed}</p>
              </div>
              <div className="h-10 w-10 bg-violet-50 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">All Documents</CardTitle>
          <CardDescription className="text-gray-400">Estate documents and files</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-gray-400">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{document.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{document.file_type || 'File'}{document.file_size ? ` - ${document.file_size}` : ''}</span>
                        <span>{new Date(document.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getCategoryColor(document.category)}>
                      {document.category || 'General'}
                    </Badge>
                    <Badge variant={document.is_public ? 'default' : 'secondary'}>
                      {document.is_public ? 'Public' : 'Private'}
                    </Badge>
                    <Button size="sm" variant="outline" className="bg-gray-50 border-gray-100 text-gray-700" onClick={() => openDocument(document, true)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="bg-gray-50 border-gray-100 text-gray-700" onClick={() => openDocument(document)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
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
