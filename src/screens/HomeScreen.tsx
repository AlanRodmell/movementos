import { catalogueStats } from '../data/exercises'
import { getDashboardStats } from '../domain/stats'
import type { AppState, MuscleArea } from '../domain/types'

const categories: Array<{ area: MuscleArea; label: string; icon: string; note: string }> = [
  { area: 'upper_body', label: 'Upper body', icon: '↑', note: 'Push + pull balance' },
  { area: 'lower_body', label: 'Lower body', icon: '↓', note: 'Squat, hinge + lunge' },
  { area: 'core', label: 'Core', icon: '◆', note: 'Brace, carry + rotate' },
  { area: 'full_body', label: 'Conditioning', icon: 'ϟ', note: 'Move + build capacity' },
  { area: 'hips', label: 'Mobility', icon: '〰', note: 'Restore range + control' },
]

export function HomeScreen({ state, onBuild, onSuggested, onCategory, onResume, onOpenPlan }: { state: AppState; onBuild: () => void; onSuggested: () => void; onCategory: (area: MuscleArea) => void; onResume: () => void; onOpenPlan: (index: number) => void }) {
  const stats = getDashboardStats(state)
  return <div className="screen home-screen">
    {state.activeSession && <section className="resume-card"><div><span className="eyebrow">SESSION IN PROGRESS</span><h2>{state.activeSession.plan.name}</h2><p>Movement {state.activeSession.index + 1} of {state.activeSession.plan.exercises.length}</p></div><button className="primary" onClick={onResume}>Resume <span>→</span></button></section>}
    <section className="hero-card">
      <span className="eyebrow">TODAY · READY TO MOVE</span>
      <h1>{state.profile.name ? `Good to see you, ${state.profile.name}.` : 'Train for the body you have today.'}</h1>
      <p>Adaptive sessions shaped by your goal, equipment, recent work, and anything you’re managing.</p>
      <div className="hero-actions"><button className="primary" onClick={onSuggested}>Start what’s best today <span>→</span></button><button className="secondary" onClick={onBuild}>Build my own</button></div>
    </section>

    <section className="stats-grid" aria-label="Training statistics">
      <div className="stat-tile"><strong>{stats.activeDays}</strong><span>active days</span><small>last 7 days</small></div>
      <div className="stat-tile"><strong>{stats.minutes}</strong><span>minutes</span><small>this week</small></div>
      <div className="stat-tile"><strong>{stats.streak}</strong><span>day streak</span><small>{stats.sessions} total sessions</small></div>
    </section>

    <div className="section-heading"><div><span className="eyebrow">QUICK START</span><h2>Choose a direction</h2></div><span className="catalogue-count">{catalogueStats.total} movements</span></div>
    <section className="category-grid">
      {categories.map(category => <button className="category-card" key={category.label} onClick={() => onCategory(category.area)}>
        <span className="category-icon">{category.icon}</span><span><strong>{category.label}</strong><small>{category.note}</small></span><b>→</b>
      </button>)}
    </section>

    {state.savedPlans.length > 0 && <><div className="section-heading"><div><span className="eyebrow">YOUR LIBRARY</span><h2>Saved sessions</h2></div><span>{state.savedPlans.length}</span></div><section className="saved-plan-list">{state.savedPlans.slice(0,3).map((plan,index) => <button key={plan.id} className="saved-plan-card" onClick={() => onOpenPlan(index)}><span><strong>{plan.name}</strong><small>{plan.exercises.length} movements · {plan.durationMinutes} min</small></span><b>→</b></button>)}</section></>}

    <section className="insight-card"><span className="insight-icon">✦</span><div><strong>How today’s suggestion works</strong><p>Movement OS balances movement patterns, recent muscle load, equipment, level, goals, variety, and active issues. Complete and rate sessions to improve the next recommendation.</p></div></section>
  </div>
}
