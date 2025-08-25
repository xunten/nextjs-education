
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Assignment, Submission } from '@/types/assignment'
import { Upload } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FieldValues } from "react-hook-form"
import { submitAssignment } from '@/services/submissionService'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

interface AssignmentsTabProps {
    assignment: Assignment;
    onSuccess?: (submission: Submission) => void;
}

interface SubmissionFormData {
    description: string | null
    file: File | null
}

const submissionSchema = yup.object().shape({

    description: yup
        .string()
        .nullable()
        .optional()
        .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),

    file: yup
        .mixed<File>()
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

export default function UploadSubmission({ assignment, onSuccess }: AssignmentsTabProps) {

    const [user, setUser] = useState<any>(null);
    // const [submissionList, setSubmissionList] = useState<Submission[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm<SubmissionFormData>({
        resolver: yupResolver(submissionSchema),
        defaultValues: {
            description: "",
            file: null,
        },
    })

    const watchedFile = watch("file")

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                if (parsedUser) {
                    setUser(parsedUser);
                }
                console.log("User data loaded:", parsedUser);
            } catch (e) {
                console.error("Lỗi parse user:", e);
            }
        }
    }, []);

    const onSubmit = async (data: FieldValues) => {
        const formData = data as SubmissionFormData;
        try {
            const formData = new FormData()
            formData.append("assignmentId", assignment.id.toString())
            formData.append("studentId", user.userId.toString())
            console.log("Submitting assignment data:", formData);
            if (data.file) {
                formData.append("file", data.file)
            }
            formData.append("description", data.description || "")

            const newSubmission = await submitAssignment(formData)
            // Gọi callback cho cha biết
            if (onSuccess) {
                onSuccess(newSubmission)
            }
            // setSubmissionList(prev => [newSubmission, ...prev]); // Cập nhật danh sách bài nộp
            reset() // Reset form về giá trị mặc định
            setIsDialogOpen(false) // Đóng dialog sau khi tạo thành công
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Nộp bài tập thành công!",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error("Có lỗi xảy ra khi tạo bài nộp:", error)
            toast.error("Có lỗi xảy ra khi tạo bài nộp.") // Thông báo lỗi
        }
    }


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Nộp bài
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nộp bài tập</DialogTitle>
                    <DialogDescription>{assignment.title}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">Tải tệp đính kèm lên</Label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                                onClick={() => document.getElementById("file")?.click()}
                            >
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">Kéo thả tệp hoặc click để chọn</p>
                                <p className="text-sm text-gray-600">Hỗ trợ PDF, Word, PowerPoint, PNG, JPG</p>
                                <p className="text-xs text-gray-500">Tối đa 10MB</p>
                                {watchedFile && <p className="text-xs text-gray-500 mt-2">{watchedFile.name}</p>}
                            </div>
                            <input
                                id="file"
                                type="file"
                                className="hidden"
                                {...register("file")}
                                onChange={(e) => {
                                    setValue("file", e.target.files?.[0] || null, { shouldValidate: true })
                                }}
                            />
                            {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Ghi chú (mô tả)</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Thêm ghi chú mô tả cho bài làm..."
                                rows={4}
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                        </div>
                        <Button type='submit' className="w-full">Nộp bài</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}