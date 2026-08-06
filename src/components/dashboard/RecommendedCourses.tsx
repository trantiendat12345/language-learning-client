import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Card, Spinner } from '../ui'
import type { CourseSummaryResponse } from '../../types/course'
import styles from './RecommendedCourses.module.scss'

export interface RecommendedCoursesProps {
  courses: CourseSummaryResponse[]
  isLoading: boolean
}

/** Chưa có thuật toán gợi ý ở Backend (Phase 2) - tạm hiển thị khoá học PUBLISHED mới nhất qua API thật GET /api/courses. */
function RecommendedCourses({ courses, isLoading }: RecommendedCoursesProps) {
  return (
    <Card padding="lg">
      <div className={styles.header}>
        <h2 className="h5" style={{ margin: 0 }}>
          Khoá học gợi ý
        </h2>
        <Link to="/courses" className={styles.seeAll}>
          Xem tất cả
        </Link>
      </div>

      {isLoading ? (
        <Spinner centered />
      ) : (
        <div className={styles.list}>
          {courses.map((course) => (
            <Link to={`/courses/${course.id}`} className={styles.item} key={course.id}>
              <span className={styles.thumb}>
                {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt="" /> : <BookOpen size={18} />}
              </span>
              <div className={styles.body}>
                <div className={styles.title}>{course.title}</div>
                <div className={styles.meta}>
                  {course.languageCode.toUpperCase()}
                  {course.difficulty && ` · ${course.difficulty}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}

export default RecommendedCourses
