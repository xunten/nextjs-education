"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  Edit,
  LayoutGrid,
  BookOpen,
  FileEdit,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { readDocxFile } from "./ReadDocxFile";
import { useRouter } from "next/navigation";
import { useQuizzStorage } from "../lib/store/useQuizzStorage";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "./type";
interface QuizFormData {
  title: string;
  grade: string;
  subject: string;
  startDate: string;
  endDate: string;
  time: string;
  description: string;
  files: File[];
  classId: number;
  createdBy: number;
}

export default function CreateQuizzPage() {
  const router = useRouter();
  const { setData } = useQuizzStorage();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<QuizFormData>({
    defaultValues: {
      title: "Đề kiểm tra 15 phút Toán học - Lớp 10",
      grade: "10",
      subject: "Văn",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      time: "40",
      description: "Đề kiểm tra 15 phút chương I",
      files: [],
      classId: 2,
      createdBy: 2,
    },
    resolver: yupResolver(schema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setValue("files", selected);
    setSelectedFiles(selected);
  };

  const readMultipleFiles = async (files: File[]) => {
    let combinedQuestions: any[] = [];

    for (const file of files) {
      const questions = await readDocxFile(file);
      combinedQuestions = [...combinedQuestions, ...questions];
    }

    return combinedQuestions;
  };

  const onSubmit = async (data: QuizFormData) => {
    if (!data.files || data.files.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 file DOCX");
      return;
    }

    try {
      const questions = await readMultipleFiles(data.files);
      if (questions.length === 0) {
        toast.error("Không tìm thấy câu hỏi hợp lệ trong file.");
        return;
      }

      const fileName = data.files.map((f) => f.name).join(", ");

      setData({
        ...data,
        questions,
        fileName,
      });

      router.push("/quizzes/teacher/quizzPreview");
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi đọc file.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Tạo Đề Thi Mới</h1>
        <p className="text-slate-600 mt-2">
          Lựa chọn phương thức tạo đề thi phù hợp với nhu cầu của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow">
          <CardHeader className=" rounded-t-lg p-2">
            <div className="flex items-center space-x-3">
              <div className="p-4 bg-blue-100 rounded-lg">
                <FileEdit className=" text-blue-600" />
              </div>
              <div className="py-2">
                <CardTitle className="text-slate-800">
                  Thông tin đề thi
                </CardTitle>
                <CardDescription>
                  Nhập thông tin cơ bản cho đề thi mới
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className=" space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input placeholder="Tiêu đề" {...register("title")} />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}

              <Input placeholder="Khối lớp" {...register("grade")} />
              {errors.grade && (
                <p className="text-red-500 text-sm">{errors.grade.message}</p>
              )}

              <Controller
                control={control}
                name="subject"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Toán</SelectItem>
                      <SelectItem value="literature">Văn</SelectItem>
                      <SelectItem value="english">Anh</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subject && (
                <p className="text-red-500 text-sm">{errors.subject.message}</p>
              )}

              <Input type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-red-500 text-sm">
                  {errors.startDate.message}
                </p>
              )}

              <Input type="date" {...register("endDate")} />
              {errors.endDate && (
                <p className="text-red-500 text-sm">{errors.endDate.message}</p>
              )}

              <Input
                type="number"
                placeholder="Thời gian làm bài (phút)"
                {...register("time")}
              />
              {errors.time && (
                <p className="text-red-500 text-sm">{errors.time.message}</p>
              )}

              <Textarea placeholder="Mô tả đề" {...register("description")} />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}

              <Input
                type="file"
                multiple
                accept=".docx"
                onChange={handleFileChange}
              />
              {errors.files && (
                <p className="text-red-500 text-sm">
                  {(errors.files as any)?.message}
                </p>
              )}

              {selectedFiles.length > 0 && (
                <ul className="text-sm text-gray-600">
                  {selectedFiles.map((file, idx) => (
                    <li key={idx}>📄 {file.name}</li>
                  ))}
                </ul>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Tiếp tục
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <div className="space-y-5">
            <Card className="hover:shadow-lg transition-shadow border border-blue-100">
              <CardContent className=" flex gap-4 items-start">
                <div className="bg-blue-100 p-3 rounded-lg mt-1">
                  <Edit className="text-blue-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-800">
                    Tự soạn đề thi / Bài tập
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Sử dụng trình soạn thảo trực quan của hệ thống để tạo đề thi
                    với đầy đủ các loại câu hỏi
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Bắt đầu soạn đề
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-green-100">
              <CardContent className=" flex gap-4 items-start">
                <div className="bg-green-100 p-3 rounded-lg mt-1">
                  <BookOpen className="text-green-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-800">
                    Đề thi đánh giá năng lực
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Sử dụng bộ đề có sẵn theo chuẩn đánh giá năng lực của Bộ
                    GD&amp;ĐT
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    Chọn bộ đề
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-purple-100">
              <CardContent className=" flex gap-4 items-start">
                <div className="bg-purple-100 p-3 rounded-lg mt-1">
                  <LayoutGrid className="text-purple-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-800">
                    Tạo đề từ Ma trận đề
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Tự động sinh đề thi dựa trên ma trận kiến thức và cấu trúc
                    đề thi
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    Thiết lập ma trận
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-orange-100">
              <CardContent className=" flex gap-4 items-start">
                <div className="bg-orange-100 p-3 rounded-lg mt-1">
                  <FileText className="text-orange-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-800">
                    Tạo đề offline
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Upload đề thi giấy hoặc nhập thông tin từ file có sẵn
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    Tải lên đề thi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
