"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, MapPin, UserCheck } from "lucide-react";
import { formatDateShort, getDayOfWeek, dayOfWeekMapping } from "@/untils/datetime";

interface SessionData {
  id: number;
  patternId: number;
  classId: number;
  sessionDate: string;
  startPeriod: number;
  endPeriod: number;
  location: string;
  status: "SCHEDULED" | "COMPLETED" | "PENDING" | "CANCELLED";
  note?: string;
}

export default function SessionListView({ sessions, classId }: { sessions: SessionData[]; classId: string }) {
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
      default:
        return <Badge variant="secondary">Không rõ</Badge>;
    }
  };

  const handleAttendance = (sessionId: number) => {
    console.log("Navigate to attendance:", sessionId);
    // window.location.href = `/teacher/classes/${classId}/sessions/${sessionId}/attendance`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Calendar className="h-5 w-5" />
          Danh sách buổi học
        </CardTitle>
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
              {sessions.map((s, i) => {
                const d = new Date(s.sessionDate);
                const dow = getDayOfWeek(s.sessionDate);
                const isToday = d.toDateString() === new Date().toDateString();

                return (
                  <TableRow key={s.id} className={isToday ? "bg-green-50" : ""}>
                    <TableCell>Buổi {i + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDateShort(d)}</span>
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
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAttendance(s.id)}
                        disabled={s.status === "SCHEDULED" || s.status === "CANCELLED"}
                        className="bg-green-700 hover:bg-green-800 disabled:opacity-50"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Điểm danh
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
