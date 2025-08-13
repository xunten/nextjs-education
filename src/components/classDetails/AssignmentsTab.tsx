// "use client"

// import { useState, useEffect } from "react"
// import { useParams, useRouter } from "next/navigation"
// import Link from "next/link"
// import Navigation from "@/components/navigation"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//   ArrowLeft,
//   Users,
//   FileText,
//   Upload,
//   Download,
//   Plus,
//   Clock,
//   CheckCircle,
//   MessageCircle,
//   BookOpen,
//   Settings,
//   Copy,
//   Send,
// } from "lucide-react"

// export const AssignmentsTab = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-semibold">Bài tập lớp học</h3>
//         {user.role === "teacher" && (
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Tạo bài tập mới
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>Tạo bài tập cho {classData.name}</DialogTitle>
//                 <DialogDescription>Nhập thông tin bài tập cho học sinh trong lớp này</DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">Tiêu đề bài tập</Label>
//                   <Input
//                     id="title"
//                     value={newAssignment.title}
//                     onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
//                     placeholder="VD: Bài tập Chương 1"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="description">Mô tả</Label>
//                   <Textarea
//                     id="description"
//                     value={newAssignment.description}
//                     onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
//                     placeholder="Mô tả chi tiết về bài tập..."
//                     rows={4}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="dueDate">Hạn nộp</Label>
//                   <Input
//                     id="dueDate"
//                     type="date"
//                     value={newAssignment.dueDate}
//                     onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Tệp đính kèm</Label>
//                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//                     <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
//                     <p className="text-sm text-gray-600">Kéo thả tệp hoặc click để chọn</p>
//                   </div>
//                 </div>
//                 <Button onClick={handleCreateAssignment} className="w-full">
//                   Tạo bài tập
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         )}
//       </div>

//       <div className="space-y-4">
//         {assignments.map((assignment) => (
//           <Card key={assignment.id}>
//             <CardHeader>
//               <div className="flex justify-between items-start">
//                 <div>
//                   <CardTitle className="text-lg">{assignment.title}</CardTitle>
//                   <CardDescription className="mt-1">Hạn nộp: {assignment.dueDate}</CardDescription>
//                 </div>
//                 <div className="flex gap-2">
//                   {getStatusBadge(assignment.status, assignment.dueDate)}
//                   <Badge variant="outline">
//                     {assignment.submissions}/{assignment.totalStudents} nộp bài
//                   </Badge>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <p className="text-gray-600 mb-4">{assignment.description}</p>
//               <div className="flex gap-2">
//                 {user.role === "teacher" ? (
//                   <>
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button size="sm" variant="outline">
//                           <FileText className="h-4 w-4 mr-1" />
//                           Xem bài nộp ({getSubmissionsByAssignment(assignment.id).length})
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//                         <DialogHeader>
//                           <DialogTitle>Bài nộp - {assignment.title}</DialogTitle>
//                           <DialogDescription>Danh sách bài nộp và chấm điểm</DialogDescription>
//                         </DialogHeader>

//                         <div className="space-y-4">
//                           {getSubmissionsByAssignment(assignment.id).length === 0 ? (
//                             <div className="text-center py-8 text-gray-500">
//                               <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                               <p>Chưa có bài nộp nào</p>
//                             </div>
//                           ) : (
//                             getSubmissionsByAssignment(assignment.id).map((submission) => (
//                               <Card key={submission.id} className="border">
//                                 <CardHeader className="pb-3">
//                                   <div className="flex justify-between items-start">
//                                     <div className="flex items-center space-x-3">
//                                       <Avatar className="h-10 w-10">
//                                         <AvatarFallback>{submission.studentName.charAt(0)}</AvatarFallback>
//                                       </Avatar>
//                                       <div>
//                                         <h4 className="font-medium">{submission.studentName}</h4>
//                                         <p className="text-sm text-gray-500">{submission.studentEmail}</p>
//                                       </div>
//                                     </div>
//                                     <div className="text-right">
//                                       {submission.status === "graded" ? (
//                                         <div>
//                                           <Badge className="bg-green-500 mb-1">Đã chấm</Badge>
//                                           <p className={`text-lg font-bold ${getGradeColor(submission.grade)}`}>
//                                             {submission.grade}/10
//                                           </p>
//                                         </div>
//                                       ) : (
//                                         <Badge variant="secondary">Chờ chấm</Badge>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </CardHeader>
//                                 <CardContent className="pt-0">
//                                   <div className="space-y-3">
//                                     <div className="flex items-center justify-between text-sm">
//                                       <span className="text-gray-600">Tệp đính kèm:</span>
//                                       <div className="flex items-center space-x-2">
//                                         <FileText className="h-4 w-4" />
//                                         <span>{submission.fileName}</span>
//                                         <span className="text-gray-500">({submission.fileSize})</span>
//                                       </div>
//                                     </div>
//                                     <div className="flex items-center justify-between text-sm">
//                                       <span className="text-gray-600">Nộp lúc:</span>
//                                       <span>{submission.submittedAt}</span>
//                                     </div>

//                                     {submission.status === "graded" && (
//                                       <div className="bg-gray-50 p-3 rounded-lg">
//                                         <p className="text-sm font-medium mb-1">Nhận xét:</p>
//                                         <p className="text-sm text-gray-700">{submission.feedback}</p>
//                                         <p className="text-xs text-gray-500 mt-2">
//                                           Chấm bởi {submission.gradedBy} lúc {submission.gradedAt}
//                                         </p>
//                                       </div>
//                                     )}

//                                     <div className="flex gap-2 pt-2">
//                                       <Button size="sm" variant="outline">
//                                         <Download className="h-3 w-3 mr-1" />
//                                         Tải về
//                                       </Button>

