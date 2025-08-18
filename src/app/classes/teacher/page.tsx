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
import TeacherNotificationBell from "@/components/classDetails/TeacherNotificationToast";
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Users, Plus, Copy, Eye, Settings } from "lucide-react";
import Link from "next/link";
import {
  getTeacherClasses,
  createClass,
  getAllSubjects,
} from "@/services/classService";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DropdownNotificationBell from "@/components/classDetails/DropdownNotificationBell";

const schema = yup.object().shape({
  className: yup.string().required("Tên lớp không được để trống"),
  schoolYear: yup
    .number()
    .typeError("Niên khóa phải là số")
    .required("Vui lòng nhập niên khóa")
    .min(2000, "Niên khóa không hợp lệ"),
  semester: yup.string().required("Vui lòng chọn học kỳ"),
  description: yup.string(),
  subjectId: yup.number().required("Vui lòng chọn môn học"),
});

export default function TeacherClassesPage() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const loadClasses = (page: number) => {
    // Giả định getTeacherClasses trả về dữ liệu phân trang
    getTeacherClasses(2, page, pageSize)
      .then((res) => {
        setClasses(res.data);
        setPageNumber(res.pageNumber);
        setTotalPages(res.totalPages);
      })
      .catch((err) => console.error("Lỗi khi lấy lớp:", err));
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Load lớp học cho giáo viên
      loadClasses(pageNumber);

      // Load danh sách môn học
      getAllSubjects()
        .then((data) => {
          setSubjects(data);
        })
        .catch((err) => console.error("Lỗi khi lấy môn học:", err));
    }
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        teacherId: user.id, // Sử dụng ID của người dùng đã đăng nhập
      };
      await createClass(payload);
      // Sau khi tạo xong, tải lại lớp ở trang hiện tại
      loadClasses(pageNumber);
      reset(); // Xóa dữ liệu trong form
    } catch (err) {
      console.error("Lỗi tạo lớp học:", err);
    }
  };

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Đã sao chép mã lớp!");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const uniqueSubjects =
    subjects?.filter(
      (subject, index, self) =>
        subject &&
        subject.id &&
        index === self.findIndex((s) => s && s.id === subject.id)
    ) || [];

  const uniqueClasses =
    classes?.filter(
      (classItem, index, self) =>
        classItem &&
        classItem.id &&
        index === self.findIndex((c) => c && c.id === classItem.id)
    ) || [];

return (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header + nút tạo lớp và chuông thông báo */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-700">
              Quản lý lớp học
            </h1>
            <p className="text-gray-600">Tạo và quản lý các lớp học của bạn</p>
          </div>
          {/* Đặt chuông thông báo và nút tạo lớp vào cùng một khối */}
          <div className="flex items-center gap-4">
            <DropdownNotificationBell teacherId={2} />
            <TeacherNotificationBell teacherId={2} />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-700 hover:bg-green-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo lớp mới
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-green-700">
                    Tạo lớp học mới
                  </DialogTitle>
                  <DialogDescription>
                    Nhập thông tin để tạo lớp học mới
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Tên lớp</Label>
                    <Input id="className" {...register("className")} />
                    {errors.className && (
                      <p className="text-red-500 text-sm">
                        {errors.className.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolYear">Niên khóa</Label>
                    <Input
                      id="schoolYear"
                      type="number"
                      {...register("schoolYear")}
                    />
                    {errors.schoolYear && (
                      <p className="text-red-500 text-sm">
                        {errors.schoolYear.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Học kỳ</Label>
                    <Select onValueChange={(val) => setValue("semester", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn học kỳ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Học kỳ 1">Học kỳ 1</SelectItem>
                        <SelectItem value="Học kỳ 2">Học kỳ 2</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.semester && (
                      <p className="text-red-500 text-sm">
                        {errors.semester.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea id="description" {...register("description")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Môn học</Label>
                    <Select
                      onValueChange={(val) => setValue("subjectId", Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn môn học" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueSubjects.map((subject, index) => (
                          <SelectItem
                            key={`subject-${subject.id}-${index}`}
                            value={subject.id.toString()}
                          >
                            {subject.subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subjectId && (
                      <p className="text-red-500 text-sm">
                        {errors.subjectId.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800"
                  >
                    Tạo lớp
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Danh sách lớp */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueClasses.map((classItem, index) => (
            <Card
              key={`class-${classItem.id}-${index}`}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-green-700">
                      {classItem.className}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {classItem.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {classItem.studentCount ?? 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-mono">{classItem.id}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyClassCode(classItem.id.toString())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Tạo ngày:{" "}
                    {new Date(classItem.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/classes/${classItem.id}`} className="flex-1">
                      <Button
                        size="sm"
                        className="w-full bg-green-700 hover:bg-green-800 text-white"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem lớp
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-700 text-green-700 hover:bg-green-50"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nút phân trang dạng số */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i).map((num) => (
              <Button
                key={num}
                variant={num === pageNumber ? "default" : "outline"}
                onClick={() => loadClasses(num)}
                className={
                  num === pageNumber
                    ? "bg-green-700 hover:bg-green-800 text-white"
                    : "border-green-700 text-green-700 hover:bg-green-50"
                }
              >
                {num + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
}