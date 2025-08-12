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
import { signIn, getSession } from "next-auth/react";

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
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const message =
          result.error === "CredentialsSignin"
            ? "Email hoặc mật khẩu không đúng"
            : result.error;
        alert(message);
        return;
      }

      // Đợi session được cập nhật
      await new Promise((r) => setTimeout(r, 500));
      const session = await getSession();

      const user = session?.user as
        | { role?: "student" | "teacher"; roles?: ("student" | "teacher")[] }
        | undefined;

      if (user?.role) {
        router.push(`/dashboard/${user.role}`);
        return;
      }

      if (user?.roles && user.roles.length === 1) {
        router.push(`/dashboard/${user.roles[0]}`);
        return;
      }

      router.push("/select-role");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Đã có lỗi xảy ra");
      }
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

            <Button type="submit" className="w-full">
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

          <button
            onClick={() => signIn("google", { callbackUrl: "/select-role" })}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full transition"
          >
            Đăng nhập với Google
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
