
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Plus, User, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityPersonnel {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  shift: 'day' | 'night' | 'rotational';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

const SecurityManagementPage = () => {
  const [securityPersonnel, setSecurityPersonnel] = useState<SecurityPersonnel[]>([
    {
      id: '1',
      full_name: 'John Security',
      email: 'john.security@estate.com',
      phone: '+1234567890',
      employee_id: 'SEC001',
      shift: 'day',
      is_active: true,
      created_at: '2024-01-10T10:00:00Z',
      last_login: '2024-01-15T08:00:00Z'
    },
    {
      id: '2',
      full_name: 'Mary Guard',
      email: 'mary.guard@estate.com',
      phone: '+1234567891',
      employee_id: 'SEC002',
      shift: 'night',
      is_active: true,
      created_at: '2024-01-12T10:00:00Z',
      last_login: '2024-01-14T20:00:00Z'
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<SecurityPersonnel | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    employee_id: '',
    shift: 'day' as 'day' | 'night' | 'rotational',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      employee_id: '',
      shift: 'day',
      password: ''
    });
    setShowPassword(false);
  };

  const handleCreatePersonnel = () => {
    if (!formData.full_name || !formData.email || !formData.employee_id || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newPersonnel: SecurityPersonnel = {
      id: Date.now().toString(),
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      employee_id: formData.employee_id,
      shift: formData.shift,
      is_active: true,
      created_at: new Date().toISOString()
    };

    setSecurityPersonnel([...securityPersonnel, newPersonnel]);
    resetForm();
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Security personnel ${formData.full_name} created successfully`,
    });
  };

  const handleEditPersonnel = () => {
    if (!selectedPersonnel || !formData.full_name || !formData.email || !formData.employee_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const updatedPersonnel = securityPersonnel.map(person => 
      person.id === selectedPersonnel.id 
        ? { ...person, ...formData }
        : person
    );

    setSecurityPersonnel(updatedPersonnel);
    resetForm();
    setIsEditDialogOpen(false);
    setSelectedPersonnel(null);
    
    toast({
      title: "Success",
      description: "Security personnel updated successfully",
    });
  };

  const handleDeactivatePersonnel = (personnel: SecurityPersonnel) => {
    const updatedPersonnel = securityPersonnel.map(person => 
      person.id === personnel.id 
        ? { ...person, is_active: !person.is_active }
        : person
    );

    setSecurityPersonnel(updatedPersonnel);
    
    toast({
      title: "Success",
      description: `Security personnel ${personnel.is_active ? 'deactivated' : 'activated'} successfully`,
    });
  };

  const openEditDialog = (personnel: SecurityPersonnel) => {
    setSelectedPersonnel(personnel);
    setFormData({
      full_name: personnel.full_name,
      email: personnel.email,
      phone: personnel.phone,
      employee_id: personnel.employee_id,
      shift: personnel.shift,
      password: ''
    });
    setIsEditDialogOpen(true);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-50 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Management
          </h2>
          <p className="text-cyan-200">Manage security personnel accounts and access</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="glass bg-blue-600/20 hover:bg-blue-600/30 text-cyan-100">
              <Plus className="h-4 w-4 mr-2" />
              Add Security Personnel
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-cyan-400/20">
            <DialogHeader>
              <DialogTitle className="text-cyan-50">Create Security Personnel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name" className="text-cyan-200">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="glass border-cyan-400/30 text-cyan-100"
                  />
                </div>
                <div>
                  <Label htmlFor="employee_id" className="text-cyan-200">Employee ID *</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="glass border-cyan-400/30 text-cyan-100"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-cyan-200">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass border-cyan-400/30 text-cyan-100"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-cyan-200">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="glass border-cyan-400/30 text-cyan-100"
                />
              </div>

              <div>
                <Label htmlFor="shift" className="text-cyan-200">Shift</Label>
                <select
                  id="shift"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value as 'day' | 'night' | 'rotational' })}
                  className="w-full glass border-cyan-400/30 text-cyan-100 bg-transparent p-2 rounded-md"
                >
                  <option value="day" className="bg-slate-800">Day Shift</option>
                  <option value="night" className="bg-slate-800">Night Shift</option>
                  <option value="rotational" className="bg-slate-800">Rotational</option>
                </select>
              </div>

              <div>
                <Label htmlFor="password" className="text-cyan-200">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="glass border-cyan-400/30 text-cyan-100 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  className="glass border-cyan-400/30 text-cyan-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePersonnel}
                  className="glass bg-blue-600/20 hover:bg-blue-600/30 text-cyan-100"
                >
                  Create Personnel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-50 flex items-center gap-2">
            <User className="h-5 w-5" />
            Security Personnel ({securityPersonnel.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-400/20">
                <TableHead className="text-cyan-200">Name</TableHead>
                <TableHead className="text-cyan-200">Employee ID</TableHead>
                <TableHead className="text-cyan-200">Email</TableHead>
                <TableHead className="text-cyan-200">Shift</TableHead>
                <TableHead className="text-cyan-200">Status</TableHead>
                <TableHead className="text-cyan-200">Last Login</TableHead>
                <TableHead className="text-cyan-200">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {securityPersonnel.map((personnel) => (
                <TableRow key={personnel.id} className="border-cyan-400/20">
                  <TableCell className="text-cyan-100 font-medium">
                    {personnel.full_name}
                  </TableCell>
                  <TableCell className="text-cyan-100 font-mono">
                    {personnel.employee_id}
                  </TableCell>
                  <TableCell className="text-cyan-100">
                    {personnel.email}
                  </TableCell>
                  <TableCell className="text-cyan-100 capitalize">
                    {personnel.shift}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={personnel.is_active 
                        ? "bg-green-500/20 text-green-400 border-green-400/30" 
                        : "bg-red-500/20 text-red-400 border-red-400/30"
                      }
                    >
                      {personnel.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-cyan-100 text-sm">
                    {personnel.last_login ? formatDateTime(personnel.last_login) : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(personnel)}
                        className="glass border-cyan-400/30 text-cyan-100 hover:bg-cyan-600/20"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeactivatePersonnel(personnel)}
                        className={`glass border-cyan-400/30 ${
                          personnel.is_active 
                            ? 'text-red-400 hover:bg-red-600/20' 
                            : 'text-green-400 hover:bg-green-600/20'
                        }`}
                      >
                        {personnel.is_active ? <Trash2 className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-cyan-400/20">
          <DialogHeader>
            <DialogTitle className="text-cyan-50">Edit Security Personnel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_full_name" className="text-cyan-200">Full Name *</Label>
                <Input
                  id="edit_full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="glass border-cyan-400/30 text-cyan-100"
                />
              </div>
              <div>
                <Label htmlFor="edit_employee_id" className="text-cyan-200">Employee ID *</Label>
                <Input
                  id="edit_employee_id"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="glass border-cyan-400/30 text-cyan-100"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_email" className="text-cyan-200">Email *</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass border-cyan-400/30 text-cyan-100"
              />
            </div>

            <div>
              <Label htmlFor="edit_phone" className="text-cyan-200">Phone</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="glass border-cyan-400/30 text-cyan-100"
              />
            </div>

            <div>
              <Label htmlFor="edit_shift" className="text-cyan-200">Shift</Label>
              <select
                id="edit_shift"
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as 'day' | 'night' | 'rotational' })}
                className="w-full glass border-cyan-400/30 text-cyan-100 bg-transparent p-2 rounded-md"
              >
                <option value="day" className="bg-slate-800">Day Shift</option>
                <option value="night" className="bg-slate-800">Night Shift</option>
                <option value="rotational" className="bg-slate-800">Rotational</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit_password" className="text-cyan-200">New Password (leave blank to keep current)</Label>
              <div className="relative">
                <Input
                  id="edit_password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="glass border-cyan-400/30 text-cyan-100 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                  setSelectedPersonnel(null);
                }}
                className="glass border-cyan-400/30 text-cyan-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditPersonnel}
                className="glass bg-blue-600/20 hover:bg-blue-600/30 text-cyan-100"
              >
                Update Personnel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityManagementPage;
