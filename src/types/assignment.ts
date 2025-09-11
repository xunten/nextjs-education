import { LoginResponseDto } from "./auth";

export interface Assignment {
  id: number;
  title: string;
  description: string;
  classId: number;
  dueDate: string;
  maxScore: number;
  filePath?: string | null;
  fileType?: string | null;
  fileSize?: number | null;

  submissions?: Submission[];
}

// types/submission.ts

export type SubmissionStatus = "SUBMITTED" | "GRADED" | "LATE" | "MISSING";

export interface Submission {
  id: number;
  assignmentId: number;
  submittedAt: string;
  filePath: string;
  fileType: string;
  fileSize?: number | null;
  description?: string;
  status: SubmissionStatus;
  score?: number;
  gradedAt?: string;
  teacherComment?: string;

  student: {
    id: number;
    fullName: string;
    email: string;
    avatarBase64?: string | null;
  };

  assignment: {
    id: number;
    title: string;  
  };
}

export interface Comment {
  id: number;
  assignmentId: number;
  userId: number;
  userName: string;
  userRole: "student" | "teacher";
  content: string;
  createdAt: string;
  replies: Reply[];
}

export interface Reply {
  id: number;
  userId: number;
  userName: string;
  userRole: "student" | "teacher";
  content: string;
  createdAt: string;
  isNew?: boolean;
}

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}
