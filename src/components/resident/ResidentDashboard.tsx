
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Calendar, 
  MessageSquare, 
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ResidentDashboard = () => {
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const residentData = {
    house_unit: "Block A, Flat 3",
    outstanding_dues: 40000,
    paid_this_month: 25000,
    next_due_date: "2024-12-31",
    attendance_rate: 85,
  };

  const outstandingDues = [
    {
      id: 1,
      title: "Security Levy",
      amount: 25000,
      due_date: "2024-12-31",
      status: "pending",
      description: "Monthly security maintenance fee"
    },
    {
      id: 2,
      title: "Maintenance Fee",
      amount: 15000,
      due_date: "2025-01-15",
      status: "pending",
      description: "General estate maintenance"
    }
  ];

  const recentPayments = [
    {
      id: 1,
      title: "Electricity Bill",
      amount: 12000,
      paid_date: "2024-11-15",
      status: "confirmed",
      reference: "EST-2024-001"
    },
    {
      id: 2,
      title: "Water Bill",
      amount: 8000,
      paid_date: "2024-11-10",
      status: "confirmed",
      reference: "EST-2024-002"
    }
  ];

  const upcomingMeetings = [
    {
      id: 1,
      title: "Monthly General Meeting",
      date: "2024-12-30",
      time: "6:00 PM",
      location: "Community Hall",
      can_attend: true
    },
    {
      id: 2,
      title: "Security Committee Meeting",
      date: "2025-01-05",
      time: "7:00 PM",
      location: "Admin Office",
      can_attend: false
    }
  ];

  const recentAnnouncements = [
    {
      id: 1,
      title: "Water Supply Maintenance",
      content: "Water supply will be temporarily interrupted on Dec 28, 2024 from 8 AM to 2 PM for routine maintenance.",
      date: "2024-12-26",
      is_urgent: true
    },
    {
      id: 2,
      title: "New Security Protocols",
      content: "Please ensure all visitors are properly registered at the gate. New visitor management system is now active.",
      date: "2024-12-24",
      is_urgent: false
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
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resident Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.full_name}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{residentData.house_unit}</Badge>
            </div>
          </div>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Dues</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(residentData.outstanding_dues)}
              </div>
              <p className="text-xs text-muted-foreground">
                Due by {new Date(residentData.next_due_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(residentData.paid_this_month)}
              </div>
              <p className="text-xs text-muted-foreground">
                2 payments confirmed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{residentData.attendance_rate}%</div>
              <p className="text-xs text-muted-foreground">
                Last 6 meetings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Meeting</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Dec 30</div>
              <p className="text-xs text-muted-foreground">
                Monthly General Meeting
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Announcements */}
        {recentAnnouncements.filter(a => a.is_urgent).length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Urgent Announcement:</strong> {recentAnnouncements.find(a => a.is_urgent)?.title}
              <br />
              <span className="text-sm">{recentAnnouncements.find(a => a.is_urgent)?.content}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Outstanding Dues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Outstanding Dues
              </CardTitle>
              <CardDescription>Your pending payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {outstandingDues.map((due) => {
                const daysUntil = getDaysUntilDue(due.due_date);
                return (
                  <div key={due.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{due.title}</h4>
                        <p className="text-sm text-gray-600">{due.description}</p>
                      </div>
                      <Badge className={getStatusColor(due.status)}>
                        {formatCurrency(due.amount)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Due Date: {new Date(due.due_date).toLocaleDateString()}
                        {daysUntil <= 7 && (
                          <span className="text-red-600 ml-2">
                            ({daysUntil} days left)
                          </span>
                        )}
                      </div>
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    </div>
                  </div>
                );
              })}
              {outstandingDues.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">All dues are up to date!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Your payment history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h4 className="font-medium">{payment.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.paid_date).toLocaleDateString()} • {payment.reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(payment.amount)}</div>
                    <Badge variant="secondary" className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Payments
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Meetings and Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Meetings
              </CardTitle>
              <CardDescription>Mark your attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{meeting.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                      </p>
                      <p className="text-sm text-gray-600">{meeting.location}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" disabled={!meeting.can_attend}>
                      Mark Attending
                    </Button>
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Announcements
              </CardTitle>
              <CardDescription>Stay updated with estate news</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{announcement.title}</h4>
                    {announcement.is_urgent && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(announcement.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Announcements
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might need</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                Submit Complaint
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                View Meetings
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <CreditCard className="h-6 w-6 mb-2" />
                Payment History
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <MessageSquare className="h-6 w-6 mb-2" />
                Contact Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResidentDashboard;
