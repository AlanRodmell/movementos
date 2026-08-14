import { exerciseById } from '../data/exercises'
import { getDashboardStats } from '../domain/stats'
import type { AppState } from '../domain/types'

export function ProgressScreen({ state }: { state: AppState }) {
  const stats = getDashboardStats(state)
  const recent = state.history.slice(0, 12)
  const counts = new Map<string, number>()
  state.history.forEach(session => session.completedExerciseIds.forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1)))
  const favourites = [...counts.entries()].sort((a,b) => b[1] - a[1]).slice(0, 5)
  const maxDuration = Math.max(1, ...recent.map(session => session.durationSeconds))
  return <div className="screen progress-screen">
    <section className="page-intro"><span className="eyebrow">YOUR TRAINING</span><h1>Progress is the work repeated.</h1><p>A practical view of consistency, volume, and the movements you’re building.</p></section>
    <section className="stats-grid"><div className="stat-tile"><strong>{stats.sessions}</strong><span>sessions</span><small>all time</small></div><div className="stat-tile"><strong>{stats.completed}</strong><span>movements</span><small>completed</small></div><div className="stat-tile"><strong>{stats.streak}</strong><span>day streak</span><small>current</small></div></section>
    <section className="panel"><div className="section-heading"><h2>Recent volume</h2><span>12 sessions</span></div><div className="bar-chart">{recent.slice().reverse().map(session => <div className="bar-column" key={session.id}><div style={{ height: `${Math.max(8, session.durationSeconds / maxDuration * 100)}%` }} title={`${Math.round(session.durationSeconds/60)} minutes`}/><small>{new Date(session.date).getDate()}</small></div>)}</div></section>
    <section className="panel"><div className="section-heading"><h2>Most practised</h2></div>{favourites.length ? favourites.map(([id,count], index) => <div className="rank-row" key={id}><span>{index + 1}</span><strong>{exerciseById.get(id)?.name ?? id}</strong><small>{count} completions</small></div>) : <p className="empty">Complete your first workout to start building a movement profile.</p>}</section>
    <section className="panel"><div className="section-heading"><h2>Recent sessions</h2></div>{recent.slice(0,6).map(session => <div className="session-row" key={session.id}><span className={`session-dot ${session.intention}`}/><div><strong>{session.planName}</strong><small>{new Date(session.date).toLocaleDateString()} · {Math.round(session.durationSeconds/60)} min</small></div><b>{session.rating === 'good' ? '●' : session.rating === 'easy' ? '○' : session.rating === 'hard' ? '▲' : '◆'}</b></div>)}</section>
  </div>
}
