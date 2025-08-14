import * as yup from "yup";

export const schema = yup.object({
    title: yup.string().required("Vui lòng nhập tên đề thi"),
    grade: yup.string().required("Chọn khối lớp"),
    subject: yup.string().required("Chọn môn học"),
    startDate: yup.string().required(),
    endDate: yup.string().required(),
    time: yup.number().min(1, "Tối thiểu 1 phút").required(),
    description: yup.string(),
    files: yup
        .mixed()
        .test("required", "Vui lòng chọn ít nhất một file .docx", (value: File[]) => {
            return value && value.length > 0;
        }),
});
