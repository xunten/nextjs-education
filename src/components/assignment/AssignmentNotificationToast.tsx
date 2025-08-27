"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useRouter } from "next/navigation";

// Interface cho notification Assignment
export interface NotificationAssignmentDTO {
  classId: number;
  title: string;
  description: string;
  dueDate: string; // backend trả về LocalDateTime → JSON string
}

export default function AssignmentNotificationToast({
  classId,

}: {
  classId: number;
}) {
  const [notifications, setNotifications] = useState<NotificationAssignmentDTO[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const router = useRouter();

  useEffect(() => {
    if (!classId) return; // ← Chỉ cần check classId

    console.log("Initializing WebSocket for classId:", classId);
    const sockjsUrl = `http://localhost:8080/ws`; // ← Bỏ studentId
    console.log("SockJS URL:", sockjsUrl);

    const stompClient = new Client({
      connectHeaders: {}, // ← Thêm dòng này
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame) => {
        console.log("✅ Student connected to WebSocket!", frame);
        setConnectionStatus("Connected");
        
        // Subscribe tới topic chung của lớp
        const subscription = stompClient.subscribe(
          `/topic/class/${classId}/assignments`,
          (message) => {
            console.log("📨 Raw message received:", message);
            try {
              const payload: NotificationAssignmentDTO = JSON.parse(message.body);
              console.log("📢 New assignment received:", payload);
              setNotifications((prev) => [payload, ...prev]);
              
              toast.info(
                <div
                  className="cursor-pointer hover:underline"
                  onClick={() => router.push(`/classes/${classId}`)}
                >
                  📘 Bài tập mới: {payload.title} <br />
                  📝 {payload.description} <br />
                  ⏰ Hạn: {new Date(payload.dueDate).toLocaleString()}
                </div>,
                {
                  position: "top-right",
                  autoClose: 6000,
                }
              );
            } catch (error) {
              console.error("❌ Error parsing message:", error);
            }
          }
        );
        console.log("📡 Subscribed to:", `/topic/class/${classId}/assignments`);
      },

      onStompError: (frame) => {
        console.error("Broker error: " + frame.headers["message"]);
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
      console.log("Cleaning up Student WebSocket...");
      stompClient.deactivate();
      setClient(null);
    };
  }, [classId, router]); // ← Bỏ studentId khỏi dependency

  return (
    <>
      <ToastContainer position="top-right" />
    </>
  );
}