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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Eye, Search, X } from "lucide-react";
import Link from "next/link";
import {
  getStudentClasses,
  getClasses,
  createJoinRequest,
  getClassById,
  searchClasses,      
  getLatestClasses,
  searchClassesStudent, // Sử dụng hàm search backend
} from "@/services/classService";
import StudentNotificationToast from "@/components/classDetails/StudentNotificationToast";
import { toast } from "react-toastify";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function StudentClassesPage() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  // States cho tìm kiếm chính - sử dụng backend API
  const [searchKeyword, setSearchKeyword] = useState(""); // Input field value
  const [isSearching, setIsSearching] = useState(false); // Trạng thái đang tìm kiếm

  // States cho dialog tham gia lớp
  const [joinCode, setJoinCode] = useState("");
  const [activeTab, setActiveTab] = useState<"code" | "search">("code");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      console.log("parsedUser :", parsedUser);

      loadStudentClasses(parsedUser.userId, currentPage);
    }
  }, [currentPage, pageSize]);

  const loadStudentClasses = (userId: number, page: number) => {
    getStudentClasses(userId, page, pageSize)
      .then((res) => {
        setClasses(Array.isArray(res.data) ? res.data : res.data || []);
        setTotalPages(res.totalPages || 1);
        console.log("res", res);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy lớp học:", error);
        toast.error(
          error?.response?.data?.messages?.[0] ??
            "Không thể tải danh sách lớp học!"
        );
      });
  };

  // Hàm tìm kiếm bằng backend API
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      toast.error("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }

    try {
      setIsSearching(true);
      const res = await searchClassesStudent(user.userId, searchKeyword.trim());
      
      // Hiển thị tất cả kết quả từ backend, không phân trang
      setClasses(res.data || res);
      setCurrentPage(0);
      setTotalPages(0); // Không phân trang khi search
      
      console.log("Kết quả tìm kiếm:", res);
    } catch (err: any) {
      console.error("Lỗi khi tìm kiếm lớp:", err);
      toast.error(
        err?.response?.data?.messages?.[0] ?? "Không thể tìm kiếm lớp!"
      );
    }
  };

  // Clear search và load lại lớp của student
  const clearSearch = () => {
    setSearchKeyword("");
    setIsSearching(false);
    setCurrentPage(0);
    loadStudentClasses(user.userId, 0); // Load lại trang đầu
  };

  // Load lớp gợi ý khi mở tab tìm kiếm lần đầu
  useEffect(() => {
    if (activeTab === "search" && searchResults.length === 0 && !searchTerm) {
      getLatestClasses().then((data) => {
        setSearchResults(Array.isArray(data) ? data : data || []);
      });
    }
  }, [activeTab]);

  const handleJoinClass = async () => {
    if (!joinCode) {
      toast.warn("Vui lòng nhập mã lớp");
      return;
    }

    const classId = Number(joinCode);
    if (isNaN(classId)) {
      toast.error("Mã lớp không hợp lệ. Mã lớp phải là số!");
      return;
    }
    try {
      // Lấy thông tin chi tiết lớp học trước
      const classInfo = await getClassById(Number(joinCode));
      console.log("classInfo", classInfo);

      // Gửi yêu cầu tham gia lớp
      await createJoinRequest(Number(joinCode), user.userId);

      // Hiển thị thông báo tùy theo join_mode
      if (classInfo?.joinMode === "AUTO") {
        toast.success("Bạn đã tham gia lớp thành công!");
        // Refresh danh sách lớp
        if (isSearching) {
          clearSearch();
        } else {
          loadStudentClasses(user.userId, currentPage);
        }
      } else if (classInfo?.joinMode === "APPROVAL") {
        toast.info(
          "Yêu cầu tham gia lớp đã được gửi, vui lòng đợi giáo viên xác nhận."
        );
      } else {
        toast.info(
          "Yêu cầu tham gia lớp đã được gửi, vui lòng đợi giáo viên xác nhận."
        );
      }

      setJoinCode("");
    } catch (err: any) {
      console.error("Lỗi khi gửi yêu cầu tham gia lớp:", err);
      toast.error(
        err?.response?.data?.messages?.[0] ??
          "Không thể gửi yêu cầu tham gia lớp"
      );
    }
  };

  const handleJoinFromSearch = async (classId: number) => {
    try {
      const classInfo = await getClassById(Number(classId));
      await createJoinRequest(classId, user.userId);

      // Hiển thị thông báo tùy theo join_mode
      if (classInfo?.joinMode === "AUTO") {
        toast.success("Bạn đã tham gia lớp thành công!");
        // Refresh danh sách lớp
        if (isSearching) {
          clearSearch();
        } else {
          loadStudentClasses(user.userId, currentPage);
        }
      } else if (classInfo?.joinMode === "APPROVAL") {
        toast.info(
          "Yêu cầu tham gia lớp đã được gửi, vui lòng đợi giáo viên xác nhận."
        );
      } else {
        toast.info(
          "Yêu cầu tham gia lớp đã được gửi, vui lòng đợi giáo viên xác nhận."
        );
      }
    } catch (err: any) {
      console.error("Lỗi khi gửi yêu cầu tham gia lớp:", err);
      toast.error(
        err?.response?.data?.messages?.[0] ??
          "Không thể gửi yêu cầu tham gia lớp"
      );
    }
  };

  const handleSearchJoinDialog = async () => {
    setLoadingSearch(true);
    try {
      if (searchTerm.trim() === "") {
        // Nếu không nhập gì thì load lại 10 lớp gần nhất
        const latest = await getLatestClasses();
        setSearchResults(latest);
      } else {
        const results = await searchClasses(searchTerm);
        setSearchResults(results);
        console.log("lớp tìm kiếm: ", searchResults, "searchTerm: " ,searchTerm)
      }
    } catch (err: any) {
      console.error("Lỗi tìm kiếm lớp:", err);
      toast.error(
        err?.response?.data?.messages?.[0] ?? "Không thể tìm kiếm lớp!"
      );
    }
    setLoadingSearch(false);
  };

  // Handle page change - chỉ hoạt động khi không tìm kiếm
  const handlePageChange = (page: number) => {
    if (!isSearching) {
      setCurrentPage(page);
    }
  };

  if (!user) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto p-6 h-52 flex justify-center items-center">
          <DotLottieReact
            src="/animations/loading.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header + nút tham gia */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-700">
                Lớp học của tôi
              </h1>
              <p className="text-gray-600">
                Các lớp học bạn đã tham gia
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-700 hover:bg-green-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Tham gia lớp
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-green-700">
                      Tham gia lớp học
                    </DialogTitle>
                    <DialogDescription>Chọn cách tham gia</DialogDescription>
                  </DialogHeader>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={activeTab === "code" ? "default" : "outline"}
                      onClick={() => setActiveTab("code")}
                      className={
                        activeTab === "code"
                          ? "bg-green-700 hover:bg-green-800"
                          : "border-green-700 text-green-700 hover:bg-green-100"
                      }
                    >
                      Nhập mã lớp
                    </Button>
                    <Button
                      variant={activeTab === "search" ? "default" : "outline"}
                      onClick={() => setActiveTab("search")}
                      className={
                        activeTab === "search"
                          ? "bg-green-700 hover:bg-green-800"
                          : "border-green-700 text-green-700 hover:bg-green-100"
                      }
                    >
                      Tìm kiếm lớp
                    </Button>
                  </div>

                  {/* Tab nhập mã */}
                  {activeTab === "code" && (
                    <div className="space-y-4">
                      <Label htmlFor="joinCode">Mã lớp</Label>
                      <Input
                        id="joinCode"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        placeholder="Nhập mã lớp (VD: 123456)"
                      />
                      <Button
                        onClick={handleJoinClass}
                        className="w-full bg-green-700 hover:bg-green-800"
                      >
                        Tham gia
                      </Button>
                    </div>
                  )}

                  {/* Tab tìm kiếm */}
                  {activeTab === "search" && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Tìm theo tên lớp"
                        />
                        <Button
                          onClick={handleSearchJoinDialog}
                          disabled={loadingSearch}
                          className="bg-green-700 hover:bg-green-800"
                        >
                          {loadingSearch ? "Đang tìm..." : "Tìm"}
                        </Button>
                      </div>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {searchResults.length === 0 && <p>Không có lớp nào.</p>}
                        {searchResults.map((item) => (
                          <Card key={item.id} className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-bold text-green-700">
                                  {item.className}
                                </p>
                                <p className="text-sm text-gray-600">
                                  GV: {item.teacher?.fullName || "Chưa rõ"}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleJoinFromSearch(item.id)}
                                className="ml-4 shrink-0 bg-green-700 hover:bg-green-800"
                              >
                                Tham gia
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md flex gap-2">
              <Input
                placeholder="Tìm kiếm lớp học của tôi..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button
                onClick={handleSearch}
                className="bg-green-700 hover:bg-green-800"
                disabled={!searchKeyword.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {isSearching && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  Tìm thấy {classes.length} kết quả cho "{searchKeyword}"
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSearch}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Xóa tìm kiếm
                </Button>
              </div>
            )}
          </div>

          {/* Danh sách lớp */}
          {classes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <Card
                  key={classItem.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">
                      {classItem.className}
                    </CardTitle>
                    <CardDescription>
                      Giáo viên: {classItem.teacher?.fullName || "Chưa rõ"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Năm học:</span>
                        <span>{classItem.schoolYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Học kỳ:</span>
                        <span>{classItem.semester}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Môn học:</span>
                        <span>{classItem.subject?.name}</span>
                      </div>
                      <Link href={`/classes/${classItem.id}`}>
                        <Button
                          size="sm"
                          className="w-full mt-2 bg-green-700 hover:bg-green-800"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Vào lớp học
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">
                {isSearching && searchKeyword.trim() 
                  ? `Không tìm thấy lớp học nào với từ khóa "${searchKeyword}"` 
                  : "Chưa tham gia lớp học nào"
                }
              </div>
              <div className="text-sm text-gray-400">
                {isSearching && searchKeyword.trim() 
                  ? "Thử từ khóa khác hoặc tham gia lớp học mới"
                  : "Bắt đầu bằng cách tham gia lớp học đầu tiên"
                }
              </div>
              {isSearching && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={clearSearch}
                >
                  Xem tất cả lớp của tôi
                </Button>
              )}
            </div>
          )}

          {/* Pagination - chỉ hiển thị khi không tìm kiếm */}
          {!isSearching && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i).map((num) => (
                <Button
                  key={num}
                  variant={num === currentPage ? "default" : "outline"}
                  onClick={() => handlePageChange(num)}
                  className={
                    num === currentPage
                      ? "bg-green-700 hover:bg-green-800"
                      : "border-green-700 text-green-700 hover:bg-green-100"
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