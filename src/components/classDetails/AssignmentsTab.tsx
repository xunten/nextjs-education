"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    FileText,
    Upload,
    Download,
    Plus,
    MessageCircle,
    Settings,
    CheckCircle,
    Clock,
} from "lucide-react"
import { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FieldValues } from "react-hook-form"
import { getAssignments, getAssignmentById, createAssignment, getAssignmentsByClassId } from "@/services/assignmentService";
import { ClassItem } from "@/types/classes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Assignment, Submission } from "@/types/assignment"
import { useParams } from "next/navigation"
import { getSubmissionsByAssignment } from "@/services/submissionService"
import { CommentSection } from "../assignment/comment-section"
import AssignmentScore from "./assi/assignment-score"
import EditScoreAssignment from "./assi/edit-score-assignment"
import UploadSubmission from "./assi/upload-submission"

// Định nghĩa interface cho dữ liệu form
interface CreateAssignmentFormData {
    title: string
    description: string | null
    dueDate: Date
    maxScore: number
    classId: number
    file: File | null
}

interface AssignmentsTabProps {
    assignments: Assignment[];
    classData: ClassItem[];
}

const assignmentSchema = yup.object().shape({
    title: yup
        .string()
        .required('Tiêu đề là bắt buộc')
        .max(255, 'Tiêu đề không được vượt quá 255 ký tự'),

    description: yup
        .string()
        .nullable()
        .optional()
        .max(2000, 'Mô tả không được vượt quá 2000 ký tự'),

    dueDate: yup
        .date()
        .required('Hạn nộp là bắt buộc')
        .min(new Date(), 'Hạn nộp phải lớn hơn hoặc bằng hôm nay'),

    maxScore: yup
        .number()
        .required("Điểm tối đa là bắt buộc")
        .min(0, "Điểm tối đa phải lớn hơn hoặc bằng 0")
        .typeError("Điểm tối đa phải là một số"),
    classId: yup.number().required("Lớp là bắt buộc").typeError("Vui lòng chọn một lớp"),

    file: yup
        .mixed<File>() // Chấp nhận File hoặc null
        .test("fileSize", "Tệp quá lớn (tối đa 10MB)", (value) => {
            return value ? value.size <= 10 * 1024 * 1024 : true
        })
        .test("fileType", "Định dạng tệp không hợp lệ", (value) => {
            return value
                ? [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "image/jpeg",
                    "image/png",
                ].includes(value.type)
                : true
        }),
});


