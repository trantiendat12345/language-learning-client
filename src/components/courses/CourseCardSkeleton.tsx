import { Card, Skeleton } from '../ui'
import styles from './CourseCard.module.scss'

function CourseCardSkeleton() {
  return (
    <Card padding="none" className={styles.card}>
      <Skeleton height="100%" style={{ aspectRatio: '16 / 9', borderRadius: 0 }} />
      <div className={styles.body}>
        <Skeleton height={20} width="85%" />
        <div className={styles.badges}>
          <Skeleton height={22} width={56} style={{ borderRadius: 999 }} />
          <Skeleton height={22} width={40} style={{ borderRadius: 999 }} />
        </div>
        <Skeleton height={14} width={70} />
      </div>
    </Card>
  )
}

export default CourseCardSkeleton
