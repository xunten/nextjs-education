"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Clock, Users, CheckCircle, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
interface QuizCard {
  id: number;
  title: string;
  className: string;
  description: string;
  duration: number;
  totalQuestions: number;
  totalStudents: number;
  status: string;
  dueDate: string;
  grade: string;
  createBy: number;
  classID: number;
  subject: string;
  studentsSubmitted: number;
}

export default function TeacherQuizzesPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<QuizCard[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/quizzes")
      .then((res) => res.json())
      .then((data) => {
        console.log("data ", data);

        const filledData = data.map((quiz) => ({
          id: quiz.id,
          title: quiz.title || "Không có tiêu đề",
          description: quiz.description || "Không có mô tả",
          className: quiz.className || "Chưa rõ lớp",
          duration: quiz.timeLimit || 0,
          totalQuestions: quiz.questions.length || 0,
          totalStudents: quiz.totalStudents ?? null,
          createdAt: quiz.createdAt ?? null,
          dueDate: quiz.endDate ?? null,
          subject: quiz.subject ?? "chưa có môn",
          studentsSubmitted: quiz.studentsSubmitted || 0,
        }));
        console.log(filledData);

        setQuizzes(filledData);
      })
      .catch((err) => {
        console.error("Lỗi khi fetch quizzes:", err);
      });
  }, []);

  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    className: "",
    duration: 15,
    dueDate: "",
    questions: [],
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);

    if (status === "completed") {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Hoàn thành
        </Badge>
      );
    }
    if (due < now) {
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

      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {quiz.title} - Lớp: {quiz.className}
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <TeacherQuizView />
      </div>
    </div>
  );
}