export const AssignmentsTab = ({ assignments, classData }: AssignmentsTabProps) => {

    const params = useParams()

    const [user, setUser] = useState<any>(null);
    const [assignmentList, setAssignmentList] = useState<Assignment[]>(assignments || []);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false) // State để quản lý trạng thái của Dialog
    // const [submissionList, setSubmissionList] = useState<Submission[]>([]);
    const [submissionsByAssignment, setSubmissionsByAssignment] = useState<Record<number, Submission[]>>({})
    const [loadingSubmissions, setLoadingSubmissions] = useState<Record<number, boolean>>({})

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm<CreateAssignmentFormData>({
        resolver: yupResolver(assignmentSchema),
        defaultValues: {
            title: "",
            description: "",
            dueDate: new Date(),
            maxScore: 10, // Giá trị mặc định
            classId: undefined, // Giá trị mặc định cho select
            file: null,
        },
    })

    const watchedFile = watch("file")
    const watchedClassId = watch("classId")

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                if (parsedUser) {
                    setUser(parsedUser);
                }
            } catch (e) {
                console.error("Lỗi parse user:", e);
            }
        }
    }, []);

    useEffect(() => {
        if (classData) {
            setClasses(Array.isArray(classData) ? classData : [classData]);
        }
    }, [classData]);

    useEffect(() => {
        const fetchAllSubmissions = async () => {
            if (assignmentList.length === 0) return

            // Fetch submissions cho tất cả assignments song song
            const fetchPromises = assignmentList.map(async (assignment) => {
                try {
                    setLoadingSubmissions((prev) => ({ ...prev, [assignment.id]: true }))
                    
                    const submissionData = await getSubmissionsByAssignment(assignment.id)

                    setSubmissionsByAssignment((prev) => ({
                        ...prev,
                        [assignment.id]: submissionData,
                    }))
                } catch (error) {
                    console.error("Lỗi khi tải submissions cho assignment", assignment.id, ":", error)
                    setSubmissionsByAssignment((prev) => ({
                        ...prev,
                        [assignment.id]: [],
                    }))
                } finally {
                    setLoadingSubmissions((prev) => ({ ...prev, [assignment.id]: false }))
                }
            })

            await Promise.all(fetchPromises)
            console.log("Completed fetching all submissions")
        }

        fetchAllSubmissions()
    }, [assignmentList])

    const fetchSubmissionsForAssignment = async (assignmentId: number) => {
        if (submissionsByAssignment[assignmentId] || loadingSubmissions[assignmentId]) {
            return // Đã có data hoặc đang loading
        }

        setLoadingSubmissions((prev) => ({ ...prev, [assignmentId]: true }))

        try {
            const submissionData = await getSubmissionsByAssignment(assignmentId)
            console.log("Submissions data for assignment", assignmentId, ":", submissionData)

            setSubmissionsByAssignment((prev) => ({
                ...prev,
                [assignmentId]: submissionData,
            }))
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu submissions cho assignment", assignmentId, ":", error)
            setSubmissionsByAssignment((prev) => ({
                ...prev,
                [assignmentId]: [],
            }))
        } finally {
            setLoadingSubmissions((prev) => ({ ...prev, [assignmentId]: false }))
        }
    }


    const onSubmit = async (data: FieldValues) => {
        const formData = data as CreateAssignmentFormData;
        try {
            const formData = new FormData()
            formData.append("title", data.title)
            formData.append("description", data.description || "") // Đảm bảo gửi chuỗi rỗng nếu null
            formData.append("dueDate", data.dueDate.toISOString()) // Chuyển Date object thành ISO string
            formData.append("maxScore", data.maxScore.toString())
            formData.append("classId", data.classId.toString())

            if (data.file) {
                formData.append("file", data.file)
            }

            const newAssignment = await createAssignment(formData)
            setAssignmentList(prev => [newAssignment, ...prev]); // Cập nhật danh sách bài tập
            reset() // Reset form về giá trị mặc định
            setIsDialogOpen(false) // Đóng dialog sau khi tạo thành công
            alert("Tạo bài tập thành công!") // Thông báo thành công
        } catch (error) {
            console.error("Error creating assignment:", error)
            alert("Có lỗi xảy ra khi tạo bài tập.") // Thông báo lỗi
        }
    }

    if (!user) {
        // Đảm bảo không render khi chưa có user
        return <div>Loading...</div>;
    }
    const role = user?.role || "student";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bài tập lớp học</h3>
                {user.role === "teacher" && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo bài tập mới
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                {/* <DialogTitle>Tạo bài tập cho</DialogTitle> */}
                                <DialogTitle>Tạo bài tập cho {classes[0].className}</DialogTitle>
                                <DialogDescription>Nhập thông tin bài tập cho học sinh trong lớp này</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-4">
                                    {/* Tiêu đề */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Tiêu đề bài tập</Label>
                                        <Input id="title" {...register("title")} placeholder="VD: Bài tập Chương 1" />
                                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                                    </div>
                                    {/* Mô tả */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Mô tả</Label>
                                        <Textarea
                                            id="description"
                                            {...register("description")}
                                            placeholder="Mô tả chi tiết về bài tập..."
                                            rows={4}
                                        />
                                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                                    </div>
                                    {/* Hạn nộp */}
                                    <div className="space-y-2">
                                        <Label htmlFor="dueDate">Hạn nộp</Label>
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            {...register("dueDate", {
                                                valueAsDate: true, // Quan trọng: chuyển đổi giá trị input date thành Date object
                                            })}
                                        />
                                        {errors.dueDate && <p className="text-red-500 text-sm">{errors.dueDate.message}</p>}
                                    </div>
                                    {/* Điểm tối đa */}
                                    <div className="space-y-2">
                                        <Label htmlFor="maxScore">Điểm tối đa</Label>
                                        <Input
                                            id="maxScore"
                                            type="number"
                                            {...register("maxScore", {
                                                valueAsNumber: true, // Quan trọng: chuyển đổi giá trị input number thành number
                                            })}
                                            placeholder="VD: 100"
                                        />
                                        {errors.maxScore && <p className="text-red-500 text-sm">{errors.maxScore.message}</p>}
                                    </div>
                                    {/* Chọn lớp */}
                                    <div className="space-y-2">
                                        <Label htmlFor="classId">Chọn lớp</Label>
                                        <Select
                                            onValueChange={(value) => setValue("classId", parseInt(value))}
                                            value={watchedClassId ? watchedClassId.toString() : ""}
                                        >
                                            <SelectTrigger className={errors.classId ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Chọn lớp học" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((cls) => (
                                                    <SelectItem key={cls.id} value={cls.id.toString()}>
                                                        {cls.className}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.classId && <p className="text-red-500 text-sm">{errors.classId.message}</p>}

                                    </div>
                                    {/* File đính kèm */}
                                    <div className="space-y-2">
                                        <Label htmlFor="file">Tệp đính kèm</Label>
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                                            onClick={() => document.getElementById("file")?.click()}
                                        >
                                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600">Kéo thả tệp hoặc click để chọn</p>
                                            {watchedFile && <p className="text-xs text-gray-500 mt-2">{watchedFile.name}</p>}
                                        </div>
                                        <input
                                            id="file"
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                setValue("file", e.target.files?.[0] || null) // Lấy file đầu tiên hoặc null
                                            }}
                                        />
                                        {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}
                                    </div>
                                    {/* Submit */}
                                    <Button type="submit" className="w-full">
                                        Tạo bài tập
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="space-y-4">
                {assignmentList.length > 0 ? (
                    assignmentList.map((assignment) => (
                        <Card key={assignment.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                                        <CardDescription className="mt-1">Hạn nộp: {assignment.dueDate}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {getStatusBadge(assignment.status, assignment.dueDate)}
                                        <Badge variant="outline">
                                            {assignment.submissions}/{assignment.totalStudents} nộp bài
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <p className="text-gray-600 mb-4">{assignment.description}</p>
                                <div className="flex gap-2">
                                    {user.role === "teacher" ? (
                                        <>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline" onClick={() => fetchSubmissionsForAssignment(assignment.id)}>
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Xem bài nộp ({submissionsByAssignment[assignment.id]?.length || 0})
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Bài nộp - {assignment.title}</DialogTitle>
                                                        <DialogDescription>Danh sách bài nộp và chấm điểm</DialogDescription>
                                                    </DialogHeader>

                                                    <div className="space-y-4">
                                                        {loadingSubmissions[assignment.id] ? (
                                                            <div className="text-center py-8">
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                                                <p className="mt-2 text-gray-500">Đang tải bài nộp...</p>
                                                            </div>
                                                        ) :submissionsByAssignment[assignment.id]?.length === 0 || !submissionsByAssignment[assignment.id] ? (
                                                            <div className="text-center py-8 text-gray-500">
                                                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                                <p>Chưa có bài nộp nào</p>
                                                            </div>
                                                        ) : (
                                                            submissionsByAssignment[assignment.id].map((submission) => (
                                                                <Card key={submission.id} className="border">
                                                                    <CardHeader className="pb-3">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="flex items-center space-x-3">
                                                                                <Avatar className="h-10 w-10">
                                                                                    <AvatarFallback></AvatarFallback>
                                                                                </Avatar>
                                                                                <div>
                                                                                    <h4 className="font-medium">Student one</h4>
                                                                                    <p className="text-sm text-gray-500">studentone@lms.com</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                {submission.status?.toLowerCase() === "graded" ? (
                                                                                    <div>
                                                                                        <Badge className="bg-green-500 mb-1">Đã chấm</Badge>
                                                                                        <p className={`text-lg font-bold ${getGradeColor(submission.score ?? 0)}`}>
                                                                                            {submission.score}/10
                                                                                        </p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <Badge variant="secondary">Chờ chấm</Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </CardHeader>
                                                                    <CardContent className="pt-0">
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-center justify-between text-sm">
                                                                                <span className="text-gray-600">Tệp đính kèm:</span>
                                                                                <div className="flex items-center space-x-2">
                                                                                    <FileText className="h-4 w-4" />
                                                                                    <span>{submission.filePath}</span>
                                                                                    {/* <span className="text-gray-500">({submission.fileSize})</span> */}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center justify-between text-sm">
                                                                                <span className="text-gray-600">Nộp lúc:</span>
                                                                                <span>{submission.submittedAt}</span>
                                                                            </div>

                                                                            {submission.status === "GRADED" && (
                                                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                                                    <p className="text-sm font-medium mb-1">Nhận xét:</p>
                                                                                    <p className="text-sm text-gray-700">{submission.teacherComment}</p>
                                                                                    <p className="text-xs text-gray-500 mt-2">
                                                                                        Chấm bởi {submission.gradedBy} lúc {submission.gradedAt}
                                                                                    </p>
                                                                                </div>
                                                                            )}

                                                                            <div className="flex gap-2 pt-2">
                                                                                <Button size="sm" variant="outline">
                                                                                    <Download className="h-3 w-3 mr-1" />
                                                                                    Tải về
                                                                                </Button>

                                                                                {submission.status === "SUBMITTED" ? (
                                                                                    // Chấm bài
                                                                                    <AssignmentScore submission={submission}  />
                                                                                ) : (
                                                                                    // Chỉnh sửa bài chấm
                                                                                    <EditScoreAssignment />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button size="sm" variant="outline">
                                                <MessageCircle className="h-4 w-4 mr-1" />
                                                Bình luận
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Settings className="h-4 w-4 mr-1" />
                                                Chỉnh sửa
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            {/* Nộp bài */}
                                            <UploadSubmission />

                                            <Button size="sm" variant="outline">
                                                <MessageCircle className="h-4 w-4 mr-1" />
                                                Hỏi bài
                                                {/* ({getCommentsForAssignment(assignment.id).length}) */}
                                            </Button>
                                        </>
                                    )}
                                </div>
                                {/* <CommentSection assignment={assignment} /> */}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-500">Không có bài tập nào.</p>
                )}
            </div>
        </div>
    );
};

const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)

    if (status === "completed") {
        return (
            <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Hoàn thành
            </Badge>
        )
    }
    if (due < now) {
        return (
            <Badge variant="destructive">
                <Clock className="h-3 w-3 mr-1" />
                Quá hạn
            </Badge>
        )
    }
    return (
        <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            Đang mở
        </Badge>
    )
}

const getGradeColor = (grade: number) => {
    if (grade >= 9) return "text-green-600"
    if (grade >= 8) return "text-blue-600"
    if (grade >= 6.5) return "text-yellow-600"
    return "text-red-600"
}