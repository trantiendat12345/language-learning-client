import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Input, Select } from '../ui'
import type { LanguageResponse } from '../../types/language'
import { QUESTION_TYPE_LABELS, SOURCE_TYPE_LABELS, type QuestionFormValues } from './questionFormShared'
import styles from './QuestionForm.module.scss'

export type { QuestionFormValues }

export interface QuestionFormProps {
  languages: LanguageResponse[]
  defaultValues: QuestionFormValues
  onSubmit: (data: QuestionFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
  error: string | null
  /** Khi set (dùng trong AdminLessonDetailPage) - ẩn 2 field Nguồn/ID nguồn, luôn cố định theo Lesson đang xem. */
  lockSource?: boolean
}

function QuestionForm({ languages, defaultValues, onSubmit, onCancel, isSubmitting, submitLabel, error, lockSource }: QuestionFormProps) {
  const { register, handleSubmit, control } = useForm<QuestionFormValues>({ defaultValues })
  const { fields, append, remove } = useFieldArray({ control, name: 'options' })

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formGrid}>
        {!lockSource && (
          <>
            <Select label="Nguồn" {...register('sourceType', { required: true })}>
              {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Input label="ID nguồn (vd Lesson ID)" type="number" {...register('sourceId', { required: true })} />
          </>
        )}
        <Select label="Ngôn ngữ" {...register('languageId', { required: true })}>
          <option value="">Chọn ngôn ngữ</option>
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
        <Select label="Loại câu hỏi" {...register('type', { required: true })}>
          {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input label="Độ khó" {...register('difficulty')} />
        <Input label="ID Từ vựng liên quan (tuỳ chọn)" type="number" {...register('vocabularyId')} />
      </div>

      <Input label="Nội dung câu hỏi" {...register('promptText')} />
      <Input label="URL audio câu hỏi" {...register('promptAudioUrl')} />
      <Input label="URL ảnh câu hỏi" {...register('promptImageUrl')} />
      <Input label="Giải thích đáp án" {...register('explanation')} />

      <div className={styles.optionsBlock}>
        <div className={styles.optionsHeader}>
          <span>Lựa chọn đáp án</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<Plus size={12} />}
            onClick={() => append({ optionText: '', optionImageUrl: '', correct: false })}
          >
            Thêm lựa chọn
          </Button>
        </div>
        <p className={styles.optionsHint}>Đánh dấu đúng 1 ô "Đáp án đúng" cho câu Trắc nghiệm/Điền vào chỗ trống/Gõ đáp án/Chọn theo hình/âm thanh.</p>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.optionRow}>
            <label className={styles.correctCheckbox}>
              <input type="checkbox" {...register(`options.${index}.correct` as const)} />
              Đáp án đúng
            </label>
            <Input placeholder="Nội dung lựa chọn" {...register(`options.${index}.optionText` as const)} />
            <Input placeholder="URL ảnh (tuỳ chọn)" {...register(`options.${index}.optionImageUrl` as const)} />
            <button type="button" className={styles.removeOptionBtn} onClick={() => remove(index)} aria-label="Xoá lựa chọn">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.formActions}>
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Huỷ
        </Button>
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </form>
  )
}

export default QuestionForm