//                                       {submission.status === "submitted" ? (
//                                         <Dialog>
//                                           <DialogTrigger asChild>
//                                             <Button size="sm">Chấm điểm</Button>
//                                           </DialogTrigger>
//                                           <DialogContent>
//                                             <DialogHeader>
//                                               <DialogTitle>Chấm điểm bài làm</DialogTitle>
//                                               <DialogDescription>
//                                                 {submission.studentName} - {submission.fileName}
//                                               </DialogDescription>
//                                             </DialogHeader>
//                                             <div className="space-y-4">
//                                               <div className="space-y-2">
//                                                 <Label htmlFor="grade">Điểm số (0-10)</Label>
//                                                 <Input
//                                                   id="grade"
//                                                   type="number"
//                                                   min="0"
//                                                   max="10"
//                                                   step="0.1"
//                                                   value={gradingData.grade}
//                                                   onChange={(e) =>
//                                                     setGradingData({
//                                                       ...gradingData,
//                                                       grade: e.target.value,
//                                                     })
//                                                   }
//                                                   placeholder="Nhập điểm từ 0 đến 10"
//                                                 />
//                                               </div>
//                                               <div className="space-y-2">
//                                                 <Label htmlFor="feedback">Nhận xét</Label>
//                                                 <Textarea
//                                                   id="feedback"
//                                                   value={gradingData.feedback}
//                                                   onChange={(e) =>
//                                                     setGradingData({
//                                                       ...gradingData,
//                                                       feedback: e.target.value,
//                                                     })
//                                                   }
//                                                   placeholder="Nhập nhận xét cho học sinh..."
//                                                   rows={4}
//                                                 />
//                                               </div>
//                                               <Button
//                                                 onClick={() => handleGradeSubmission(submission.id)}
//                                                 className="w-full"
//                                                 disabled={
//                                                   !gradingData.grade ||
//                                                   Number.parseFloat(gradingData.grade) < 0 ||
//                                                   Number.parseFloat(gradingData.grade) > 10
//                                                 }
//                                               >
//                                                 Lưu điểm
//                                               </Button>
//                                             </div>
//                                           </DialogContent>
//                                         </Dialog>
//                                       ) : (
//                                         <Dialog>
//                                           <DialogTrigger asChild>
//                                             <Button size="sm" variant="outline">
//                                               Chỉnh sửa điểm
//                                             </Button>
//                                           </DialogTrigger>
//                                           <DialogContent>
//                                             <DialogHeader>
//                                               <DialogTitle>Chỉnh sửa điểm</DialogTitle>
//                                               <DialogDescription>
//                                                 {submission.studentName} - {submission.fileName}
//                                               </DialogDescription>
//                                             </DialogHeader>
//                                             <div className="space-y-4">
//                                               <div className="space-y-2">
//                                                 <Label htmlFor="edit-grade">Điểm số (0-10)</Label>
//                                                 <Input
//                                                   id="edit-grade"
//                                                   type="number"
//                                                   min="0"
//                                                   max="10"
//                                                   step="0.1"
//                                                   defaultValue={submission.grade}
//                                                   onChange={(e) =>
//                                                     setGradingData({
//                                                       ...gradingData,
//                                                       grade: e.target.value,
//                                                     })
//                                                   }
//                                                 />
//                                               </div>
//                                               <div className="space-y-2">
//                                                 <Label htmlFor="edit-feedback">Nhận xét</Label>
//                                                 <Textarea
//                                                   id="edit-feedback"
//                                                   defaultValue={submission.feedback}
//                                                   onChange={(e) =>
//                                                     setGradingData({
//                                                       ...gradingData,
//                                                       feedback: e.target.value,
//                                                     })
//                                                   }
//                                                   rows={4}
//                                                 />
//                                               </div>
//                                               <Button
//                                                 onClick={() => handleGradeSubmission(submission.id)}
//                                                 className="w-full"
//                                               >
//                                                 Cập nhật điểm
//                                               </Button>
//                                             </div>
//                                           </DialogContent>
//                                         </Dialog>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </CardContent>
//                               </Card>
//                             ))
//                           )}
//                         </div>
//                       </DialogContent>
//                     </Dialog>
//                     <Button size="sm" variant="outline">
//                       <MessageCircle className="h-4 w-4 mr-1" />
//                       Bình luận ({getCommentsForAssignment(assignment.id).length})
//                     </Button>
//                     <Button size="sm" variant="outline">
//                       <Settings className="h-4 w-4 mr-1" />
//                       Chỉnh sửa
//                     </Button>
//                   </>
//                 ) : (
//                   <>
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button size="sm">
//                           <Upload className="h-4 w-4 mr-1" />
//                           Nộp bài
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Nộp bài tập</DialogTitle>
//                           <DialogDescription>{assignment.title}</DialogDescription>
//                         </DialogHeader>
//                         <div className="space-y-4">
//                           <div className="space-y-2">
//                             <Label>Tải lên tệp bài làm</Label>
//                             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//                               <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
//                               <p className="text-sm text-gray-600">Chọn tệp để tải lên</p>
//                             </div>
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="comment">Ghi chú (tùy chọn)</Label>
//                             <Textarea id="comment" placeholder="Thêm ghi chú cho bài làm..." rows={3} />
//                           </div>
//                           <Button className="w-full">Nộp bài</Button>
//                         </div>
//                       </DialogContent>
//                     </Dialog>
//                     <Button size="sm" variant="outline">
//                       <MessageCircle className="h-4 w-4 mr-1" />
//                       Hỏi bài ({getCommentsForAssignment(assignment.id).length})
//                     </Button>
//                   </>
//                 )}
//               </div>

//               <CommentSection assignment={assignment} />
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )