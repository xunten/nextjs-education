"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";

type Option = { id?: number | null; optionLabel: string; optionText: string };
type Question = {
  id?: number | null;
  questionText: string;
  questionType: "ONE_CHOICE" | string;
  options: Option[];
  correctAnswer?: string;
  score?: number | null;
};

const initialData: { questions: Question[] } = {
  questions: [
    {
      id: null,
      questionText:
        "Cho $f(x)$ liên tục trên $[a;b]$. Giá trị $\\int_a^b f(x)\\,dx$ là:",
      questionType: "ONE_CHOICE",
      options: [
        { optionLabel: "A", optionText: "$F(b)-F(a)$" },
        { optionLabel: "B", optionText: "$\\dfrac{f(b)-f(a)}{b-a}$" },
        { optionLabel: "C", optionText: "$\\int_b^a f(x)\\,dx$" },
        { optionLabel: "D", optionText: "$F(a)+F(b)$" },
      ],
      score: null,
    },
    {
      id: null,
      questionText: "Tính $\\lim\\limits_{x\\to 0} \\dfrac{\\sin x}{x}$.",
      questionType: "ONE_CHOICE",
      options: [
        { optionLabel: "A", optionText: "$0$" },
        { optionLabel: "B", optionText: "$1$" },
        { optionLabel: "C", optionText: "$+\\infty$" },
        { optionLabel: "D", optionText: "$-\\infty$" },
      ],
      score: null,
    },
  ],
};

/** ========= TÁCH VÀ THAY THẾ CÔNG THỨC ========= */
type Segment =
  | { type: "text"; content: string }
  | { type: "math"; content: string; display: boolean; index: number };

const MATH_INLINE = /\$(.+?)\$/gs;
const MATH_BLOCK = /\$\$(.+?)\$\$/gs;

function splitLatexSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  let mathIndex = 0;

  const blocks: any[] = [];
  for (const m of input.matchAll(MATH_BLOCK)) {
    if (m.index == null) continue;
    blocks.push({
      start: m.index,
      end: m.index + m[0].length,
      latex: m[1].trim(),
      display: true,
    });
  }
  const inlines: any[] = [];
  for (const m of input.matchAll(MATH_INLINE)) {
    if (m.index == null) continue;
    inlines.push({
      start: m.index,
      end: m.index + m[0].length,
      latex: m[1].trim(),
      display: false,
    });
  }

  const all = [...blocks, ...inlines].sort((a, b) => a.start - b.start);

  const filtered: typeof all = [];
  for (const m of all) {
    const insideBlock = blocks.some(
      (b) => m !== b && m.start >= b.start && m.end <= b.end
    );
    if (!insideBlock) filtered.push(m);
  }

  for (const m of filtered) {
    if (cursor < m.start)
      segments.push({ type: "text", content: input.slice(cursor, m.start) });
    segments.push({
      type: "math",
      content: m.latex,
      display: m.display,
      index: mathIndex++,
    });
    cursor = m.end;
  }
  if (cursor < input.length)
    segments.push({ type: "text", content: input.slice(cursor) });
  return segments;
}

function replaceNthMath(
  input: string,
  nth: number,
  newLatex: string,
  display: boolean
): string {
  let count = -1;
  const replBlock = (match: string) => {
    count++;
    return count === nth ? `$$${newLatex}$$` : match;
  };
  const replInline = (match: string) => {
    count++;
    return count === nth ? `$${newLatex}$` : match;
  };
  count = -1;
  let out = input.replace(MATH_BLOCK, replBlock);
  out = out.replace(MATH_INLINE, replInline);
  return out;
}

