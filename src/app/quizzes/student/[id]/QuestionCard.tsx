// components/QuestionCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Option {
  id?: number;
  optionLabel: string;
  optionText: string;
}

interface Question {
  id: number;
  questionText: string;
  score: number;
  options: Option[];
}

interface Props {
  index: number;
  data: Question;
  answer: string;
  onAnswer: (value: string) => void;
}

export default function QuestionCard({ index, data, answer, onAnswer }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Câu {index + 1}: {data.questionText} ({data.score} điểm)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={answer} onValueChange={onAnswer}>
          {data.options.map((option, i) => (
            <div key={option.id || i} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.optionLabel}
                id={`q${data.id}_${option.id || i}`}
              />
              <Label htmlFor={`q${data.id}_${option.id || i}`}>
                {option.optionLabel}. {option.optionText}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
