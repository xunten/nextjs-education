"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { StudentsTab } from "@/components/classDetails/StudentsTab"
import { OverviewTab } from "@/components/classDetails/OverviewTab"
import { getClassById, getStudentInClasses } from "@/services/classService"
import { AssignmentsTab } from "@/components/classDetails/AssignmentsTab"
import { getAssignmentsByClassId } from "@/services/assignmentService"
import { getDocumentsByClassId } from "@/services/documentService"
import { DocumentsTab } from "@/components/classDetails/DocumentsTab"

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [classData, setClassData] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [redirectPath, setRedirectPath] = useState("/classes")

  // useEffect(() => {
  //   // Lấy user từ localStorage
  //   const userData = JSON.parse(localStorage.getItem("user") || "{}")
  //   setUser(userData)

  //   // Xác định đường dẫn quay lại theo vai trò
  //   if (userData?.role === "teacher") {
  //     setRedirectPath("/classes/teacher")
  //   } else if (userData?.role === "student") {
  //     setRedirectPath("/classes/student")
  //   }
  // }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classId = Number(params.id)
        console.log("Fetching class data for ID:", classId)

        getClassById(classId)
         .then((data) => {
           console.log("Classes data:", data);
           setClassData(data)
         })
         .catch((err) => console.error("Lỗi khi lấy lớp:", err)); 
         
         

         getStudentInClasses(classId)
         .then((data) => {
           console.log("Classes data:", data);
           setStudents(data)
         })
        //  .catch((err) => console.error("Lỗi khi lấy lớp:", err)); 
        // setClassData(classRes.data)
        // setStudents(studentsRes.data)

        getAssignmentsByClassId(classId)
         .then((data) => {
           console.log("Assignments data:", data);
           setAssignments(data)
         })
        // Dữ liệu mẫu
        // setAssignments([
        //   { id: 101, status: "active" },
        //   { id: 102, status: "closed" },
        //   { id: 103, status: "active" },
        // ])

        getDocumentsByClassId(classId)
         .then((data) => {
           console.log("Documents data:", data);
           setDocuments(data)
         })

        // setDocuments([
        //   { id: 1, title: "Tài liệu giải tích" },
        //   { id: 2, title: "Đề thi giữa kỳ" },
        // ])
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu lớp học:", error)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handleCopyClassCode = () => {
    if (classData?.code) {
      navigator.clipboard.writeText(classData.code)
      alert("Đã sao chép mã lớp: " + classData.code)
    }
  }

  // if (!user || !classData) return <div>Đang tải dữ liệu...</div>
  if (!classData) return <div>Đang tải dữ liệu...</div>
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={redirectPath}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{classData.className}</h1>
              <p className="text-gray-600">{classData.description}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="students">
              Học sinh ({Array.isArray(students) ? students.length : 0})
            </TabsTrigger>
            <TabsTrigger value="assignments">Bài tập</TabsTrigger>
            <TabsTrigger value="documents">Tài liệu</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverviewTab
              classData={classData}
              assignments={assignments}
              documents={documents}
              countstudents={students.length}
              onCopyClassCode={handleCopyClassCode}
            />
          </TabsContent>

          <TabsContent value="students">
            <StudentsTab students={students} user={user} />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentsTab assignments={assignments} classData={classData} />
            {/* <div className="text-gray-600">Chức năng bài tập sẽ được cập nhật sau...</div> */}
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab documents={documents} classData={classData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
