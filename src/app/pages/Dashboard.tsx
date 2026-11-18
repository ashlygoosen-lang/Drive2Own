import { Header } from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { 
  CheckCircle2, 
  Car, 
  TrendingUp, 
  Calendar,
  FileText,
  DollarSign,
  Award
} from "lucide-react";
import { Link } from "react-router";

export function Dashboard() {
  // Mock data - in production this would come from backend
  const userData = {
    name: "Thabo Molefe",
    memberSince: "January 2026",
    ownershipProgress: 35,
    totalPaid: 42500,
    remainingBalance: 78500,
    monthlyPayment: 3500,
    nextPaymentDate: "March 20, 2026",
    vehicleModel: "Toyota Corolla Quest 2023",
    estimatedOwnershipDate: "January 2028",
  };

  const verifiedDocuments = [
    { name: "SA ID Front", verified: true },
    { name: "SA ID Back", verified: true },
    { name: "PrDP", verified: true },
    { name: "Bank Statements", verified: true },
    { name: "Uber Screenshot", verified: true },
    { name: "Proof of Residence", verified: true },
  ];

  const recentPayments = [
    { date: "March 1, 2026", amount: 3500, status: "Completed" },
    { date: "February 1, 2026", amount: 3500, status: "Completed" },
    { date: "January 15, 2026", amount: 5000, status: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userData.name}! 👋</h1>
          <p className="text-gray-600">Track your journey to vehicle ownership</p>
        </div>

        {/* Profile Verification Card */}
        <Card className="mb-8 bg-gradient-to-br from-[#00C853] to-[#00a843] text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Verified SA ID ✓</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">PrDP Status: Active ✓</span>
                </div>
                <div className="text-sm text-green-100">
                  Member since {userData.memberSince}
                </div>
              </div>
              <Link to="/documents">
                <Button variant="outline" className="bg-white text-[#00C853] hover:bg-gray-100">
                  View Documents
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ownership Progress</p>
                  <p className="text-2xl font-bold">{userData.ownershipProgress}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#00C853]" />
                </div>
              </div>
              <Progress value={userData.ownershipProgress} className="mt-4 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                  <p className="text-2xl font-bold">R {userData.totalPaid.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                R {userData.remainingBalance.toLocaleString()} remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
                  <p className="text-2xl font-bold">R {userData.monthlyPayment.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Next: {userData.nextPaymentDate}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Est. Ownership</p>
                  <p className="text-lg font-bold">{userData.estimatedOwnershipDate}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                22 months remaining
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Vehicle Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#00C853]" />
                Your Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{userData.vehicleModel}</h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>{' '}
                      <span className="font-medium text-[#00C853]">Active</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Condition:</span>{' '}
                      <span className="font-medium">Excellent</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mileage:</span>{' '}
                      <span className="font-medium">45,230 km</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Service:</span>{' '}
                      <span className="font-medium">Feb 2026</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Ownership Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#00C853] rounded-full flex items-center justify-center text-white text-sm">
                        ✓
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Application Approved</p>
                        <p className="text-xs text-gray-500">January 15, 2026</p>
                      </div>
                    </div>
                    <div className="ml-4 border-l-2 border-gray-200 h-4"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#00C853] rounded-full flex items-center justify-center text-white text-sm">
                        ✓
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">First Payment Received</p>
                        <p className="text-xs text-gray-500">January 15, 2026</p>
                      </div>
                    </div>
                    <div className="ml-4 border-l-2 border-[#00C853] h-4"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#00C853] rounded-full flex items-center justify-center text-white text-sm">
                        35%
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Current Progress</p>
                        <p className="text-xs text-gray-500">On track for {userData.estimatedOwnershipDate}</p>
                      </div>
                    </div>
                    <div className="ml-4 border-l-2 border-dashed border-gray-300 h-4"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm">
                        🎉
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-600">Full Ownership</p>
                        <p className="text-xs text-gray-500">{userData.estimatedOwnershipDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-[#00C853] hover:bg-[#00b84a]">
                  Make Payment
                </Button>
                <Link to="/documents" className="block">
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    View Documents
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Service
                </Button>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPayments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">R {payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{payment.date}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="w-full mt-3 text-[#00C853]">
                  View All Payments
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
