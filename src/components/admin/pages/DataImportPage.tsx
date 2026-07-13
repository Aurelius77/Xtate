import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from '@/hooks/useEstateId';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import type { Database } from '@/integrations/supabase/types';

type DueStatus = Database['public']['Enums']['due_status'];

interface ImportResult {
  row: number;
  email: string;
  status: 'success' | 'error';
  message: string;
}

type CSVRow = Record<string, string>;

const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const getValue = (row: CSVRow, aliases: string[]) => {
  const keys = Object.keys(row);
  const match = keys.find((key) => aliases.includes(normalizeHeader(key)));
  return match ? row[match]?.trim() || '' : '';
};

const parseCSV = (content: string) => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    return headers.reduce<CSVRow>((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {});
  });
};

const DataImportPage = () => {
  const estateId = useEstateId();
  const { tenantId, tenantSlug } = useTenant();
  const { toast } = useToast();
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<ImportResult[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  const downloadTemplate = () => {
    const csvContent = `Full Name,Email,Phone,Unit Number,Temporary Password,Date Moved In,Emergency Contact,Due Title,Due Amount,Due Date,Payment Status
John Doe,john@example.com,+2348012345678,A-101,TempPass123!,2026-06-01,Jane Doe +2348023456789,Monthly Service Charge,50000,2026-07-01,pending
Sarah Johnson,sarah@example.com,+2348034567890,B-205,TempPass123!,2026-06-01,Mike Johnson +2348045678901,Security Levy,15000,2026-07-01,pending`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'xtate_resident_import_template.csv';
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const readFile = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(String(event.target?.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });

  const importDueForResident = async (row: CSVRow, residentUserId: string) => {
    if (!estateId) return;

    const dueTitle = getValue(row, ['duetitle']);
    const dueAmount = Number(getValue(row, ['dueamount']));
    const dueDate = getValue(row, ['duedate']);
    const paymentStatus = getValue(row, ['paymentstatus']).toLowerCase() as DueStatus;

    if (!dueTitle || !Number.isFinite(dueAmount) || dueAmount <= 0 || !dueDate) return;

    const { data: resident, error: residentError } = await supabase
      .from('residents')
      .select('id')
      .eq('user_id', residentUserId)
      .maybeSingle();

    if (residentError) throw residentError;
    if (!resident?.id) throw new Error('Created resident profile not found');

    const { data: due, error: dueError } = await supabase
      .from('dues')
      .insert({
        estate_id: estateId,
        title: dueTitle,
        amount: dueAmount,
        due_date: dueDate,
        frequency: 'one_time',
        is_active: true,
      })
      .select('id')
      .single();

    if (dueError) throw dueError;

    const status: DueStatus = ['paid', 'pending', 'overdue', 'pending_confirmation'].includes(paymentStatus)
      ? paymentStatus
      : 'pending';

    const { error: residentDueError } = await supabase.from('resident_dues').insert({
      due_id: due.id,
      resident_id: resident.id,
      estate_id: estateId,
      amount: dueAmount,
      status,
      paid_at: status === 'paid' ? new Date().toISOString() : null,
    });

    if (residentDueError) throw residentDueError;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!tenantId && !tenantSlug) {
      toast({ title: 'Tenant Not Ready', description: 'Resident import needs a tenant context.', variant: 'destructive' });
      return;
    }

    setCurrentFileName(file.name);
    setImportStatus('processing');
    setResults([]);

    try {
      const content = await readFile(file);
      const rows = parseCSV(content);
      const nextResults: ImportResult[] = [];

      for (const [index, row] of rows.entries()) {
        const fullName = getValue(row, ['fullname', 'name']);
        const email = getValue(row, ['email', 'emailaddress']).toLowerCase();
        const phone = getValue(row, ['phone', 'phonenumber']);
        const houseUnit = getValue(row, ['unitnumber', 'houseunit', 'houseunitnumber']);
        const password = getValue(row, ['temporarypassword', 'password', 'temppassword']);
        const emergencyContact = getValue(row, ['emergencycontact']);

        try {
          if (!fullName || !email || !houseUnit || !password) {
            throw new Error('Missing full name, email, unit number, or temporary password');
          }

          const { data, error } = await supabase.functions.invoke<{ ok: boolean; userId?: string; error?: string }>('create-resident-account', {
            body: {
              fullName,
              email,
              phone,
              houseUnit,
              password,
              tenantId: tenantId || undefined,
              tenantSlug: tenantSlug || undefined,
            },
          });

          if (error || !data?.ok || !data.userId) {
            throw new Error(error?.message || data?.error || 'Could not create resident account');
          }

          if (emergencyContact) {
            await supabase
              .from('residents')
              .update({ emergency_contact: emergencyContact })
              .eq('user_id', data.userId);
          }

          await importDueForResident(row, data.userId);

          nextResults.push({ row: index + 2, email, status: 'success', message: 'Imported' });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Import failed';
          nextResults.push({ row: index + 2, email: email || '-', status: 'error', message });
        }
      }

      setResults(nextResults);
      setImportStatus(nextResults.some((result) => result.status === 'success') ? 'success' : 'error');
      toast({
        title: 'Import Complete',
        description: `${nextResults.filter((result) => result.status === 'success').length} imported, ${nextResults.filter((result) => result.status === 'error').length} failed.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not process import file.';
      setImportStatus('error');
      toast({ title: 'Import Failed', description: message, variant: 'destructive' });
    } finally {
      event.target.value = '';
    }
  };

  const successful = results.filter((result) => result.status === 'success').length;
  const failed = results.filter((result) => result.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Import & Management</h1>
          <p className="text-gray-500">Import resident accounts and optional due records from CSV</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Download className="h-5 w-5" />
              Download Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-500 text-sm">
              Use the CSV template so resident account creation and optional due assignment can run correctly.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Required: Full Name, Email, Unit Number, Temporary Password
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Optional: Phone, Emergency Contact, Due Title, Due Amount, Due Date
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Passwords must satisfy the signup password rules
              </div>
            </div>
            <Button onClick={downloadTemplate} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-500 text-sm">
              Upload a completed CSV file. Each valid row creates a resident auth account for this estate.
            </p>
            <div className="border-2 border-dashed border-gray-100 rounded-lg p-6 text-center">
              <FileSpreadsheet className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <Input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" id="file-upload" disabled={importStatus === 'processing'} />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button asChild className="bg-blue-600 hover:bg-blue-700" disabled={importStatus === 'processing'}>
                  <span>{importStatus === 'processing' ? 'Processing...' : 'Choose CSV File'}</span>
                </Button>
              </label>
              <p className="text-xs text-gray-400 mt-2">CSV only for real imports</p>
            </div>

            {currentFileName && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">File</p>
                  <p className="text-sm text-gray-700 truncate">{currentFileName}</p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-emerald-600">{successful} imported</span>
                  </div>
                </div>
                <div className="bg-red-500/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-rose-600">{failed} failed</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
        <CardHeader>
          <CardTitle className="text-gray-900">Import Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-gray-400 text-sm">No import has been run yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="text-gray-500">Row</TableHead>
                  <TableHead className="text-gray-500">Email</TableHead>
                  <TableHead className="text-gray-500">Status</TableHead>
                  <TableHead className="text-gray-500">Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={`${result.row}-${result.email}`} className="border-gray-100">
                    <TableCell className="text-gray-700">{result.row}</TableCell>
                    <TableCell className="text-gray-700">{result.email}</TableCell>
                    <TableCell>
                      <Badge className={result.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}>
                        {result.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{result.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm border-gray-100">
        <CardHeader>
          <CardTitle className="text-gray-900">Import Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Required Fields</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Full Name</li>
                <li>Email Address</li>
                <li>Unit Number</li>
                <li>Temporary Password</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Optional Due Fields</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Due Title</li>
                <li>Due Amount</li>
                <li>Due Date</li>
                <li>Payment Status: paid, pending, overdue</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600 mt-5">
            <DollarSign className="h-4 w-4" />
            Due rows are assigned only to the resident created on that same row.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImportPage;
