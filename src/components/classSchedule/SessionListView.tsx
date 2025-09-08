"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, MapPin, UserCheck, XCircle, PlusCircle } from "lucide-react";
import Link from "next/link";
import { formatDateShort, getDayOfWeek, dayOfWeekMapping } from "@/untils/datetime";
import { sessionApi, SessionCreateDTO } from "@/services/sessionApi";
import { getAllLocations } from "@/services/classScheduleService";

// Kiểu dữ liệu buổi học
interface SessionData {
  id: number;
  patternId: number;
  classId: number;
  sessionDate: string;
  startPeriod: number;
  endPeriod: number;
  location: string;
  status: "SCHEDULED" | "COMPLETED" | "PENDING" | "CANCELLED" | "HOLIDAY";
  note?: string;
}

interface LocationData {
  id: number;
  roomName: string;
}

export default function SessionListView({
  sessions,
  classId,
}: {
  sessions: SessionData[];
  classId: string;
}) {
  const [localSessions, setLocalSessions] = useState(sessions);
  const [showDialog, setShowDialog] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);

  const [form, setForm] = useState<SessionCreateDTO>({
    patternId: 0,
    classId: parseInt(classId),
    sessionDate: "",
    startPeriod: 1,
    endPeriod: 3,
    location: "",
    status: "SCHEDULED",
    note: "",
  });

  useEffect(() => {
    getAllLocations()
      .then((data) => setLocations(data))
      .catch((err) => console.error("Lỗi khi lấy danh sách địa điểm:", err));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Đã hoàn thành</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ điểm danh</Badge>;
      case "SCHEDULED":
        return <Badge className="bg-blue-100 text-blue-800">Đã lên lịch</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
      case "HOLIDAY":
        return <Badge className="bg-gray-200 text-gray-800">Nghỉ lễ</Badge>;
      default:
        return <Badge variant="secondary">Không rõ</Badge>;
    }
  };

  const isSameDay = (dateA: Date, dateB: Date) =>
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate();

  const today = new Date();

  // Huỷ buổi học + mở form buổi bù
  const handleCancel = async (sessionId: number) => {
    const cancelled = localSessions.find((s) => s.id === sessionId);
    if (!cancelled) return;

    await sessionApi.updateStatus(sessionId, { status: "CANCELLED" });
    setLocalSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "CANCELLED" } : s))
    );

    setForm({
      ...form,
      patternId: cancelled.patternId,
      classId: cancelled.classId,
      startPeriod: cancelled.startPeriod,
      endPeriod: cancelled.endPeriod,
      location: cancelled.location,
      note: "Buổi bù",
    });
    setShowDialog(true);
  };

  // Đánh dấu nghỉ lễ
  const handleHoliday = async (sessionId: number) => {
    await sessionApi.updateStatus(sessionId, { status: "HOLIDAY" });
    setLocalSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: "HOLIDAY" } : s)));
  };

  // Submit form tạo buổi mới/buổi bù
  const handleSubmit = async () => {

    const payload = { ...form, classId: parseInt(classId) };
    console.log("payload",payload)
    const { data } = await sessionApi.create(payload);
    setLocalSessions((prev) => [...prev, data]);
    setShowDialog(false);
    setForm({ ...form, sessionDate: "", location: "", note: "" });
  };

  const sortedSessions = [...localSessions].sort(
    (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
  );

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Calendar className="h-5 w-5" />
          Danh sách buổi học
        </CardTitle>
        <Button
          onClick={() => {
            setForm({ ...form, patternId: 0, sessionDate: "", note: "", location: "" });
            setShowDialog(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Thêm buổi học
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buổi</TableHead>
                <TableHead>Ngày học</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSessions.map((s, i) => {
                const sessionDate = new Date(s.sessionDate);
                const dow = getDayOfWeek(s.sessionDate);
                const isToday = isSameDay(sessionDate, today);

                return (
                  <TableRow key={s.id} className={isToday ? "bg-green-50" : ""}>
                    <TableCell>Buổi {i + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDateShort(sessionDate)}</span>
                        <span className="text-sm text-gray-500">{dayOfWeekMapping[dow]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Clock className="h-4 w-4 mr-1 inline" />
                      Tiết {s.startPeriod} - {s.endPeriod}
                    </TableCell>
                    <TableCell>
                      <MapPin className="h-4 w-4 mr-1 inline" />
                      {s.location}
                    </TableCell>
                    <TableCell>{getStatusBadge(s.status)}</TableCell>
                    <TableCell>{s.note || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {isToday && s.status !== "CANCELLED" && s.status !== "HOLIDAY" && (
                        <Link href={`/classes/${classId}/session/${s.id}/attendance`}>
                          <Button size="sm" className="bg-green-700 hover:bg-green-800">
                            <UserCheck className="h-4 w-4 mr-1" />
                            Điểm danh
                          </Button>
                        </Link>
                      )}

                      {s.status !== "CANCELLED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(s.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Hủy
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setForm({
                              ...form,
                              patternId: s.patternId,
                              classId: s.classId,
                              startPeriod: s.startPeriod,
                              endPeriod: s.endPeriod,
                              location: s.location,
                              note: "Buổi bù",
                            });
                            setShowDialog(true);
                          }}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Tạo buổi bù
                        </Button>
                      )}

                      {s.status !== "HOLIDAY" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleHoliday(s.id)}
                          className="text-gray-600 border-gray-400 hover:bg-gray-100"
                        >
                          Nghỉ lễ
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Dialog Form */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo buổi học</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="date"
              value={form.sessionDate}
              onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
            />

            <Select value={form.location} onValueChange={(val) => setForm({ ...form, location: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn địa điểm" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.roomName}>
                    {loc.roomName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Tiết bắt đầu"
              value={form.startPeriod}
              onChange={(e) => setForm({ ...form, startPeriod: +e.target.value })}
            />
            <Input
              type="number"
              placeholder="Tiết kết thúc"
              value={form.endPeriod}
              onChange={(e) => setForm({ ...form, endPeriod: +e.target.value })}
            />
            <Input
              placeholder="Ghi chú"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} className="bg-green-700 hover:bg-green-800">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
