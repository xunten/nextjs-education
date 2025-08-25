"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowLeft,
  ArrowRight,
  Send,
} from "lucide-react";
import QuestionCard from "./QuestionCard";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/navigation";
import { QuizResultDialog } from "../components/quiz-result-dialog";
interface QuizResultData {
  studentName: string;
  className: string;
  subject: string;
  duration: string;
  startTime: string;
  endTime: string;
  score: number;
  totalQuestions: number;
  title: string;
}
export default function QuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmited, setIsSubmited] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const QUESTIONS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const currentQuestions = quiz?.questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const token = localStorage.getItem("accessToken");
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/quizzes/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        setQuiz(data);

        setStartTime(new Date());
        setTimeLeft(data.timeLimit * 60);

        const initialAnswers = data.questions?.reduce(
          (acc: Record<number, string>, q: any) => {
            acc[q.id] = "";
            return acc;
          },
          {}
        );
        setQuizAnswers(initialAnswers);
      } catch (err) {
        console.error("Lỗi lấy bài quiz:", err);
      }
    };

    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isSubmitting) handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    if (isSubmitting) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateProgress = () => {
    if (!quiz) return 0;

    const answeredCount = Object.values(quizAnswers).filter(
      (answer) => answer !== ""
    ).length;

    return (answeredCount / quiz.questions.length) * 100;
  };

  const handleSubmit = useCallback(async () => {
    if (!startTime || isSubmitting) return;
    const token = localStorage.getItem("accessToken");
    if (!quiz || !quiz.questions?.length) return;
    const answersPayload: Record<number, string> = {};
    for (const q of quiz.questions) {
      answersPayload[q.id] = quizAnswers[q.id] || "";
    }
    const unanswered = Object.values(answersPayload).filter((v) => !v).length;
    if (unanswered > 0) {
      const ok = confirm(
        `Bạn còn ${unanswered} câu chưa làm. Bạn vẫn muốn nộp chứ?`
      );
      if (!ok) return;
    }
    const user = localStorage.getItem("user");
    const studentId = user ? Number(JSON.parse(user).userId) : 0;
    const submissionPayload = {
      quizId: parseInt(id as string, 10),
      studentId,
      startAt: startTime.toISOString(),
      submittedAt: new Date().toISOString(),
      endAt: new Date().toISOString(),
      answers: answersPayload,
    };
    try {
      const res = await fetch("http://localhost:8080/api/quiz-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(submissionPayload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        console.error("Lỗi khi nộp bài:", error);
        setIsSubmitting(false);
        return;
      }

      setIsSubmited(true);
      const result = await res.json();
      const start = new Date(result.startAt).getTime();
      const end = new Date(result.endAt).getTime();
      const durationMs = Math.max(0, end - start);
      const durationMinutes = Math.floor(durationMs / 60000);
      const durationSeconds = Math.floor((durationMs % 60000) / 1000);

      setQuizResult({
        studentName: result.studentName,
        className: result.className,
        subject: result.subjectName,
        duration: `${durationMinutes} phút ${durationSeconds} giây`,
        startTime: formatDateTime(result.startAt),
        endTime: formatDateTime(result.endAt),
        score: result.score,
        totalQuestions: quiz.questions.length,
        title: quiz.title,
      });

      setIsResultOpen(true);
      setShowResultDialog(true);
    } catch (err) {
      console.error("Lỗi kết nối:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [id, startTime, quiz, quizAnswers, isSubmitting]);
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>

            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 sticky top-4 h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-bold truncate">
                {quiz.title}
              </CardTitle>
              <CardDescription className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Thời gian: {quiz.timeLimit} phút
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Tiến độ
                  </span>
                  <span className="text-sm font-medium text-indigo-600">
                    {Math.round(calculateProgress())}%
                  </span>
                </div>
                <Progress value={calculateProgress()} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Thời gian còn lại:
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {quiz.questions.map((q: any, index: number) => {
                    const pageOfQuestion = Math.floor(
                      index / QUESTIONS_PER_PAGE
                    );
                    const isInCurrentPage = pageOfQuestion === currentPage;
                    const isAnswered = !!quizAnswers[q.id];

                    return (
                      <Button
                        key={q.id}
                        size="icon"
                        onClick={() => setCurrentPage(pageOfQuestion)}
                        className={`
          ${isInCurrentPage ? "border-2 border-primary" : ""}
          ${isAnswered ? "bg-gray-700 text-white  " : ""}
            hover:bg-primary hover:text-white transition
        `}
                        variant="outline"
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmited
                  ? "Đã nộp"
                  : isSubmitting
                  ? "Đang nộp..."
                  : "Nộp bài"}
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent>
                {currentQuestions.map((q: any, idx: number) => (
                  <QuestionCard
                    key={q.id}
                    index={currentPage * QUESTIONS_PER_PAGE + idx}
                    data={q}
                    answer={quizAnswers[q.id]}
                    onAnswer={(val) => handleAnswerChange(q.id, val)}
                  />
                ))}

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Trang trước
                  </Button>

                  {(currentPage + 1) * QUESTIONS_PER_PAGE <
                  quiz.questions.length ? (
                    <Button onClick={() => setCurrentPage((prev) => prev + 1)}>
                      Trang tiếp
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmited
                        ? "Đã nộp"
                        : isSubmitting
                        ? "Đang nộp..."
                        : "Nộp bài"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {quizResult && (
        <QuizResultDialog
          open={isResultOpen}
          onOpenChange={setIsResultOpen}
          data={quizResult}
        />
      )}
    </div>
  );
}
