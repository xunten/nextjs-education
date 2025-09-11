import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FilePenLine } from "lucide-react"
import { useForm, FieldValues } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useEffect, useState } from "react"
import { updateAssignment } from "@/services/assignmentService"
import { Assignment } from "@/types/assignment"
import { ClassItem } from "@/types/classes"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { getFileName } from "@/untils/file"

interface UpdateAssignmentProps {
    assignment: Assignment
    classData: ClassItem[];
    onSuccess?: (assignment: Assignment) => void
}

interface UpdateAssignmentFormData {
    title: string
    description?: string
    dueDate: string
    maxScore: number
    classId: number
    file: File | null
}

const schema = yup.object().shape({
    title: yup.string().required("Tiêu đề không được để trống"),
    description: yup.string().nullable().optional(),
    dueDate: yup.date().required("Hạn nộp không được để trống"),
    maxScore: yup.number().required("Điểm tối đa không được để trống").min(1, "Điểm phải lớn hơn 0"),
    classId: yup.number().required("Vui lòng chọn lớp"),
    file: yup
        .mixed<File>()
        .test("fileSize", "Tệp quá lớn (tối đa 10MB)", (value) =>
            value ? value.size <= 10 * 1024 * 1024 : true
        )
        .test("fileType", "Định dạng tệp không hợp lệ", (value) =>
            value
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
        ),
})

export default function UpdateAssignment({ assignment, classData, onSuccess }: UpdateAssignmentProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm<UpdateAssignmentFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: assignment.title,
            description: assignment.description || "",
            dueDate: convertUTCToLocalInput(assignment.dueDate),
            maxScore: assignment.maxScore,
            classId: assignment.classId,
            file: null,
        },
    })

    const watchedFile = watch("file")
    const watchedClassId = watch("classId")

    // Reset khi mở dialog với dữ liệu mới nhất
    useEffect(() => {
        if (assignment) {
            reset({
                title: assignment.title,
                description: assignment.description || "",
                dueDate: convertUTCToLocalInput(assignment.dueDate),
                maxScore: assignment.maxScore,
                classId: assignment.classId,
                file: null,
            })
        }
    }, [assignment, reset])

    const onSubmit = async (data: FieldValues) => {
        try {
            const formData = new FormData()
            formData.append("title", data.title)
            formData.append("description", data.description || "")
            formData.append("dueDate", format(data.dueDate, "yyyy-MM-dd'T'HH:mm:ss"))
            formData.append("maxScore", data.maxScore.toString())
            formData.append("classId", data.classId.toString())

            if (data.file) {
                formData.append("file", data.file)
            }

            const updated = await updateAssignment(assignment.id, formData)
            if (onSuccess) onSuccess(updated)

            reset()
            setIsDialogOpen(false)
            toast.success("Cập nhật bài tập thành công!")
        } catch (error) {
            console.error("Error updating assignment:", error)
            toast.error("Có lỗi xảy ra khi cập nhật bài tập.")
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="">
                    <FilePenLine className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa bài tập</DialogTitle>
                    <DialogDescription>Cập nhật thông tin cho bài tập {assignment.title}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Tiêu đề */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề bài tập</Label>
                        <Input id="title" {...register("title")} />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                    </div>
                    {/* Mô tả */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea id="description" {...register("description")} rows={4} />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>
                    {/* Hạn nộp */}
                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Hạn nộp</Label>
                        <Input id="dueDate" type="datetime-local" {...register("dueDate", { valueAsDate: true })} />
                        {errors.dueDate && <p className="text-red-500 text-sm">{errors.dueDate.message}</p>}
                    </div>
                    {/* Điểm tối đa */}
                    <div className="space-y-2">
                        <Label htmlFor="maxScore">Điểm tối đa</Label>
                        <Input id="maxScore" type="number" {...register("maxScore", { valueAsNumber: true })} />
                        {errors.maxScore && <p className="text-red-500 text-sm">{errors.maxScore.message}</p>}
                    </div>
                    {/* Chọn lớp */}
                    <div className="space-y-2">
                        <Label htmlFor="classId">Chọn lớp</Label>
                        <Select
                            onValueChange={(value) => setValue("classId", parseInt(value))}
                            value={watchedClassId ? watchedClassId.toString() : ""}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn lớp học" />
                            </SelectTrigger>
                            <SelectContent>
                                {classData.map((cls) => (
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
                        <Label htmlFor="file">Thay thế tệp đính kèm (tùy chọn)</Label>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center cursor-pointer hover:bg-gray-50"
                            onClick={() => document.getElementById("update-file")?.click()}
                        >
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Kéo thả tệp hoặc click để chọn</p>

                            {/* Nếu user chọn file mới */}
                            {watchedFile && <p className="text-xs text-gray-500 mt-2">{watchedFile.name}</p>}

                            {/* Nếu chưa chọn file mới thì hiển thị file cũ */}
                            {!watchedFile && assignment.filePath && (
                                <p className="text-xs text-gray-500 mt-2">
                                    File hiện tại: <span className="underline">{getFileName(assignment.filePath ?? "")}</span>
                                </p>
                            )}
                        </div>
                        <input
                            id="update-file"
                            type="file"
                            className="hidden"
                            onChange={(e) => setValue("file", e.target.files?.[0] || null)}
                        />
                        {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="w-full">
                        Lưu thay đổi
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function convertUTCToLocalInput(utcDateString?: string) {
    if (!utcDateString) return ""

    const date = new Date(utcDateString) // UTC từ backend
    const tzOffset = date.getTimezoneOffset() * 60000 // mili giây
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
    return localISOTime
}
