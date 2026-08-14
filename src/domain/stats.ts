import type { AppState } from './types'

export function getDashboardStats(state: AppState) {
  const sessions = state.history
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)
  const thisWeek = sessions.filter(session => Date.parse(session.date) >= weekStart.getTime())
  const activeDays = new Set(thisWeek.map(session => new Date(session.date).toDateString())).size
  const minutes = Math.round(thisWeek.reduce((sum, session) => sum + session.durationSeconds, 0) / 60)
  const completed = sessions.reduce((sum, session) => sum + session.completedExerciseIds.length, 0)
  const dates = new Set(sessions.map(session => new Date(session.date).toDateString()))
  let streak = 0
  const cursor = new Date(); cursor.setHours(0, 0, 0, 0)
  if (!dates.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1)
  while (dates.has(cursor.toDateString())) { streak += 1; cursor.setDate(cursor.getDate() - 1) }
  return { sessions: sessions.length, activeDays, minutes, completed, streak }
}
