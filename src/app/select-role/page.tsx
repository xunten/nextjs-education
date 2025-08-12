"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();
  const { update } = useSession();
  const [loadingRole, setLoadingRole] = useState<"student" | "teacher" | null>(
    null
  );

  const handleSelectRole = async (role: "student" | "teacher") => {
    setLoadingRole(role);

    const res = await fetch("/api/auth/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      await update();
      router.push(`/dashboard/${role}`);
    } else {
      setLoadingRole(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
        <h2 className="text-2xl font-semibold mb-8 text-green-800">
          Bạn là ai ?
        </h2>
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => handleSelectRole("student")}
            className="px-6 py-3 bg-green-700 text-white rounded-md shadow-md hover:bg-green-800 transition flex items-center justify-center gap-2"
            disabled={loadingRole !== null}
          >
            {loadingRole === "student" ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Student"
            )}
          </button>
          <button
            onClick={() => handleSelectRole("teacher")}
            className="px-6 py-3 bg-green-700 text-white rounded-md shadow-md hover:bg-green-800 transition flex items-center justify-center gap-2"
            disabled={loadingRole !== null}
          >
            {loadingRole === "teacher" ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Teacher"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
