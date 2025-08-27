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
import { Users, Plus, Copy, Eye, Settings, BookOpen, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  getTeacherClasses,
  createClass,
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/services/classService";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DropdownNotificationBell from "@/components/classDetails/DropdownNotificationBell";

const classSchema = yup.object().shape({
  className: yup.string().required("Tên lớp không được để trống"),
  schoolYear: yup
    .number()
    .typeError("Niên khóa phải là số")
    .required("Vui lòng nhập niên khóa")
    .min(2000, "Niên khóa không hợp lệ"),
  semester: yup.string().required("Vui lòng chọn học kỳ"),
  description: yup.string(),
  subjectId: yup.number().required("Vui lòng chọn môn học"),
  joinMode: yup.string().oneOf(["AUTO", "APPROVAL"]).required("Vui lòng chọn chế độ tham gia lớp"),
});

const subjectSchema = yup.object().shape({
  subjectName: yup.string().required("Tên môn học không được để trống"),
  description: yup.string().required("Mô tả không được để trống"),
});

export default function TeacherClassesPage() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);

  // Form cho tạo lớp học
  const classForm = useForm({
    resolver: yupResolver(classSchema),
  });

  // Form cho tạo/sửa môn học
  const subjectForm = useForm({
    resolver: yupResolver(subjectSchema),
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      loadClasses(parsedUser.userId, pageNumber);

      // Load danh sách môn học
      loadSubjects();
    }
  }, []);

  const loadClasses = (userId: number, page: number) => {
    getTeacherClasses(userId, page, pageSize)
      .then((res) => {
        setClasses(res.data);
        setPageNumber(res.pageNumber);
        setTotalPages(res.totalPages);
      })
      .catch((err) => console.error("Lỗi khi lấy lớp:", err));
  };

  const loadSubjects = () => {
    getAllSubjects()
      .then((data) => {
        setSubjects(data);
      })
      .catch((err) => console.error("Lỗi khi lấy môn học:", err));
  };

  const onCreateClass = async (data: any) => {
    try {
      const payload = {
        ...data,
        teacherId: user.userId,
      };
      await createClass(payload);
      loadClasses(user.userId, pageNumber);
      classForm.reset();
    } catch (err) {
      console.error("Lỗi tạo lớp học:", err);
    }
  };

const onCreateSubject = async (data: any) => {
  try {
    const payload = {
      ...data,
      createdById: user.userId,
    };

    if (editingSubject) {
      // API call để cập nhật môn học
      await updateSubject(editingSubject.id, payload);
      console.log("Cập nhật môn học thành công:", payload);
    } else {
      // API call để tạo môn học mới
      await createSubject(payload);
      console.log("Tạo môn học mới thành công:", payload);
    }

    await loadSubjects(); // load lại danh sách môn học
    subjectForm.reset();
    setEditingSubject(null);
    setIsSubjectDialogOpen(false);
  } catch (err) {
    console.error("Lỗi tạo/cập nhật môn học:", err);
  }
};

  const handleEditSubject = (subject: any) => {
    setEditingSubject(subject);
    subjectForm.setValue("subjectName", subject.subjectName);
    subjectForm.setValue("description", subject.description);
    setIsSubjectDialogOpen(true);
  };

  