/** ========= MODAL SỬA CÔNG THỨC ========= */
function MathliveModal({
  open,
  initialLatex,
  display,
  onCancel,
  onSave,
}: {
  open: boolean;
  initialLatex: string;
  display: boolean;
  onCancel: () => void;
  onSave: (latex: string) => void;
}) {
  const mfRef = useRef<any>(null);

  // Khởi tạo mathlive + layout
  useEffect(() => {
    if (!open) return;
    (async () => {
      await import("mathlive");
      const kbd: any = (window as any).mathVirtualKeyboard;
      if (kbd) {
        kbd.theme = "material";
      }
      const el = mfRef.current as any;
      if (el) {
        el.setOptions?.({
          virtualKeyboardMode: "onfocus",
          smartMode: true,
          smartFence: true,
        });
        el.value = initialLatex || "";
        setTimeout(() => {
          el.focus();
          el.executeCommand?.("showVirtualKeyboard");
        }, 100);
      }
    })();
  }, [open, initialLatex]);

  if (!open) return null;

  const renderPreview = () => {
    const latex =
      (mfRef.current as any)?.getValue?.("latex-expanded") ??
      initialLatex ??
      "";
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: display,
      });
    } catch {
      return `<span class="text-red-600">Không render được công thức</span>`;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Soạn thảo công thức</h3>
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded-lg border hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>

        {/* @ts-ignore */}
        <math-field
          ref={mfRef}
          virtual-keyboard-mode="onfocus"
          style={{
            width: "100%",
            minHeight: 64,
            fontSize: 24,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
          }}
          placeholder="Nhập/sửa công thức…"
        ></math-field>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              const latex =
                (mfRef.current as any)?.getValue?.("latex-expanded") ??
                (mfRef.current as any)?.value ??
                "";
              onSave(latex);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Chèn
          </button>
        </div>
      </div>
    </div>
  );
}

/** ========= RENDER TEXT + CLICK ĐỂ SỬA ========= */
function MathEditableText({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const segments = useMemo(() => splitLatexSegments(value), [value]);
  const [modal, setModal] = useState<{
    open: boolean;
    latex: string;
    index: number;
    display: boolean;
  }>({ open: false, latex: "", index: -1, display: false });

  const handleSave = (latex: string) => {
    const next = replaceNthMath(value, modal.index, latex, modal.display);
    onChange(next);
    setModal((m) => ({ ...m, open: false }));
  };

  return (
    <>
      <div className="prose max-w-none">
        {segments.map((seg, i) => {
          if (seg.type === "text") return <span key={i}>{seg.content}</span>;
          let html = "";
          try {
            html = katex.renderToString(seg.content, {
              throwOnError: false,
              displayMode: seg.display,
            });
          } catch {
            html = `<span class="text-red-600">[Công thức lỗi]</span>`;
          }
          return (
            <span
              key={i}
              className="cursor-pointer hover:bg-blue-50 rounded px-1"
              title="Bấm để sửa công thức"
              onClick={() =>
                setModal({
                  open: true,
                  latex: seg.content,
                  index: seg.index,
                  display: seg.display,
                })
              }
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
      </div>

      <MathliveModal
        open={modal.open}
        initialLatex={modal.latex}
        display={modal.display}
        onCancel={() => setModal((m) => ({ ...m, open: false }))}
        onSave={handleSave}
      />
    </>
  );
}

/** ========= DEMO ========= */
export default function QuizWithCustomKeyboardPage() {
  const [questions, setQuestions] = useState<Question[]>(initialData.questions);

  const updateQuestionText = (idx: number, text: string) => {
    setQuestions((qs) =>
      qs.map((q, i) => (i === idx ? { ...q, questionText: text } : q))
    );
  };
  const updateOptionText = (qIdx: number, oIdx: number, text: string) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === oIdx ? { ...opt, optionText: text } : opt
              ),
            }
          : q
      )
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {questions.map((q, qi) => (
        <div
          key={qi}
          className="p-4 rounded-xl shadow bg-white border space-y-3"
        >
          {/* Câu hỏi */}
          <MathEditableText
            value={q.questionText}
            onChange={(next) => updateQuestionText(qi, next)}
          />

          {/* Đáp án */}
          <ul className="space-y-2">
            {q.options.map((opt, oi) => (
              <li key={oi} className="flex items-start gap-2">
                <span className="mt-1 font-medium">{opt.optionLabel}.</span>
                <MathEditableText
                  value={opt.optionText}
                  onChange={(next) => updateOptionText(qi, oi, next)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
