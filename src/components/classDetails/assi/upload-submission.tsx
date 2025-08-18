
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from 'lucide-react'
import React from 'react'

type Props = {}

export default function UploadSubmission({ }: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Nộp bài
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nộp bài tập</DialogTitle>
                    <DialogDescription>Bài tập 1</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tải lên tệp bài làm</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Chọn tệp để tải lên</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comment">Ghi chú (tùy chọn)</Label>
                        <Textarea id="comment" placeholder="Thêm ghi chú cho bài làm..." rows={3} />
                    </div>
                    <Button className="w-full">Nộp bài</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}