const handleDeleteSubject = async (subjectId: number) => {
  if (confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
    try {
      // API call để xóa môn học
      await deleteSubject(subjectId);
      console.log("Xóa môn học thành công, ID:", subjectId);

      await loadSubjects(); // load lại danh sách sau khi xóa
    } catch (err) {
      console.error("Lỗi xóa môn học:", err);
    }
  }
};

  const handleCloseSubjectDialog = () => {
    setIsSubjectDialogOpen(false);
    setEditingSubject(null);
    subjectForm.reset();
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
          {/* Header + nút tạo lớp, tạo môn học và chuông thông báo */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-700">
                Quản lý lớp học
              </h1>
              <p className="text-gray-600">
                Tạo và quản lý các lớp học của bạn
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DropdownNotificationBell teacherId={user.userId} />
              <TeacherNotificationBell teacherId={user.userId} />
              
              {/* Dialog tạo/quản lý môn học */}
              <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-50">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Quản lý môn học
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-green-700">
                      {editingSubject ? "Sửa môn học" : "Tạo môn học mới"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSubject ? "Cập nhật thông tin môn học" : "Nhập thông tin để tạo môn học mới"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex-1 overflow-y-auto">
                    {/* Form tạo/sửa môn học */}
                    <form onSubmit={subjectForm.handleSubmit(onCreateSubject)} className="space-y-4 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="subjectName">Tên môn học</Label>
                        <Input id="subjectName" {...subjectForm.register("subjectName")} />
                        {subjectForm.formState.errors.subjectName && (
                          <p className="text-red-500 text-sm">
                            {subjectForm.formState.errors.subjectName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subjectDescription">Mô tả</Label>
                        <Textarea id="subjectDescription" {...subjectForm.register("description")} rows={3} />
                        {subjectForm.formState.errors.description && (
                          <p className="text-red-500 text-sm">
                            {subjectForm.formState.errors.description.message}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="bg-green-700 hover:bg-green-800"
                        >
                          {editingSubject ? "Cập nhật" : "Tạo môn học"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseSubjectDialog}
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>

                    {/* Danh sách môn học */}
                    <div>
                      <h3 className="text-lg font-semibold text-green-700 mb-4">Danh sách môn học</h3>
                      <div className="space-y-2">
                        {uniqueSubjects.length > 0 ? (
                          uniqueSubjects.map((subject) => (
                            <Card key={subject.id} className="p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-green-700 truncate">{subject.subjectName}</h4>
                                  <p className="text-sm text-gray-600 line-clamp-2">{subject.description}</p>
                                </div>
                                <div className="flex gap-1 ml-4 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditSubject(subject)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                    onClick={() => handleDeleteSubject(subject.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">Chưa có môn học nào</p>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Dialog tạo lớp học */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-700 hover:bg-green-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo lớp mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="text-green-700">
                      Tạo lớp học mới
                    </DialogTitle>
                    <DialogDescription>
                      Nhập thông tin để tạo lớp học mới
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={classForm.handleSubmit(onCreateClass)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="className">Tên lớp</Label>
                      <Input id="className" {...classForm.register("className")} />
                      {classForm.formState.errors.className && (
                        <p className="text-red-500 text-sm">
                          {classForm.formState.errors.className.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolYear">Niên khóa</Label>
                      <Input
                        id="schoolYear"
                        type="number"
                        {...classForm.register("schoolYear")}
                      />
                      {classForm.formState.errors.schoolYear && (
                        <p className="text-red-500 text-sm">
                          {classForm.formState.errors.schoolYear.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Học kỳ</Label>
                      <Select
                        onValueChange={(val) => classForm.setValue("semester", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn học kỳ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Học kỳ 1">Học kỳ 1</SelectItem>
                          <SelectItem value="Học kỳ 2">Học kỳ 2</SelectItem>
                          <SelectItem value="Học kỳ hè">Học kỳ hè</SelectItem>
                        </SelectContent>
                      </Select>
                      {classForm.formState.errors.semester && (
                        <p className="text-red-500 text-sm">
                          {classForm.formState.errors.semester.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả</Label>
                      <Textarea id="description" {...classForm.register("description")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Môn học</Label>
                      <Select
                        onValueChange={(val) =>
                          classForm.setValue("subjectId", Number(val))
                        }
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
                      {classForm.formState.errors.subjectId && (
                        <p className="text-red-500 text-sm">
                          {classForm.formState.errors.subjectId.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Chế độ tham gia lớp</Label>
                      <Select onValueChange={(val) => classForm.setValue("joinMode", val as "AUTO" | "APPROVAL")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chế độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AUTO">Tự động vào (không cần duyệt)</SelectItem>
                          <SelectItem value="APPROVAL">Cần giáo viên duyệt</SelectItem>
                        </SelectContent>
                      </Select>
                      {classForm.formState.errors.joinMode && (
                        <p className="text-red-500 text-sm">{classForm.formState.errors.joinMode.message}</p>
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
                    <div className="flex items-center gap-4">
                      <label htmlFor="">Mã lớp: </label>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-mono">{classItem.id}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyClassCode(classItem.id.toString())}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Tạo ngày:{" "}
                      {new Date(classItem.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/classes/${classItem.id}`}
                        className="flex-1"
                      >
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
                  onClick={() => loadClasses(user.userId,num)}
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