import { useEffect, useState } from 'react'
import { Flame, Trophy, Clock, RotateCcw, AlertCircle } from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext'
import progressService from '../services/progressService'
import historyService from '../services/historyService'
import courseService from '../services/courseService'
import { getApiErrorMessage } from '../api/apiError'
import { Spinner } from '../components/ui'
import StatTile from '../components/dashboard/StatTile'
import TodayGoalCard from '../components/dashboard/TodayGoalCard'
import ContinueLearningCard from '../components/dashboard/ContinueLearningCard'
import WeeklyProgressChart from '../components/dashboard/WeeklyProgressChart'
import RecentActivityList from '../components/dashboard/RecentActivityList'
import RecommendedCourses from '../components/dashboard/RecommendedCourses'
import AchievementsPreview from '../components/dashboard/AchievementsPreview'
import LeaderboardPreview from '../components/dashboard/LeaderboardPreview'
import { weeklyProgressMock, achievementsMock, leaderboardMock } from '../mock/dashboardMock'
import type { ProgressDashboardResponse } from '../types/progress'
import type { ActivityHistoryResponse } from '../types/history'
import type { CourseSummaryResponse } from '../types/course'
import styles from './DashboardPage.module.scss'

function DashboardPage() {
  const { user } = useAuthContext()
  const [dashboard, setDashboard] = useState<ProgressDashboardResponse | null>(null)
  const [activities, setActivities] = useState<ActivityHistoryResponse[]>([])
  const [recommendedCourses, setRecommendedCourses] = useState<CourseSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true)
  const [isCoursesLoading, setIsCoursesLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadDashboard() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await progressService.getDashboard()
        if (!ignore) setDashboard(data)
      } catch (error) {
        if (!ignore) setErrorMessage(getApiErrorMessage(error))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    async function loadActivities() {
      setIsActivitiesLoading(true)
      try {
        const data = await historyService.getRecentHistory({ limit: 5 })
        if (!ignore) setActivities(data)
      } catch {
        // Không chặn cả trang nếu riêng phần lịch sử lỗi - các section khác vẫn hữu ích
      } finally {
        if (!ignore) setIsActivitiesLoading(false)
      }
    }

    async function loadRecommendedCourses() {
      setIsCoursesLoading(true)
      try {
        const data = await courseService.getCourses({ size: 3 })
        if (!ignore) setRecommendedCourses(data.content)
      } catch {
        // Không chặn cả trang nếu riêng phần gợi ý khoá học lỗi
      } finally {
        if (!ignore) setIsCoursesLoading(false)
      }
    }

    loadDashboard()
    loadActivities()
    loadRecommendedCourses()
    return () => {
      ignore = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (errorMessage || !dashboard) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertCircle size={18} />
          {errorMessage ?? 'Không tải được dữ liệu Dashboard'}
        </div>
      </div>
    )
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>Chào {user?.displayName ?? user?.username} 👋</h1>
        <p className={styles.subGreeting}>
          {dashboard.goalMet
            ? 'Bạn đã hoàn thành mục tiêu hôm nay - tiếp tục giữ phong độ nhé!'
            : 'Cùng bắt đầu buổi học hôm nay nào.'}
        </p>
      </div>

      <div className={styles.statsGrid}>
        <StatTile
          icon={<Flame size={22} />}
          iconBg="var(--dl-accent-50)"
          iconColor="var(--dl-accent-600)"
          value={String(dashboard.currentStreak)}
          label={`Streak (tối đa ${dashboard.longestStreak})`}
        />
        <StatTile
          icon={<Trophy size={22} />}
          iconBg="var(--dl-primary-50)"
          iconColor="var(--dl-primary-600)"
          value={dashboard.totalXp.toLocaleString('vi-VN')}
          label="Tổng XP"
        />
        <StatTile
          icon={<Clock size={22} />}
          iconBg="var(--dl-secondary-50)"
          iconColor="var(--dl-secondary-600)"
          value={`${dashboard.todayStudyMinutes} phút`}
          label="Học hôm nay"
        />
        <StatTile
          icon={<RotateCcw size={22} />}
          iconBg="var(--dl-info-50)"
          iconColor="var(--dl-info-600)"
          value={String(dashboard.wordsToReviewCount)}
          label="Từ cần ôn tập"
          to="/review"
        />
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          <TodayGoalCard
            dailyGoalType={dashboard.dailyGoalType}
            dailyGoalValue={dashboard.dailyGoalValue}
            todayStudyMinutes={dashboard.todayStudyMinutes}
            todayWordsLearned={dashboard.todayWordsLearned}
            goalMet={dashboard.goalMet}
          />
          <ContinueLearningCard continueLearning={dashboard.continueLearning} />
          <WeeklyProgressChart days={weeklyProgressMock} />
          <RecentActivityList activities={activities} isLoading={isActivitiesLoading} />
        </div>

        <div className={styles.sidebar}>
          <RecommendedCourses courses={recommendedCourses} isLoading={isCoursesLoading} />
          <AchievementsPreview achievements={achievementsMock} />
          <LeaderboardPreview entries={leaderboardMock} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
