import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import grammarService from '../../services/grammarService'
import { getApiErrorMessage } from '../../api/apiError'
import { Button, Card, Input } from '../ui'
import type { GrammarResponse } from '../../types/grammar'
import styles from './LessonGrammarManager.module.scss'

export interface LessonGrammarManagerProps {
  lessonId: number
  grammars: GrammarResponse[]
  onChange: (grammars: GrammarResponse[]) => void
}

interface GrammarFormValues {
  title: string
  pattern: string
  explanation: string
  difficulty: string
  displayOrder: string
  examples: { exampleText: string; translation: string; note: string }[]
}

const EMPTY_GRAMMAR_FORM: GrammarFormValues = {
  title: '',
  pattern: '',
  explanation: '',
  difficulty: '',
  displayOrder: '0',
  examples: [],
}

function toRequest(data: GrammarFormValues) {
  return {
    title: data.title,
    pattern: data.pattern || undefined,
    explanation: data.explanation || undefined,
    difficulty: data.difficulty || undefined,
    displayOrder: Number(data.displayOrder) || 0,
    examples: data.examples
      .filter((e) => e.exampleText.trim())
      .map((e) => ({
        exampleText: e.exampleText,
        translation: e.translation || undefined,
        note: e.note || undefined,
      })),
  }
}

function GrammarForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  error,
}: {
  defaultValues: GrammarFormValues
  onSubmit: (data: GrammarFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
  error: string | null
}) {
  const { register, handleSubmit, control } = useForm<GrammarFormValues>({ defaultValues })
  const { fields, append, remove } = useFieldArray({ control, name: 'examples' })

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formGrid}>
        <Input label="Tiêu đề điểm ngữ pháp" {...register('title', { required: true })} />
        <Input label="Mẫu câu (pattern)" {...register('pattern')} />
        <Input label="Độ khó" {...register('difficulty')} />
        <Input label="Thứ tự hiển thị" type="number" {...register('displayOrder')} />
      </div>
      <Input label="Giải thích" {...register('explanation')} />

      <div className={styles.examplesBlock}>
        <div className={styles.examplesHeader}>
          <span>Câu ví dụ</span>
          <Button type="button" size="sm" variant="outline" leftIcon={<Plus size={12} />} onClick={() => append({ exampleText: '', translation: '', note: '' })}>
            Thêm ví dụ
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.exampleRow}>
            <Input placeholder="Câu ví dụ" {...register(`examples.${index}.exampleText` as const, { required: true })} />
            <Input placeholder="Dịch nghĩa (tuỳ chọn)" {...register(`examples.${index}.translation` as const)} />
            <Input placeholder="Ghi chú (tuỳ chọn)" {...register(`examples.${index}.note` as const)} />
            <button type="button" className={styles.removeExampleBtn} onClick={() => remove(index)} aria-label="Xoá ví dụ">
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

function LessonGrammarManager({ lessonId, grammars, onChange }: LessonGrammarManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleCreate(data: GrammarFormValues) {
    setIsCreating(true)
    setCreateError(null)
    try {
      const created = await grammarService.createGrammar(lessonId, toRequest(data))
      onChange([...grammars, created])
      setShowCreateForm(false)
    } catch (error) {
      setCreateError(getApiErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  async function handleEdit(id: number, data: GrammarFormValues) {
    setIsSavingEdit(true)
    setEditError(null)
    try {
      const updated = await grammarService.updateGrammar(id, toRequest(data))
      onChange(grammars.map((g) => (g.id === id ? updated : g)))
      setEditingId(null)
    } catch (error) {
      setEditError(getApiErrorMessage(error))
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Xoá điểm ngữ pháp này? Toàn bộ câu ví dụ bên trong cũng sẽ bị xoá.')) return
    setDeletingId(id)
    setDeleteError(null)
    try {
      await grammarService.deleteGrammar(id)
      onChange(grammars.filter((g) => g.id !== id))
    } catch (error) {
      setDeleteError(getApiErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        <h2 className="h5" style={{ margin: 0 }}>
          Ngữ pháp ({grammars.length})
        </h2>
        <Button
          size="sm"
          variant="outline"
          leftIcon={showCreateForm ? <X size={14} /> : <Plus size={14} />}
          onClick={() => setShowCreateForm((v) => !v)}
        >
          {showCreateForm ? 'Đóng' : 'Thêm điểm ngữ pháp'}
        </Button>
      </div>

      {deleteError && <p className={styles.errorText}>{deleteError}</p>}

      {showCreateForm && (
        <Card padding="md" className={styles.formCard}>
          <GrammarForm
            defaultValues={EMPTY_GRAMMAR_FORM}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={isCreating}
            submitLabel="Tạo điểm ngữ pháp"
            error={createError}
          />
        </Card>
      )}

      {grammars.length === 0 ? (
        <Card>
          <p className={styles.emptyText}>Bài học chưa có điểm ngữ pháp nào.</p>
        </Card>
      ) : (
        <div className={styles.grammarList}>
          {grammars.map((grammar) => (
            <Card key={grammar.id} padding="md" className={styles.grammarItem}>
              {editingId === grammar.id ? (
                <GrammarForm
                  defaultValues={{
                    title: grammar.title,
                    pattern: grammar.pattern ?? '',
                    explanation: grammar.explanation ?? '',
                    difficulty: '',
                    displayOrder: String(grammar.displayOrder),
                    examples: grammar.examples.map((e) => ({
                      exampleText: e.exampleText,
                      translation: e.translation ?? '',
                      note: e.note ?? '',
                    })),
                  }}
                  onSubmit={(data) => handleEdit(grammar.id, data)}
                  onCancel={() => setEditingId(null)}
                  isSubmitting={isSavingEdit}
                  submitLabel="Lưu thay đổi"
                  error={editError}
                />
              ) : (
                <>
                  <div className={styles.grammarHeader}>
                    <span className={styles.grammarTitle}>{grammar.title}</span>
                    <div className={styles.grammarActions}>
                      <Button size="sm" variant="outline" leftIcon={<Pencil size={12} />} onClick={() => setEditingId(grammar.id)}>
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Trash2 size={12} />}
                        isLoading={deletingId === grammar.id}
                        onClick={() => handleDelete(grammar.id)}
                      >
                        Xoá
                      </Button>
                    </div>
                  </div>
                  {grammar.pattern && <div className={styles.grammarPattern}>{grammar.pattern}</div>}
                  {grammar.explanation && <p className={styles.grammarExplanation}>{grammar.explanation}</p>}
                  {grammar.examples.length > 0 && (
                    <ul className={styles.exampleList}>
                      {grammar.examples.map((example) => (
                        <li key={example.id}>
                          {example.exampleText}
                          {example.translation && <span className={styles.exampleTranslation}> — {example.translation}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default LessonGrammarManager
