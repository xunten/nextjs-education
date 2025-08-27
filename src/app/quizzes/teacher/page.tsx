"use client";

import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Users, CheckCircle, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { QuizFilters } from "../api";
import { useQuizzesQuery } from "../hooks";
import { TeacherQuizSkeleton } from "../components/TeacherQuizSkeleton";

export default function TeacherQuizzesPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const filters: QuizFilters = useMemo(
    () => ({ page, pageSize: 10, status, search }),
    [page, status, search]
  );

  const {
    data: quizzes = [],
    isLoading,
    isFetching,
    error,
  } = useQuizzesQuery(filters, user?.userId);

  const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date();
    const due = dueDate ? new Date(dueDate) : null;

    if (status === "completed") {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Hoàn thành
        </Badge>
      );
    }
    if (due && due < now) {
      return (
        <Badge variant="destructive">
          <Clock className="h-3 w-3 mr-1" />
          Đã đóng
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500">
        <Clock className="h-3 w-3 mr-1" />
        Đang mở
      </Badge>
    );
  };

  const handleXemKetQua = (quizId: number) => {
    router.push(`teacher/quizResult/${quizId}`);
  };

  const TeacherQuizView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý trắc nghiệm
          </h1>
          <p className="text-gray-600">
            Tạo và theo dõi bài kiểm tra trắc nghiệm
          </p>
        </div>
        <Link href="teacher/quizzCreate">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo bài kiểm tra mới
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-gray-600">Đang tải danh sách…</div>
      ) : error ? (
        <div className="text-red-600">
          {(error as Error).message || "Lỗi khi tải danh sách quizzes"}
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="text-sm text-gray-500">Đang đồng bộ dữ liệu…</div>
          )}
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {quiz.title}{" "}
                        {quiz.className ? `- Lớp: ${quiz.className}` : ""}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {quiz.subject} • {quiz.duration} phút •{" "}
                        {quiz.totalQuestions} câu hỏi
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(quiz.status, quiz.dueDate)}
                      <Badge variant="outline">
                        {quiz.studentsSubmitted}/{quiz.totalStudents} đã làm
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{quiz.description}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleXemKetQua(quiz.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem kết quả
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-1" />
                      Thống kê
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <TeacherQuizSkeleton />
        ) : error ? (
          <div className="text-red-500">Lỗi: {(error as Error).message}</div>
        ) : (
          <TeacherQuizView />
        )}
      </div>
    </div>
  );
}
