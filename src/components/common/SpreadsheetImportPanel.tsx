import { useRef, useState, type DragEvent } from 'react'
import { Download, FileSpreadsheet, FileText, Upload, X } from 'lucide-react'
import { Button, Card } from '../ui'
import { downloadBlob } from '../../utils/downloadFile'
import { getApiErrorMessage } from '../../api/apiError'
import type { ImportResult } from '../../types/import'
import styles from './SpreadsheetImportPanel.module.scss'

export interface SpreadsheetImportPanelProps {
  onImportCsv: (file: File) => Promise<ImportResult>
  onImportExcel: (file: File) => Promise<ImportResult>
  onDownloadCsvTemplate: () => Promise<Blob>
  onDownloadExcelTemplate: () => Promise<Blob>
  /** Gọi lại khi import thành công (success=true) - trang cha tự refetch danh sách, không cần F5. */
  onImportSuccess?: () => void
  /** Vô hiệu hoá thao tác Import (vd Admin chưa chọn Ngôn ngữ) - vẫn cho tải Template bình thường. */
  disabled?: boolean
  disabledHint?: string
}

type FileFormat = 'csv' | 'excel'

const TEMPLATE_FILENAMES: Record<FileFormat, string> = {
  csv: 'vocabulary-template.csv',
  excel: 'vocabulary-template.xlsx',
}

function SpreadsheetImportPanel({
  onImportCsv,
  onImportExcel,
  onDownloadCsvTemplate,
  onDownloadExcelTemplate,
  onImportSuccess,
  disabled,
  disabledHint,
}: SpreadsheetImportPanelProps) {
  const [showPanel, setShowPanel] = useState(false)
  const [format, setFormat] = useState<FileFormat>('csv')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function pickFormat(next: FileFormat) {
    setFormat(next)
    setSelectedFile(null)
    setResult(null)
    setUploadError(null)
  }

  function handleFileSelected(file: File | undefined | null) {
    if (!file) return
    setSelectedFile(file)
    setResult(null)
    setUploadError(null)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    handleFileSelected(e.dataTransfer.files[0])
  }

  async function handleImport() {
    if (!selectedFile) return
    setIsUploading(true)
    setUploadError(null)
    try {
      const importResult = format === 'csv' ? await onImportCsv(selectedFile) : await onImportExcel(selectedFile)
      setResult(importResult)
      if (importResult.success) {
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        onImportSuccess?.()
      }
    } catch (error) {
      setUploadError(getApiErrorMessage(error))
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDownloadTemplate(templateFormat: FileFormat) {
    const blob = templateFormat === 'csv' ? await onDownloadCsvTemplate() : await onDownloadExcelTemplate()
    downloadBlob(blob, TEMPLATE_FILENAMES[templateFormat])
  }

  return (
    <div className={styles.wrapper}>
      <Button
        variant="outline"
        leftIcon={showPanel ? <X size={16} /> : <Upload size={16} />}
        onClick={() => setShowPanel((v) => !v)}
      >
        {showPanel ? 'Đóng' : 'Import CSV/Excel'}
      </Button>

      {showPanel && (
        <Card padding="md" className={styles.panel}>
          {disabled && disabledHint && <p className={styles.hint}>{disabledHint}</p>}

          <div className={styles.formatTabs}>
            <button
              type="button"
              className={`${styles.formatTab} ${format === 'csv' ? styles.formatTabActive : ''}`}
              onClick={() => pickFormat('csv')}
            >
              <FileText size={14} /> Import CSV
            </button>
            <button
              type="button"
              className={`${styles.formatTab} ${format === 'excel' ? styles.formatTabActive : ''}`}
              onClick={() => pickFormat('excel')}
            >
              <FileSpreadsheet size={14} /> Import Excel
            </button>
          </div>

          <div
            className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${disabled ? styles.dropzoneDisabled : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              if (!disabled) setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={format === 'csv' ? '.csv' : '.xlsx'}
              className={styles.hiddenInput}
              disabled={disabled}
              onChange={(e) => handleFileSelected(e.target.files?.[0])}
            />
            {selectedFile ? (
              <span className={styles.selectedFileName}>{selectedFile.name}</span>
            ) : (
              <span className={styles.dropzoneHint}>
                Kéo thả file {format === 'csv' ? '.csv' : '.xlsx'} vào đây hoặc bấm để chọn file
              </span>
            )}
          </div>

          <div className={styles.actionsRow}>
            <Button size="sm" isLoading={isUploading} disabled={!selectedFile || disabled} onClick={handleImport}>
              Xác nhận Import
            </Button>
            <Button size="sm" variant="ghost" leftIcon={<Download size={14} />} onClick={() => handleDownloadTemplate('csv')}>
              Tải Template CSV
            </Button>
            <Button size="sm" variant="ghost" leftIcon={<Download size={14} />} onClick={() => handleDownloadTemplate('excel')}>
              Tải Template Excel
            </Button>
          </div>

          {uploadError && <p className={styles.errorText}>{uploadError}</p>}

          {result && (
            <div className={styles.resultBox}>
              <div className={styles.resultSummary}>
                <span>Tổng số dòng: {result.totalRows}</span>
                <span className={styles.resultImported}>Đã import: {result.importedCount}</span>
                <span className={styles.resultFailed}>Lỗi: {result.totalRows - result.importedCount}</span>
              </div>
              {result.errors.length > 0 && (
                <ul className={styles.errorList}>
                  {result.errors.map((err, index) => (
                    <li key={index}>
                      Row {err.row}
                      {err.column ? ` – ${err.column}` : ''}: {err.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default SpreadsheetImportPanel
