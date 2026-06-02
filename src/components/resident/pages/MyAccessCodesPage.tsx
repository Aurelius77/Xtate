
import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, User, Phone, FileText, Share2, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import type { Tables } from '@/integrations/supabase/types';

const MyAccessCodesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accessCodes, setAccessCodes] = useState<Tables<'access_codes'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [residentId, setResidentId] = useState<string | null>(null);

  const fetchCodes = useCallback(async (targetResidentId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('resident_id', targetResidentId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setAccessCodes(data ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!user) return;

    const loadResidentAndCodes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('residents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (!data?.id) {
        setAccessCodes([]);
        setLoading(false);
        return;
      }

      setResidentId(data.id);
      await fetchCodes(data.id);
    };

    void loadResidentAndCodes();
  }, [fetchCodes, toast, user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-400/30">Active</Badge>;
      case 'used':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">Used</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-400 border-red-400/30">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">Unknown</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const shareCode = (code: Tables<'access_codes'>) => {
    const shareText = `Access Code: ${code.access_code}\nVisitor: ${code.visitor_name}\nValid: ${formatDateTime(code.valid_from)} - ${formatDateTime(code.valid_until)}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Visitor Access Code',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard",
        description: "Access code details copied to clipboard",
      });
    }
  };

  const cancelCode = async (codeId: string) => {
    const { error } = await supabase
      .from('access_codes')
      .update({ status: 'cancelled', is_used: true })
      .eq('id', codeId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Code Cancelled', description: 'Access code has been cancelled successfully' });
    if (residentId) await fetchCodes(residentId);
  };

  const activeCodesCount = accessCodes.filter(code => code.status === 'active').length;
  const usedCodesCount = accessCodes.filter(code => code.status === 'used').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-50">My Access Codes</h1>
          <p className="text-cyan-200">Manage your visitor access codes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-200 text-sm">Active Codes</p>
                <p className="text-2xl font-bold text-green-400">{activeCodesCount}</p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-200 text-sm">Used Codes</p>
                <p className="text-2xl font-bold text-blue-400">{usedCodesCount}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-200 text-sm">Total Codes</p>
                <p className="text-2xl font-bold text-cyan-400">{accessCodes.length}</p>
              </div>
              <FileText className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Codes Table */}
      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-50">Access Codes History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-cyan-200">Loading access codes...</p>
          ) : accessCodes.length === 0 ? (
            <p className="text-cyan-200">No access codes yet.</p>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-400/20">
                <TableHead className="text-cyan-200">Code</TableHead>
                <TableHead className="text-cyan-200">Visitor</TableHead>
                <TableHead className="text-cyan-200">Purpose</TableHead>
                <TableHead className="text-cyan-200">Valid Period</TableHead>
                <TableHead className="text-cyan-200">Status</TableHead>
                <TableHead className="text-cyan-200">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessCodes.map((code) => (
                <TableRow key={code.id} className="border-cyan-400/20">
                  <TableCell className="font-mono text-cyan-100 font-bold">
                    {code.access_code}
                  </TableCell>
                  <TableCell className="text-cyan-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-cyan-400" />
                        {code.visitor_name}
                      </div>
                      {code.visitor_phone && (
                        <div className="flex items-center gap-2 text-sm text-cyan-300 mt-1">
                          <Phone className="h-3 w-3" />
                          {code.visitor_phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-cyan-100">{code.purpose}</TableCell>
                  <TableCell className="text-cyan-100 text-sm">
                    <div>From: {formatDateTime(code.valid_from)}</div>
                    <div>Until: {formatDateTime(code.valid_until)}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(code.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => shareCode(code)}
                        className="glass border-cyan-400/30 text-cyan-200 hover:text-cyan-50"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                      {code.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelCode(code.id)}
                          className="glass border-red-400/30 text-red-400 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAccessCodesPage;
