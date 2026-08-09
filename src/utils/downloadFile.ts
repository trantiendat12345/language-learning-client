/** Tải 1 Blob (vd Template CSV/Excel tải từ Backend) về máy người dùng qua thẻ <a download> tạm. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
