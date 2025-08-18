

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { gradeSubmission } from '@/services/submissionService'
import { Submission } from '@/types/assignment'
import React, { useState } from 'react'

interface AssignmentScoreProps {
    submission: Submission
    onScoreUpdated?: (submissionId: number, score: number, teacherComment: string) => void
}

interface GradingData {
    grade: string
    teacherComment: string
}

export default function AssignmentScore({ submission, onScoreUpdated }: AssignmentScoreProps) {
    const [gradingData, setGradingData] = useState<GradingData>({
        grade: "",
        teacherComment: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const handleGradeSubmission = async (submissionId: number) => {
        if (!gradingData.grade || !gradingData.teacherComment.trim()) {
            alert("Vui lòng nhập đầy đủ điểm số và nhận xét")
            return
        }

        const score = Number.parseFloat(gradingData.grade)
        if (score < 0 || score > 10) {
            alert("Điểm số phải từ 0 đến 10")
            return
        }

        setIsLoading(true)

        try {
            await gradeSubmission(submissionId, {
                score: score,
                comment: gradingData.teacherComment,
            })

            if (onScoreUpdated) {
                onScoreUpdated(submissionId, score, gradingData.teacherComment)
            }

            setGradingData({ grade: "", teacherComment: "" })
            setIsOpen(false)
            alert("Chấm điểm thành công!")
        } catch (error) {
            console.error("Lỗi khi chấm điểm:", error)
            alert("Có lỗi xảy ra khi chấm điểm. Vui lòng thử lại.")
        } finally {
            setIsLoading(false)
        }
    }

    const isValidGrade =
        gradingData.grade &&
        !isNaN(Number.parseFloat(gradingData.grade)) &&
        Number.parseFloat(gradingData.grade) >= 0 &&
        Number.parseFloat(gradingData.grade) <= 10
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Chấm điểm</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chấm điểm bài làm</DialogTitle>
                    <DialogDescription>
                        Xtien -
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {/* <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Nộp lúc:</span>
                            <span>{submission.submittedAt}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Trạng thái:</span>
                            <span className="capitalize">{submission.status}</span>
                        </div>
                    </div> */}
                    <div className="space-y-2">
                        <Label htmlFor="grade">Điểm số (0-10)</Label>
                        <Input
                            id="grade"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={gradingData.grade}
                            onChange={(e) =>
                                setGradingData({
                                    ...gradingData,
                                    grade: e.target.value,
                                })
                            }
                            placeholder="Nhập điểm từ 0 đến 10"
                            disabled={isLoading}
                        />
                        {gradingData.grade && !isValidGrade && <p className="text-red-500 text-sm">Điểm số phải từ 0 đến 10</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="teacherComment">Nhận xét</Label>
                        <Textarea
                            id="teacherComment"
                            value={gradingData.teacherComment}
                            onChange={(e) =>
                                setGradingData({
                                    ...gradingData,
                                    teacherComment: e.target.value,
                                })
                            }
                            placeholder="Nhập nhận xét cho học sinh..."
                            rows={4}
                        />
                        <p className="text-xs text-gray-500 text-right">{gradingData.teacherComment.length}/500 ký tự</p>
                    </div>
                    <Button
                        onClick={() => handleGradeSubmission(submission.id)}
                        className="w-full"
                        disabled={!isValidGrade || !gradingData.teacherComment.trim() || isLoading}
                    >
                        {isLoading ? "Đang lưu..." : "Lưu điểm"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}