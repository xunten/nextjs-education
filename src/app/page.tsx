import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  FileText,
  Trophy,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hệ thống Quản lý Học tập
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Nền tảng học tập hiện đại cho giáo viên và học sinh
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button
                className="w-full bg-green-600 hover:bg-green-600 cursor-pointer"
                size="lg"
              >
                Đăng nhập
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">
                Đăng ký
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Quản lý Lớp học</CardTitle>
              <CardDescription>
                Tạo và quản lý lớp học, theo dõi học sinh
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Bài tập & Kiểm tra</CardTitle>
              <CardDescription>
                Giao bài tập, tạo trắc nghiệm và chấm điểm tự động
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Tương tác</CardTitle>
              <CardDescription>
                Bình luận, thảo luận và hỗ trợ học tập
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Thời khóa biểu</CardTitle>
              <CardDescription>
                Theo dõi lịch học và các hoạt động
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Kết quả học tập</CardTitle>
              <CardDescription>Xem điểm số và đánh giá tiến độ</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="h-8 w-8 text-yellow-600 mb-2" />
              <CardTitle>Bảng xếp hạng</CardTitle>
              <CardDescription>Theo dõi thành tích và xếp hạng</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
