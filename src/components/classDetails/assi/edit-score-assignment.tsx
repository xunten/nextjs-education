import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'

type Props = {}

export default function EditScoreAssignment({ }: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    Chỉnh sửa điểm
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa điểm</DialogTitle>
                    <DialogDescription>
                        xtien - baitap1
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-grade">Điểm số (0-10)</Label>
                        <Input
                            id="edit-grade"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                        // defaultValue={submission.grade}
                        // onChange={(e) =>
                        //     setGradingData({
                        //         ...gradingData,
                        //         grade: e.target.value,
                        //     })
                        // }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-feedback">Nhận xét</Label>
                        <Textarea
                            id="edit-feedback"
                            // defaultValue={submission.feedback}
                            // onChange={(e) =>
                            //     setGradingData({
                            //         ...gradingData,
                            //         feedback: e.target.value,
                            //     })
                            // }
                            rows={4}
                        />
                    </div>
                    <Button
                        // onClick={() => handleGradeSubmission(submission.id)}
                        className="w-full"
                    >
                        Cập nhật điểm
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}