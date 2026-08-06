import { Link } from 'react-router-dom'
import { BookOpen, Clock, Globe } from 'lucide-react'
import { Badge, Card } from '../ui'
import type { CourseSummaryResponse } from '../../types/course'
import styles from './CourseCard.module.scss'

export interface CourseCardProps {
  course: CourseSummaryResponse
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <Link to={`/courses/${course.id}`} className={styles.link}>
      <Card padding="none" hoverable className={styles.card}>
        <div className={styles.thumb}>
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt="" />
          ) : (
            <BookOpen size={40} strokeWidth={1.5} />
          )}
        </div>
        <div className={styles.body}>
          <h2 className={styles.title}>{course.title}</h2>
          <div className={styles.badges}>
            <Badge variant="secondary" icon={<Globe size={11} />}>
              {course.languageCode.toUpperCase()}
            </Badge>
            {course.difficulty && <Badge variant="primary">{course.difficulty}</Badge>}
          </div>
          {course.estimatedMinutes != null && (
            <div className={styles.meta}>
              <Clock size={13} />
              {course.estimatedMinutes} phút
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}

export default CourseCard
