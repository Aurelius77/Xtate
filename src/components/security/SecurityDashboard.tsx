
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, CheckCircle, Clock, Search, User, Home } from 'lucide-react';
import { VisitorAccessCode } from '@/types/visitor-access';
import { useToast } from '@/hooks/use-toast';

const SecurityDashboard = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState<VisitorAccessCode | null>(null);
  const { toast } = useToast();

  // Mock data - in real app, this would come from an API
  const [activeCodesData] = useState<VisitorAccessCode[]>([
    {
      id: '1',
      resident_id: 'res1',
      visitor_name: 'John Doe',
      visitor_phone: '+1234567890',
      access_code: '123456',
      purpose: 'Personal Visit',
      valid_from: '2024-01-15T10:00:00Z',
      valid_until: '2024-01-15T18:00:00Z',
      is_used: false,
      created_at: '2024-01-14T15:30:00Z',
      status: 'active',
      resident: {
        id: 'res1',
        user_id: 'user1',
        house_unit_number: 'A-101',
        user: {
          full_name: 'Alice Johnson',
          email: 'alice@example.com'
        }
      }
    },
    {
      id: '2',
      resident_id: 'res2',
      visitor_name: 'Bob Smith',
      access_code: '789012',
      purpose: 'Delivery',
      valid_from: '2024-01-15T09:00:00Z',
      valid_until: '2024-01-15T17:00:00Z',
      is_used: false,
      created_at: '2024-01-14T20:00:00Z',
      status: 'active',
      resident: {
        id: 'res2',
        user_id: 'user2',
        house_unit_number: 'B-205',
        user: {
          full_name: 'Bob Wilson',
          email: 'bob@example.com'
        }
      }
    }
  ]);

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an access code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundCode = activeCodesData.find(code => code.access_code === verificationCode);
      
      if (foundCode) {
        setVerifiedCode(foundCode);
        toast({
          title: "Code Verified",
          description: `Access granted for ${foundCode.visitor_name}`,
        });
      } else {
        toast({
          title: "Invalid Code",
          description: "Access code not found or expired",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const markAsUsed = async (codeId: string) => {
    // In real app, this would make an API call
    toast({
      title: "Access Granted",
      description: "Visitor has been granted access and code marked as used",
    });
    setVerifiedCode(null);
    setVerificationCode('');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-50 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Security Dashboard
            </h1>
            <p className="text-cyan-200">Verify visitor access codes</p>
          </div>
        </div>

        {/* Code Verification Section */}
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Search className="h-5 w-5" />
              Verify Access Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter 6-digit access code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="glass border-cyan-400/30 text-cyan-100 font-mono text-lg"
                maxLength={6}
              />
              <Button 
                onClick={verifyCode}
                disabled={isVerifying}
                className="glass bg-blue-600/20 hover:bg-blue-600/30 text-cyan-100"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>

            {verifiedCode && (
              <Card className="glass-card border-green-400/20 bg-green-400/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="font-semibold text-green-400">Code Verified</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-cyan-200">Visitor:</span>
                          <span className="ml-2 text-cyan-100 font-medium">{verifiedCode.visitor_name}</span>
                        </div>
                        <div>
                          <span className="text-cyan-200">Purpose:</span>
                          <span className="ml-2 text-cyan-100">{verifiedCode.purpose}</span>
                        </div>
                        <div>
                          <span className="text-cyan-200">Resident:</span>
                          <span className="ml-2 text-cyan-100">{verifiedCode.resident?.user?.full_name}</span>
                        </div>
                        <div>
                          <span className="text-cyan-200">Unit:</span>
                          <span className="ml-2 text-cyan-100">{verifiedCode.resident?.house_unit_number}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-cyan-200">Valid Until:</span>
                          <span className="ml-2 text-cyan-100">{formatDateTime(verifiedCode.valid_until)}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => markAsUsed(verifiedCode.id)}
                      className="glass bg-green-600/20 hover:bg-green-600/30 text-green-400"
                    >
                      Grant Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Active Codes Section */}
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-50">
              <Clock className="h-5 w-5" />
              Active Access Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-cyan-400/20">
                  <TableHead className="text-cyan-200">Code</TableHead>
                  <TableHead className="text-cyan-200">Visitor</TableHead>
                  <TableHead className="text-cyan-200">Resident</TableHead>
                  <TableHead className="text-cyan-200">Unit</TableHead>
                  <TableHead className="text-cyan-200">Purpose</TableHead>
                  <TableHead className="text-cyan-200">Valid Until</TableHead>
                  <TableHead className="text-cyan-200">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCodesData.map((code) => (
                  <TableRow key={code.id} className="border-cyan-400/20">
                    <TableCell className="font-mono text-cyan-100 font-bold">
                      {code.access_code}
                    </TableCell>
                    <TableCell className="text-cyan-100">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-cyan-400" />
                        {code.visitor_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-cyan-100">
                      {code.resident?.user?.full_name}
                    </TableCell>
                    <TableCell className="text-cyan-100">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-cyan-400" />
                        {code.resident?.house_unit_number}
                      </div>
                    </TableCell>
                    <TableCell className="text-cyan-100">{code.purpose}</TableCell>
                    <TableCell className="text-cyan-100 text-sm">
                      {formatDateTime(code.valid_until)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityDashboard;
