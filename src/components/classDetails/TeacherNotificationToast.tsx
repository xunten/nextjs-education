"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getJoinRequests } from "@/services/classService";

import { useRouter } from "next/navigation";
// Interface thông báo join request
export interface JoinRequestDTO {
  id: number;
  classId: number;
  studentId: number;
  className: string;
  studentName: string;
  status: string;
  // Thêm các trường khác nếu cần
}

export default function TeacherNotificationToast({
  teacherId,
}: {
  teacherId: number;
}) {
  const [notifications, setNotifications] = useState<JoinRequestDTO[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const router = useRouter();
  useEffect(() => {
    if (!teacherId) return;

    // 1. Lấy tất cả thông báo cũ khi component mount
    // getJoinRequests(teacherId)
    //   .then((data) => {
    //     setNotifications(data);
    //   })
    //   .catch((err) => {
    //     console.error("Lỗi lấy thông báo cũ:", err);
    //   });

    // 2. Kết nối websocket để nhận realtime thông báo mới
    console.log("Initializing WebSocket connection for teacherId:", teacherId);

    const sockjsUrl = `http://localhost:8080/ws?teacherId=${teacherId}`;
    console.log("SockJS URL:", sockjsUrl);

    const stompClient = new Client({
      connectHeaders: {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame) => {
        console.log("Connected to WebSocket!", frame);
        setConnectionStatus("Connected");

        stompClient.subscribe(
          `/user/${teacherId}/queue/join-requests`,
          (message) => {
            const payload: JoinRequestDTO = JSON.parse(message.body);
            setNotifications((prev) => [payload, ...prev]);
            // toast.info(
            //   `Yêu cầu mới: ${payload.studentId} muốn tham gia lớp ${payload.classId}`,
            //   {
            //     position: "top-right",
            //     autoClose: 5000,
            //   }
            // );
            toast.info(
              <div
                className="cursor-pointer hover:underline"
                onClick={() => router.push(`/classes/teacher`)}
              >
                📢 Yêu cầu mới: {payload.studentName} muốn tham gia lớp {payload.className}
              </div>,
              {
                position: "top-right",
                autoClose: 5000,
              }
            );
          }
        );
      },

      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
        setConnectionStatus("Error");
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("WebSocket Error");
      },

      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
        setConnectionStatus("Disconnected");
      },

      webSocketFactory: () => {
        console.log("Creating SockJS connection...");
        return new SockJS(sockjsUrl);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      console.log("Cleaning up WebSocket...");
      stompClient.deactivate();
      setClient(null);
    };
  }, [teacherId]);

  return (
    <>
      {/* <div className="relative">
        <button
          className="relative p-2 rounded-full hover:bg-gray-200"
          onClick={() => {
            alert(
              notifications.length > 0
                ? notifications
                    .map((n) => `${n.studentId} - ${n.classId}`)
                    .join("\n")
                : "Chưa có thông báo mới"
            );
          }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {notifications.length}
            </span>
          )}
        </button>
      </div> */}

      <ToastContainer position="top-center" />
    </>
  );
}
