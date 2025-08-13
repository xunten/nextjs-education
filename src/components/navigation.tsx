"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Users,
  Calendar,
  Trophy,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { authService } from "@/services/authService";

export default function Navigation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (status === "loading") {
    return null; // Hoặc loading UI
  }

  if (!session?.user) {
    router.push("/auth/login");
    return null;
  }

  const user = session.user;

  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/auth/login" });
  };

  const teacherNavItems = [
    { href: "/dashboard/teacher", label: "Trang chủ", icon: Home },
    { href: "/classes/teacher", label: "Quản lý lớp", icon: Users },
    { href: "/quizzes/teacher", label: "Trắc nghiệm", icon: BookOpen },
    { href: "/grades/teacher", label: "Xếp hạng", icon: Trophy },
  ];

  const studentNavItems = [
    { href: "/dashboard/student", label: "Trang chủ", icon: Home },
    { href: "/classes/student", label: "Lớp học", icon: Users },
    { href: "/quizzes/student", label: "Trắc nghiệm", icon: BookOpen },
    { href: "/grades/student", label: "Kết quả", icon: GraduationCap },
    { href: "/schedule/student", label: "Thời khóa biểu", icon: Calendar },
  ];

  // Giả sử user.role đang nằm trong session.user.role, nếu không bạn phải lấy đúng key
  const navItems = user.role === "teacher" ? teacherNavItems : studentNavItems;

  return (
    <nav className="bg-white shadow-sm border-b whitespace-nowrap">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className=""
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                EduSystem
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-hover:text-green-600 bg-blue-50"
                      : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-green-600">
                      {user.role === "teacher" ? "Giáo viên" : "Học sinh"}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="md:hidden ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === item.href
                      ? "text-green-600 bg-green-100"
                      : "text-gray-700 hover:text-green-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
