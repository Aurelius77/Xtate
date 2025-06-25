
import React, { useState } from 'react';
import { Plus, DollarSign, Calendar, FileText, CheckCircle, Clock, X, Eye, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      title: 'Security Services',
      amount: 150000,
      category: 'Security',
      date: '2024-01-15',
      description: 'Monthly security personnel payment',
      status: 'approved',
      createdBy: 'John Admin',
      approvedBy: 'Estate Manager',
      receipt: null
    },
    {
      id: 2,
      title: 'Maintenance Supplies',
      amount: 75000,
      category: 'Maintenance',
      date: '2024-01-14',
      description: 'Paint, tools, and cleaning supplies',
      status: 'pending',
      createdBy: 'Jane Admin',
      approvedBy: null,
      receipt: null
    },
    {
      id: 3,
      title: 'Electricity Bill',
      amount: 200000,
      category: 'Utilities',
      date: '2024-01-10',
      description: 'Monthly electricity bill for common areas',
      status: 'rejected',
      createdBy: 'Mike Admin',
      approvedBy: 'Estate Manager',
      receipt: null
    }
  ]);

  const [showNewExpense, setShowNewExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: '',
    date: '',
    description: '',
    receipt: null
  });

  const categories = [
    'Security', 'Maintenance', 'Utilities', 'Cleaning',
    'Landscaping', 'Repairs', 'Equipment', 'Administrative', 'Other'
  ];

  const handleSubmitExpense = () => {
    if (newExpense.title && newExpense.amount && newExpense.category && newExpense.date) {
      const expense = {
        id: expenses.length + 1,
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        status: 'pending',
        createdBy: 'Current Admin',
        approvedBy: null
      };
      setExpenses(prev => [expense, ...prev]);
      setNewExpense({
        title: '',
        amount: '',
        category: '',
        date: '',
        description: '',
        receipt: null
      });
      setShowNewExpense(false);
    }
  };

  const handleStatusUpdate = (id: number, newStatus: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id 
        ? { 
            ...expense, 
            status: newStatus,
            approvedBy: newStatus === 'approved' ? 'Estate Manager' : expense.approvedBy
          }
        : expense
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getApprovedExpenses = () => {
    return expenses.filter(e => e.status === 'approved').reduce((total, expense) => total + expense.amount, 0);
  };

  const getPendingExpenses = () => {
    return expenses.filter(e => e.status === 'pending').reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Expense Management</h1>
          <p className="text-cyan-200">Record and manage estate expenses</p>
        </div>
        <Button 
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
          onClick={() => setShowNewExpense(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Expense
        </Button>
      </div>

      {/* Expense Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Total Expenses</p>
                <p className="text-2xl font-semibold text-cyan-50">₦{getTotalExpenses().toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Approved</p>
                <p className="text-2xl font-semibold text-green-400">₦{getApprovedExpenses().toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">Pending Approval</p>
                <p className="text-2xl font-semibold text-yellow-400">₦{getPendingExpenses().toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300">This Month</p>
                <p className="text-2xl font-semibold text-purple-400">{expenses.length}</p>
              </div>
              <div className="h-10 w-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Expense Form */}
      {showNewExpense && (
        <Card className="glass-card border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-50">Record New Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">Expense Title</label>
                <Input
                  className="glass border-cyan-400/30 text-cyan-100 placeholder:text-cyan-300"
                  placeholder="Enter expense title"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">Amount (₦)</label>
                <Input
                  type="number"
                  className="glass border-cyan-400/30 text-cyan-100 placeholder:text-cyan-300"
                  placeholder="Enter amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">Category</label>
                <select
                  className="w-full glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 bg-slate-800/50"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">Date</label>
                <Input
                  type="date"
                  className="glass border-cyan-400/30 text-cyan-100"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Description</label>
              <textarea
                className="w-full glass border-cyan-400/30 rounded-md px-3 py-2 text-cyan-100 placeholder:text-cyan-300 bg-slate-800/50"
                rows={3}
                placeholder="Enter expense description"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={handleSubmitExpense}>
                Record Expense
              </Button>
              <Button variant="outline" className="glass border-cyan-400/30 text-cyan-200" onClick={() => setShowNewExpense(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Card className="glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-50">All Expenses</CardTitle>
          <CardDescription className="text-cyan-200">Manage and approve expense records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 glass rounded-lg">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-cyan-50">{expense.title}</h3>
                      <Badge className={`text-xs ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold text-cyan-100">₦{expense.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-4 text-xs text-cyan-300 mt-1">
                      <span>{expense.category}</span>
                      <span>{expense.date}</span>
                      <span>By {expense.createdBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {expense.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleStatusUpdate(expense.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="glass border-red-400/30 text-red-300 hover:bg-red-500/20"
                        onClick={() => handleStatusUpdate(expense.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="glass border-cyan-400/30 text-cyan-200">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-cyan-400/20">
                      <DialogHeader>
                        <DialogTitle className="text-cyan-50">Expense Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-cyan-300 text-sm">Title:</span>
                            <p className="text-cyan-100">{expense.title}</p>
                          </div>
                          <div>
                            <span className="text-cyan-300 text-sm">Amount:</span>
                            <p className="text-cyan-100">₦{expense.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-cyan-300 text-sm">Category:</span>
                            <p className="text-cyan-100">{expense.category}</p>
                          </div>
                          <div>
                            <span className="text-cyan-300 text-sm">Date:</span>
                            <p className="text-cyan-100">{expense.date}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-cyan-300 text-sm">Description:</span>
                          <p className="text-cyan-100 mt-1">{expense.description}</p>
                        </div>
                        <div>
                          <span className="text-cyan-300 text-sm">Status:</span>
                          <Badge className={`ml-2 ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </Badge>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesPage;
