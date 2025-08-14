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


// export const DocumentsTab = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-semibold">Tài liệu lớp học</h3>
//         {user.role === "teacher" && (
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Tải lên tài liệu
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Tải lên tài liệu cho {classData.name}</DialogTitle>
//                 <DialogDescription>Chọn tệp tài liệu để chia sẻ với học sinh</DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="docName">Tên tài liệu</Label>
//                   <Input
//                     id="docName"
//                     value={newDocument.name}
//                     onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
//                     placeholder="VD: Chương 1 - Giới hạn"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Chọn tệp</Label>
//                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//                     <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
//                     <p className="text-sm text-gray-600">Hỗ trợ PDF, Word, PowerPoint</p>
//                     <p className="text-xs text-gray-500">Tối đa 50MB</p>
//                   </div>
//                 </div>
//                 <Button onClick={handleUploadDocument} className="w-full">
//                   Tải lên
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {documents.map((doc) => (
//           <Card key={doc.id} className="hover:shadow-lg transition-shadow">
//             <CardHeader className="pb-3">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center space-x-3">
//                   <span className="text-2xl">{getFileIcon(doc.type)}</span>
//                   <div>
//                     <CardTitle className="text-sm font-medium">{doc.name}</CardTitle>
//                     <CardDescription className="text-xs">{doc.size}</CardDescription>
//                   </div>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="pt-0">
//               <div className="flex justify-between text-xs text-gray-500 mb-3">
//                 <span>Tải lên: {doc.uploadDate}</span>
//                 <span>{doc.downloads} lượt tải</span>
//               </div>
//               <div className="flex gap-2">
//                 <Button size="sm" variant="outline" className="flex-1 bg-transparent">
//                   <Download className="h-3 w-3 mr-1" />
//                   Tải về
//                 </Button>
//                 {user.role === "teacher" && (
//                   <Button size="sm" variant="ghost">
//                     <Settings className="h-3 w-3" />
//                   </Button>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )