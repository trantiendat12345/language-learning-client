import { ArrowRight, BookOpen, Compass } from 'lucide-react'
import { Card, ButtonLink } from '../ui'
import type { ContinueLearningResponse } from '../../types/progress'
import styles from './ContinueLearningCard.module.scss'

export interface ContinueLearningCardProps {
  continueLearning: ContinueLearningResponse | null
}

/** Chưa có Lesson Detail page (roadmap làm sau Course Detail) - CTA tạm điều hướng về Course Detail. */
function ContinueLearningCard({ continueLearning }: ContinueLearningCardProps) {
  if (!continueLearning) {
    return (
      <Card padding="lg" className={styles.empty}>
        <span className={styles.emptyIcon}>
          <Compass size={26} />
        </span>
        <h2 className="h5">Bạn chưa bắt đầu khoá học nào</h2>
        <p className={styles.emptyText}>Khám phá thư viện khoá học và bắt đầu hành trình của bạn ngay hôm nay.</p>
        <ButtonLink to="/courses" rightIcon={<ArrowRight size={16} />}>
          Khám phá khoá học
        </ButtonLink>
      </Card>
    )
  }

  return (
    <Card padding="lg" className={styles.card}>
      <span className={styles.blob} aria-hidden="true" />
      <div className={styles.eyebrow}>
        <BookOpen size={14} />
        Tiếp tục học
      </div>
      <div className={styles.courseTitle}>{continueLearning.courseTitle}</div>
      <div className={styles.lessonTitle}>{continueLearning.lessonTitle}</div>
      <ButtonLink to={`/courses/${continueLearning.courseId}`} className={styles.button} rightIcon={<ArrowRight size={16} />}>
        Tiếp tục
      </ButtonLink>
    </Card>
  )
}

export default ContinueLearningCard
