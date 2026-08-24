import { catalogueStats } from '../data/exercises'
import { getDashboardStats } from '../domain/stats'
import type { AppState, MuscleArea, TrainingEffort } from '../domain/types'

const categories: Array<{ area: MuscleArea; label: string; icon: string; note: string }> = [
  { area: 'upper_body', label: 'Upper body', icon: '↑', note: 'Push + pull balance' },
  { area: 'lower_body', label: 'Lower body', icon: '↓', note: 'Squat, hinge + lunge' },
  { area: 'core', label: 'Core', icon: '◆', note: 'Brace, carry + rotate' },
  { area: 'full_body', label: 'Conditioning', icon: 'ϟ', note: 'Move + build capacity' },
  { area: 'hips', label: 'Mobility', icon: '〰', note: 'Restore range + control' },
]

const effortOptions:Array<{id:TrainingEffort;label:string;note:string}>=[
  {id:'easy',label:'Take it easy',note:'25% fewer reps and less time'},
  {id:'standard',label:'Standard',note:'Your usual adaptive training dose'},
  {id:'push',label:'Push it',note:'25% more, with flagged areas omitted'},
]

export function HomeScreen({ state, onTrainingEffort, onBuild, onSuggested, onCategory, onResume, onOpenPlan, onViewSaved }: { state: AppState; onTrainingEffort:(effort:TrainingEffort)=>void; onBuild: () => void; onSuggested: () => void; onCategory: (area: MuscleArea) => void; onResume: () => void; onOpenPlan: (index: number) => void; onViewSaved:()=>void }) {
  const stats = getDashboardStats(state)
  const effortIndex=Math.max(0,effortOptions.findIndex(option=>option.id===state.trainingEffort))
  const selectedEffort=effortOptions[effortIndex]
  return <div className="screen home-screen">
    {state.activeSession && <section className="resume-card"><div><span className="eyebrow">SESSION IN PROGRESS</span><h2>{state.activeSession.plan.name}</h2><p>Movement {state.activeSession.index + 1} of {state.activeSession.plan.exercises.length}</p></div><button className="primary" onClick={onResume}>Resume <span>→</span></button></section>}
    <section className="hero-card">
      <span className="eyebrow">TODAY · READY TO MOVE</span>
      <h1>{state.profile.name ? `Good to see you, ${state.profile.name}.` : 'Train for the body you have today.'}</h1>
      <p>Adaptive sessions shaped by your goal, equipment, recent work, and anything you’re managing.</p>
      <div className={`training-effort-control effort-${selectedEffort.id}`}>
        <div className="training-effort-heading"><label htmlFor="training-effort-slider">Training effort</label><strong>{selectedEffort.label}</strong></div>
        <input id="training-effort-slider" className="effort-slider" type="range" min="0" max="2" step="1" value={effortIndex} aria-valuetext={`${selectedEffort.label}. ${selectedEffort.note}`} onChange={event=>onTrainingEffort(effortOptions[Number(event.currentTarget.value)].id)}/>
        <div className="effort-slider-labels" aria-hidden="true">{effortOptions.map(option=><span key={option.id}>{option.label}</span>)}</div>
        <small className="effort-summary">{selectedEffort.note} · Training sessions only · Resets to Standard tomorrow</small>
      </div>
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

    {state.savedPlans.length > 0 && <><div className="section-heading"><div><span className="eyebrow">YOUR LIBRARY</span><h2>Saved workouts</h2></div><button className="section-link" onClick={onViewSaved}>View all ({state.savedPlans.length})</button></div><section className="saved-plan-list">{state.savedPlans.slice(0,3).map((plan,index) => <button key={plan.id} className="saved-plan-card" onClick={() => onOpenPlan(index)}><span><strong>{plan.name}</strong><small>{plan.exercises.length} movements · {plan.durationMinutes} min</small></span><b>→</b></button>)}</section></>}

    <section className="insight-card"><span className="insight-icon">✦</span><div><strong>How today’s suggestion works</strong><p>Movement OS balances movement patterns, recent muscle load, equipment, level, goals, variety, and active issues. Complete and rate sessions to improve the next recommendation.</p></div></section>
  </div>
}
