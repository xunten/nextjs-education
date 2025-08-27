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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, CheckCircle, Play, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentQuizzesPage() {
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  const router = useRouter();
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // hoặc nơi bạn đang lưu token
        const user = localStorage.getItem("user"); // hoặc nơi bạn đang lưu token
        const userid = JSON.parse(user).id;
        const response = await fetch(
          `http://localhost:8080/api/quizzes/student/${userid}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // thêm access token
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setQuizzes(data.data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, []);

  const handleSubmitQuiz = () => {
    setIsQuizStarted(false);
    setActiveQuiz(null);
    alert("Đã nộp bài kiểm tra!");
  };

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

  if (!user) {
    return <div>Loading...</div>;
  }

  // if (activeQuiz && isQuizStarted) {

  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bài kiểm tra trắc nghiệm
            </h1>
            <p className="text-gray-600">Làm bài kiểm tra và xem kết quả</p>
          </div>

          <Tabs defaultValue="available" className="space-y-4">
            <TabsList>
              <TabsTrigger value="available">Có thể làm</TabsTrigger>
              <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {quizzes.map((quiz) => {
                const totalQuestions = quiz.questions?.length || 0;
                const status =
                  new Date(quiz.endDate) < new Date() ? "completed" : "active";
                const dueDate = quiz.endDate;

                return (
                  <Card key={quiz.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {quiz.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Lớp {quiz.grade} • {quiz.timeLimit} phút •{" "}
                            {totalQuestions} câu hỏi
                          </CardDescription>
                        </div>
                        {getStatusBadge(status, dueDate)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{quiz.description}</p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            Thời gian: {quiz.timeLimit} phút
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            Số câu: {totalQuestions}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`student/${quiz.quizId}`)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Bắt đầu làm bài
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {quizzes
                .filter((q) => q.status === "completed")
                .map((quiz) => (
                  <Card key={quiz.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {quiz.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {quiz.className} • Đã hoàn thành
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(quiz.status, quiz.dueDate)}
                          <Badge className="bg-green-500">Điểm: 8.5/10</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{quiz.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Xem kết quả
                        </Button>
                        <Button size="sm" variant="outline">
                          Xem đáp án
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
