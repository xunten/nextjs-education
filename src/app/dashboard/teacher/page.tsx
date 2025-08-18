"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  FileText,
  Clock,
  TrendingUp,
  Award,
  AlertCircle,
  Plus,
  Eye,
  Calendar,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for teacher dashboard
  const [dashboardData] = useState({
    totalClasses: 3,
    totalStudents: 105,
    totalAssignments: 24,
    pendingGrading: 8,
    averageGrade: 8.6,
    recentActivities: [
      {
        id: 1,
        type: "submission",
        message: "15 học sinh đã nộp bài tập Chương 3",
        time: "2 giờ trước",
        class: "Toán 12A1",
      },
      {
        id: 2,
        type: "grade",
        message: "Đã chấm xong bài kiểm tra 15 phút",
        time: "4 giờ trước",
        class: "Toán 12A2",
      },
      {
        id: 3,
        type: "question",
        message: "Nguyễn Văn An đã đặt câu hỏi về bài tập",
        time: "1 ngày trước",
        class: "Toán 11A1",
      },
    ],
    upcomingDeadlines: [
      {
        id: 1,
        title: "Bài tập Chương 4 - Hàm số",
        class: "Toán 12A1",
        dueDate: "2024-01-28",
        submissions: 12,
        total: 35,
      },
      {
        id: 2,
        title: "Kiểm tra giữa kỳ",
        class: "Toán 12A2",
        dueDate: "2024-01-30",
        submissions: 0,
        total: 32,
      },
    ],
    topPerformers: [
      { name: "Nguyễn Thị Mai", class: "Toán 12A1", grade: 9.5 },
      { name: "Trần Văn Hùng", class: "Toán 12A1", grade: 9.2 },
      { name: "Lê Thị Hoa", class: "Toán 12A2", grade: 9.0 },
    ],
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setLoading(false);
    } catch {
      localStorage.removeItem("user");
      router.replace("/auth/login");
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng, {user.username}!
          </h1>
          <p className="text-gray-600">
            Tổng quan về hoạt động giảng dạy của bạn
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lớp học</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.totalClasses}
              </div>
              <p className="text-xs text-muted-foreground">Đang giảng dạy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Học sinh</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.totalStudents}
              </div>
              <p className="text-xs text-muted-foreground">Tổng số học sinh</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bài tập</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.totalAssignments}
              </div>
              <p className="text-xs text-muted-foreground">Đã tạo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ chấm</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.pendingGrading}
              </div>
              <p className="text-xs text-muted-foreground">Bài nộp mới</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/assignments/teacher">
                    <Button className="w-full h-20 flex flex-col gap-2">
                      <Plus className="h-5 w-5" />
                      <span className="text-xs">Tạo bài tập</span>
                    </Button>
                  </Link>
                  <Link href="/classes/teacher">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 bg-transparent"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span className="text-xs">Quản lý lớp</span>
                    </Button>
                  </Link>
                  <Link href="/grades/teacher">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 bg-transparent"
                    >
                      <Award className="h-5 w-5" />
                      <span className="text-xs">Xem điểm</span>
                    </Button>
                  </Link>
                  <Link href="/quizzes/teacher">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 bg-transparent"
                    >
                      <Target className="h-5 w-5" />
                      <span className="text-xs">Tạo quiz</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === "submission" && (
                        <FileText className="h-5 w-5 text-blue-500" />
                      )}
                      {activity.type === "grade" && (
                        <Award className="h-5 w-5 text-green-500" />
                      )}
                      {activity.type === "question" && (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.class}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Hạn nộp sắp tới
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{deadline.title}</h4>
                        <Badge variant="outline">{deadline.class}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {deadline.dueDate}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          Đã nộp: {deadline.submissions}/{deadline.total}
                        </span>
                        <span>
                          {Math.round(
                            (deadline.submissions / deadline.total) * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(deadline.submissions / deadline.total) * 100}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tổng quan thành tích
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {dashboardData.averageGrade}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Điểm trung bình chung
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Xuất sắc (≥9.0)</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Giỏi (8.0-8.9)</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Khá (6.5-7.9)</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cần cải thiện</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Học sinh xuất sắc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.topPerformers.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.class}
                      </p>
                    </div>
                    <Badge className="bg-green-500">{student.grade}</Badge>
                  </div>
                ))}
                <Link href="/grades/teacher">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 bg-transparent"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem tất cả
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Bài tập đã tạo tuần này</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bài đã chấm tuần này</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Câu hỏi từ học sinh</span>
                  <span className="font-medium text-orange-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tài liệu đã tải lên</span>
                  <span className="font-medium">12</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
