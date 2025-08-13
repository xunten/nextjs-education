"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuizzStorage } from "../lib/store/useQuizzStorage";
import { Button } from "@/components/ui/button";

const mockExam = {
  fileName: "de-thi-sample.docx",
  questions: [
    {
      question: "Câu hỏi 1 là gì?",
      options: ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3"],
      correct: "A",
      answer: "B",
    },
    {
      question: "Câu hỏi 2 là gì?",
      options: ["A. A1", "B. B1", "C. C1"],
      correct: "C",
      answer: "C",
    },
  ],
};

export default function ExamPreview() {
  const searchParams = useSearchParams();
  const questions = useQuizzStorage((state) => state.data.questions);
  const data = useQuizzStorage((state) => state.data);

  const handleSubmit = async () => {
    try {
      const mappedQuestions = questions.map((q) => ({
        questionText: q.question,
        correctOption: q.answer ?? "",
        score: 1,
        options: q.options.map((opt) => ({
          optionLabel: opt.optionLabel,
          optionText: opt.optionText,
        })),
      }));

      const payload = {
        ...data,
        questions: mappedQuestions,
      };

      const response = await fetch("http://localhost:8080/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.log(payload);
        const errorText = await response.text();
        throw new Error(`Lỗi khi gửi quiz: ${errorText}`);
      } else {
        const result = await response.json();
        console.log("Tạo quiz thành công:", result);
        alert("Tạo quiz thành công!");
      }
    } catch (error) {
      console.error("Gửi quiz thất bại:", error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto min-h-screen bg-white">
        <Card className="rounded-xl shadow-sm border border-gray-100 overflow-auto max-h-[90vh] p-6">
          <div className="  px-6">
            <h3 className="text-lg font-medium mb-2">📋 Thông tin đề thi</h3>
            <p className="text-sm">• Tên file: {data.fileName}</p>
            <p className="text-sm">• Số câu hỏi: {questions.length}</p>
            <p className="text-sm">• Hình thức: Trắc nghiệm</p>
          </div>
          <Separator className="my-2" />

          {questions.map((q, idx) => (
            <div key={idx} className="mb-6">
              <p className="font-medium mb-2">{q.question}</p>
              <RadioGroup value={q.answer} disabled className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const optValue = opt.optionLabel;
                  const id = `q${idx}-opt-${optValue}`;

                  return (
                    <div key={id} className="flex items-center space-x-2">
                      <RadioGroupItem value={optValue} id={id} />
                      <label htmlFor={id} className="text-gray-900">
                        {opt.optionText}
                      </label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          ))}

          <p className="text-sm">• Tên file: {data.fileName}</p>
          <p className="text-sm">• Số câu hỏi: {questions.length}</p>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-medium mb-2">🔍 Danh sách đáp án</h3>
            <ScrollArea className="h-64">
              <ul className="list-disc ml-4 space-y-1">
                {questions.map((item, idx) => (
                  <li key={idx} className="text-sm">
                    Câu {idx + 1}:{" "}
                    <span className="text-green-600">{item.answer}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </Card>
          <div className=" items-center flex justify-center">
            <Button
              className="w-[80%] hover:bg-green-800"
              onClick={handleSubmit}
            >
              Tạo đề
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
