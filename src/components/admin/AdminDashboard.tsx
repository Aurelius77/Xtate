
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  CreditCard, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Eye,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - in real app, this would come from API
  const stats = {
    total_residents: 150,
    total_active_residents: 142,
    total_dues_amount: 2500000,
    paid_dues_amount: 1800000,
    pending_dues_amount: 500000,
    overdue_dues_amount: 200000,
    total_meetings: 12,
    upcoming_meetings: 2,
    total_complaints: 25,
    open_complaints: 8,
    recent_payments: 15,
  };

  const recentActivities = [
    {
      id: 1,
      type: "payment",
      message: "John Doe paid ₦25,000 for Security Levy",
      time: "2 hours ago",
      status: "success"
    },
    {
      id: 2,
      type: "complaint",
      message: "New complaint submitted by Jane Smith - Street Light Issue",
      time: "4 hours ago",
      status: "pending"
    },
    {
      id: 3,
      type: "meeting",
      message: "Monthly General Meeting scheduled for Dec 30, 2024",
      time: "1 day ago",
      status: "info"
    },
    {
      id: 4,
      type: "resident",
      message: "New resident registration: Mike Johnson (Block C, Flat 5)",
      time: "2 days ago",
      status: "success"
    }
  ];

  const upcomingDues = [
    {
      id: 1,
      title: "Security Levy",
      amount: 25000,
      due_date: "2024-12-31",
      assigned_residents: 142,
      collected: 89
    },
    {
      id: 2,
      title: "Maintenance Fee",
      amount: 15000,
      due_date: "2025-01-15",
      assigned_residents: 142,
      collected: 45
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'info': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.full_name}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Quick Actions
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="residents">Residents</TabsTrigger>
            <TabsTrigger value="dues">Dues</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_residents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total_active_residents} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.paid_dues_amount)}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending_dues_amount)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.recent_payments} recent payments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.open_complaints}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total_complaints} total complaints
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities and Upcoming Dues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest activities in your estate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <Badge variant="secondary" className={getStatusColor(activity.status)}>
                        {activity.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Activities
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Dues</CardTitle>
                  <CardDescription>Dues collection status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingDues.map((due) => (
                    <div key={due.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{due.title}</h4>
                          <p className="text-sm text-gray-600">
                            Due: {new Date(due.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {formatCurrency(due.amount)}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Collection Progress</span>
                        <span>{due.collected}/{due.assigned_residents}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(due.collected / due.assigned_residents) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Dues
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="residents">
            <Card>
              <CardHeader>
                <CardTitle>Resident Management</CardTitle>
                <CardDescription>Manage estate residents and their information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Resident management features coming soon</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Resident
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dues">
            <Card>
              <CardHeader>
                <CardTitle>Dues Management</CardTitle>
                <CardDescription>Create and manage estate dues and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Dues management features coming soon</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Due
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Management</CardTitle>
                <CardDescription>Schedule meetings and track attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Meeting management features coming soon</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints">
            <Card>
              <CardHeader>
                <CardTitle>Complaint Management</CardTitle>
                <CardDescription>Review and manage resident complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Complaint management features coming soon</p>
                  <Button variant="outline">
                    View All Complaints
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
