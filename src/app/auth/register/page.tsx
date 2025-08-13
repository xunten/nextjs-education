"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { authService } from "@/services/authService";
import { toast } from "react-toastify";

const schema = yup.object({
  fullName: yup.string().required("Họ và tên là bắt buộc"),
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .min(8, "Mật khẩu ít nhất 8 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
  role: yup.string().required("Vui lòng chọn vai trò"),
  // teacherId: yup.string().when("role", {
  //   is: "teacher",
  //   then: (schema) => schema.required("Mã số giáo viên là bắt buộc"),
  // }),
  // subject: yup.string().when("role", {
  //   is: "teacher",
  //   then: (schema) => schema.required("Môn giảng dạy là bắt buộc"),
  // }),
});

type FormData = yup.InferType<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const roleValue = watch("role");

  const onSubmit = async (data: FormData) => {
    try {
      const response = await authService.register({
        username: data.email,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        roleName: data.role,
      });

      localStorage.setItem("token", response.accessToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: response.userId,
          username: response.username,
          email: response.email,
        })
      );
      router.push("/auth/login");
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "message" in error) {
        // const errorMessage = (error as { message: string }).message;
        toast.error("Email đã được sử dụng, vui lòng thử email khác.");
      } else {
        toast.error("Đăng ký thất bại, vui lòng thử lại sau.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={100}
            height={100}
            priority
            className="mx-auto mb-4 object-contain"
          />
          <CardTitle className="text-2xl text-center">
            Đăng ký tài khoản
          </CardTitle>
          <CardDescription className="text-center">
            Tạo tài khoản mới để sử dụng hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-red-500 text-sm">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1">
              <Label>Vai trò</Label>
              <Select onValueChange={(value) => setValue("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Học sinh</SelectItem>
                  <SelectItem value="teacher">Giáo viên</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm">{errors.role.message}</p>
              )}
            </div>

            {/* Teacher fields */}
            {roleValue === "teacher" && (
              <>
                {/* <div className="space-y-1">
                  <Label htmlFor="teacherId">Mã số giáo viên</Label>
                  <Input id="teacherId" {...register("teacherId")} />
                  {errors.teacherId && (
                    <p className="text-red-500 text-sm">
                      {errors.teacherId.message}
                    </p>
                  )}
                </div> */}
                {/* <div className="space-y-1">
                  <Label>Môn giảng dạy</Label>
                  <Select onValueChange={(value) => setValue("subject", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Toán học</SelectItem>
                      <SelectItem value="physics">Vật lý</SelectItem>
                      <SelectItem value="chemistry">Hóa học</SelectItem>
                      <SelectItem value="biology">Sinh học</SelectItem>
                      <SelectItem value="literature">Ngữ văn</SelectItem>
                      <SelectItem value="english">Tiếng Anh</SelectItem>
                      <SelectItem value="history">Lịch sử</SelectItem>
                      <SelectItem value="geography">Địa lý</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-red-500 text-sm">
                      {errors.subject.message}
                    </p>
                  )}
                </div> */}
              </>
            )}

            <Button
              type="submit"
              className="w-full py-5 bg-green-600 hover:bg-green-700 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Đã có tài khoản?{" "}
            <Link href="/auth/login" className="underline text-green-800">
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
