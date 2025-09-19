export function handleViewFile(filePath: string, fileType: string, fileName?: string) {
  if (!filePath) return;

  const directViewTypes = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "text/plain",
    "text/html",
    "text/csv",
    "application/json",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "video/mp4",
    "video/webm",
    "video/ogg",
  ];

  if (directViewTypes.includes(fileType)) {
    window.open(filePath, "_blank");
  } else {
    // 👉 Thêm fileName vào URL (nếu có) để Google Docs Viewer nhận diện đúng
    const urlWithName = fileName
      ? `${filePath}?response-content-disposition=inline;filename=${encodeURIComponent(fileName)}`
      : filePath;

    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
      urlWithName
    )}&embedded=true`;

    window.open(viewerUrl, "_blank");
  }
}
