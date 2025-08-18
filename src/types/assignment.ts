export interface Assignment {
  id: number
  title: string
  description: string
  classId: number
  dueDate: string
  max_score: number
  file_path?: string | null
  file_type?: string | null
}

// types/submission.ts

export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'LATE' | 'MISSING';

export interface Submission {
  id: number;
  assignment: {
    id: number;
    title: string;
    description?: string;
    dueDate: string; // ISO Date string
    maxScore: number;
    // Có thể thêm các field khác nếu API trả về
  };
  student: {
    id: number;
    fullName: string;
    email?: string;
    // Có thể thêm các field khác nếu API trả về
  };
  submittedAt: string; // ISO Date string
  filePath: string;
  fileType: string;
  status: SubmissionStatus;
  score?: number;
  gradedAt?: string; // ISO Date string
  teacherComment?: string;
}


export interface Comment {
  id: number
  assignmentId: number
  userId: number
  userName: string
  userRole: "student" | "teacher"
  content: string
  createdAt: string
  replies: Reply[]
}

export interface Reply {
  id: number
  userId: number
  userName: string
  userRole: "student" | "teacher"
  content: string
  createdAt: string
  isNew?: boolean
}

export interface Notification {
  id: number
  message: string
  isRead: boolean
  createdAt: string
}
