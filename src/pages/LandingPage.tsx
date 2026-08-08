import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Globe,
  Layers,
  ListChecks,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import courseService from '../services/courseService'
import { useAuthContext } from '../contexts/AuthContext'
import { ButtonLink } from '../components/ui'
import CourseCard from '../components/courses/CourseCard'
import CourseCardSkeleton from '../components/courses/CourseCardSkeleton'
import type { CourseSummaryResponse } from '../types/course'
import styles from './LandingPage.module.scss'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Học từ vựng có hệ thống',
    text: 'Học theo từng bài với hình ảnh, phiên âm và ví dụ thực tế - không phải học vẹt.',
  },
  {
    icon: Layers,
    title: 'Flashcard & Deck cá nhân hoá',
    text: 'Tự tạo bộ thẻ từ vựng của riêng bạn, học theo 3 chế độ Xuôi/Ngược/Xáo trộn.',
  },
  {
    icon: RotateCcw,
    title: 'Ôn tập thông minh (SRS)',
    text: 'Thuật toán lặp lại ngắt quãng nhắc bạn ôn đúng từ, đúng lúc trước khi kịp quên.',
  },
  {
    icon: ListChecks,
    title: 'Quiz đa dạng',
    text: 'Trắc nghiệm và điền từ được tạo động từ mỗi bài học, không bao giờ trùng lặp.',
  },
  {
    icon: TrendingUp,
    title: 'Theo dõi tiến độ mỗi ngày',
    text: 'Streak, XP và mục tiêu hằng ngày giúp bạn duy trì thói quen học tập bền vững.',
  },
  {
    icon: Globe,
    title: 'Sẵn sàng đa ngôn ngữ',
    text: 'Kiến trúc mở rộng cho nhiều ngôn ngữ khác nhau, bắt đầu với tiếng Anh.',
  },
]

function LandingPage() {
  const { user } = useAuthContext()
  const [courses, setCourses] = useState<CourseSummaryResponse[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadCourses() {
      try {
        const data = await courseService.getCourses({ page: 0, size: 4 })
        if (!ignore) setCourses(data.content)
      } catch {
        // Trang chủ công khai - lỗi tải "khoá học nổi bật" chỉ cần ẩn section, không cần báo lỗi to.
      } finally {
        if (!ignore) setIsLoadingCourses(false)
      }
    }

    loadCourses()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <span className={`${styles.blob} ${styles.blob1}`} aria-hidden="true" />
        <span className={`${styles.blob} ${styles.blob2}`} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.heroBadge}>
            <Sparkles size={13} />
            Học ngoại ngữ thông minh hơn
          </span>
          <h1 className={styles.heroTitle}>Học tiếng Anh mỗi ngày, đạt mục tiêu của bạn</h1>
          <p className={styles.heroSubtitle}>
            Bài học, Flashcard, Quiz và ôn tập ngắt quãng (SRS) được thiết kế để giúp bạn tiến bộ mỗi ngày — theo đúng
            tốc độ của riêng bạn.
          </p>
          <div className={styles.heroActions}>
            {user ? (
              <ButtonLink to="/dashboard" size="lg" className={styles.heroPrimaryBtn} rightIcon={<ArrowRight size={18} />}>
                Vào Dashboard
              </ButtonLink>
            ) : (
              <ButtonLink to="/register" size="lg" className={styles.heroPrimaryBtn} rightIcon={<ArrowRight size={18} />}>
                Đăng ký miễn phí
              </ButtonLink>
            )}
            <ButtonLink to="/courses" size="lg" variant="outline" className={styles.heroSecondaryBtn}>
              Khám phá khoá học
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Mọi thứ bạn cần để học ngoại ngữ hiệu quả</h2>
          <p className={styles.sectionSubtitle}>Một nền tảng, đầy đủ công cụ - từ học từ vựng tới ôn tập lâu dài.</p>
        </div>
        <div className={styles.featureGrid}>
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className={styles.featureCard}>
              <span className={styles.featureIcon}>
                <Icon size={22} />
              </span>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureText}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Khoá học nổi bật (dữ liệu thật) ─────────────────────────── */}
      {(isLoadingCourses || courses.length > 0) && (
        <section className={`container ${styles.section}`}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.sectionTitle}>Khoá học nổi bật</h2>
              <p className={styles.sectionSubtitle}>Bắt đầu hành trình học tập của bạn ngay hôm nay.</p>
            </div>
            <ButtonLink to="/courses" variant="ghost" rightIcon={<ArrowRight size={16} />}>
              Xem tất cả
            </ButtonLink>
          </div>
          <div className={styles.courseGrid}>
            {isLoadingCourses
              ? Array.from({ length: 4 }).map((_, index) => <CourseCardSkeleton key={index} />)
              : courses.map((course) => <CourseCard course={course} key={course.id} />)}
          </div>
        </section>
      )}

      {/* ── CTA cuối trang ──────────────────────────────────────────── */}
      {!user && (
        <section className={styles.ctaSection}>
          <div className={`container ${styles.ctaInner}`}>
            <h2 className={styles.ctaTitle}>Sẵn sàng bắt đầu hành trình học tập?</h2>
            <p className={styles.ctaSubtitle}>Tạo tài khoản miễn phí và bắt đầu học ngay hôm nay.</p>
            <ButtonLink to="/register" size="lg" rightIcon={<ArrowRight size={18} />}>
              Đăng ký miễn phí
            </ButtonLink>
          </div>
        </section>
      )}
    </div>
  )
}

export default LandingPage
