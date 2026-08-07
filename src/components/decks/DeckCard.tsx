import { Link } from 'react-router-dom'
import { Globe, Layers, Lock } from 'lucide-react'
import { Badge, Card } from '../ui'
import type { DeckSummaryResponse } from '../../types/deck'
import styles from './DeckCard.module.scss'

export interface DeckCardProps {
  deck: DeckSummaryResponse
}

function DeckCard({ deck }: DeckCardProps) {
  return (
    <Link to={`/decks/${deck.id}`} className={styles.link}>
      <Card padding="none" hoverable className={styles.card}>
        <div className={styles.thumb}>
          {deck.coverImageUrl ? <img src={deck.coverImageUrl} alt="" /> : <Layers size={36} strokeWidth={1.5} />}
        </div>
        <div className={styles.body}>
          <h2 className={styles.title}>{deck.title}</h2>
          <div className={styles.badges}>
            <Badge variant="secondary" icon={<Globe size={11} />}>
              {deck.languageCode.toUpperCase()}
            </Badge>
            {deck.visibility === 'PRIVATE' && (
              <Badge variant="neutral" icon={<Lock size={11} />}>
                Riêng tư
              </Badge>
            )}
            {deck.status === 'ARCHIVED' && <Badge variant="neutral">Đã lưu trữ</Badge>}
          </div>
          <div className={styles.meta}>{deck.cardCount} thẻ</div>
        </div>
      </Card>
    </Link>
  )
}

export default DeckCard
