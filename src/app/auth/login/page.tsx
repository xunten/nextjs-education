"use client";

import type React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  password: yup
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

type FormData = yup.InferType<typeof schema>;

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authService.login(data);

      // Lưu vào localStorage
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: res.userId,
          username: res.username,
          email: res.email,
          roles: res.roles,
        })
      );

      toast.success("Đăng nhập thành công");

      if (res.roles.length === 1) {
        const role = res.roles[0].toLowerCase();
        router.push(`/dashboard/${role}`);
      } else {
        router.push("/select-role");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Mật khẩu hoặc email không chính xác"
      );
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Nhập thông tin để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@example.com hoặc student@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
         
              <Button type="submit"
              className="w-full py-5 bg-green-600 hover:bg-green-700 cursor-pointer" >
                Đăng nhập
              </Button>
           
          </form>

          <div className="mt-4 text-center text-sm">
            Chưa có tài khoản?{" "}
            <Link href="/auth/register" className="underline">
              Đăng ký ngay
            </Link>
          </div>
          <div className="flex items-center gap-2 my-4">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="text-sm text-gray-500">hoặc</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          {/* <button
            onClick={() => signIn("google", { callbackUrl: "/select-role" })}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full transition"
          >
            Đăng nhập với Google
          </button> */}

          <GoogleLoginButton />
        </CardContent>
      </Card>
    </div>
  );
}
