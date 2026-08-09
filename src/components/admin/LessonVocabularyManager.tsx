import { useState } from 'react'
import { ImageIcon, Search, X } from 'lucide-react'
import vocabularyService from '../../services/vocabularyService'
import lessonService from '../../services/lessonService'
import { getApiErrorMessage } from '../../api/apiError'
import { Button, Card, Input } from '../ui'
import type { LessonVocabularyResponse } from '../../types/lesson'
import type { VocabularySummaryResponse } from '../../types/vocabulary'
import styles from './LessonVocabularyManager.module.scss'

export interface LessonVocabularyManagerProps {
  lessonId: number
  vocabularies: LessonVocabularyResponse[]
  onChange: (vocabularies: LessonVocabularyResponse[]) => void
}

function LessonVocabularyManager({ lessonId, vocabularies, onChange }: LessonVocabularyManagerProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<VocabularySummaryResponse[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [attachingId, setAttachingId] = useState<number | null>(null)
  const [detachingId, setDetachingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const attachedIds = new Set(vocabularies.map((v) => v.vocabularyId))

  async function handleSearch() {
    setIsSearching(true)
    setSearchError(null)
    try {
      const data = await vocabularyService.searchVocabularies({ keyword: keyword || undefined, size: 8 })
      setResults(data.content)
    } catch (error) {
      setSearchError(getApiErrorMessage(error))
    } finally {
      setIsSearching(false)
    }
  }

  async function handleAttach(vocabularyId: number) {
    setAttachingId(vocabularyId)
    setActionError(null)
    try {
      const nextOrder = vocabularies.length > 0 ? Math.max(...vocabularies.map((v) => v.displayOrder)) + 1 : 0
      await lessonService.attachVocabulary(lessonId, { vocabularyId, displayOrder: nextOrder })
      const attached = results.find((r) => r.id === vocabularyId)
      if (attached) {
        onChange([
          ...vocabularies,
          {
            vocabularyId: attached.id,
            word: attached.word,
            meaning: attached.meaning,
            ipa: attached.ipa,
            imageUrl: attached.imageUrl,
            wordType: attached.wordType,
            displayOrder: nextOrder,
          },
        ])
      }
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setAttachingId(null)
    }
  }

  async function handleDetach(vocabularyId: number) {
    setDetachingId(vocabularyId)
    setActionError(null)
    try {
      await lessonService.detachVocabulary(lessonId, vocabularyId)
      onChange(vocabularies.filter((v) => v.vocabularyId !== vocabularyId))
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setDetachingId(null)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        <h2 className="h5" style={{ margin: 0 }}>
          Từ vựng ({vocabularies.length})
        </h2>
        <Button size="sm" variant="outline" leftIcon={showSearch ? <X size={14} /> : <Search size={14} />} onClick={() => setShowSearch((v) => !v)}>
          {showSearch ? 'Đóng' : 'Gắn từ vựng'}
        </Button>
      </div>

      {actionError && <p className={styles.errorText}>{actionError}</p>}

      {showSearch && (
        <Card padding="md" className={styles.searchCard}>
          <div className={styles.searchRow}>
            <Input
              placeholder="Tìm từ vựng theo tên..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} isLoading={isSearching}>
              Tìm
            </Button>
          </div>
          {searchError && <p className={styles.errorText}>{searchError}</p>}
          {results.length > 0 && (
            <div className={styles.searchResults}>
              {results.map((result) => {
                const isAttached = attachedIds.has(result.id)
                return (
                  <div key={result.id} className={styles.searchResultRow}>
                    <span className={styles.resultWord}>{result.word}</span>
                    <span className={styles.resultMeaning}>{result.meaning}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isAttached}
                      isLoading={attachingId === result.id}
                      onClick={() => handleAttach(result.id)}
                    >
                      {isAttached ? 'Đã gắn' : 'Gắn'}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {vocabularies.length === 0 ? (
        <Card>
          <p className={styles.emptyText}>Bài học chưa gắn từ vựng nào.</p>
        </Card>
      ) : (
        <div className={styles.vocabList}>
          {vocabularies.map((vocab) => (
            <Card key={vocab.vocabularyId} padding="md" className={styles.vocabRow}>
              {vocab.imageUrl ? (
                <img src={vocab.imageUrl} alt="" className={styles.vocabImage} />
              ) : (
                <span className={styles.vocabImageFallback}>
                  <ImageIcon size={18} />
                </span>
              )}
              <div className={styles.vocabInfo}>
                <span className={styles.vocabWord}>
                  {vocab.word}
                  {vocab.ipa && <span className={styles.vocabIpa}> /{vocab.ipa}/</span>}
                </span>
                <span className={styles.vocabMeaning}>{vocab.meaning}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                isLoading={detachingId === vocab.vocabularyId}
                onClick={() => handleDetach(vocab.vocabularyId)}
              >
                Gỡ
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default LessonVocabularyManager
