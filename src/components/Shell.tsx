import { useEffect, useRef, type ReactNode } from 'react'
import type { TrainingEffort } from '../domain/types'

export type View = 'home' | 'checkin' | 'builder' | 'plan' | 'library' | 'saved' | 'player' | 'progress' | 'profile'

const nav: Array<{ view: View; icon: string; label: string }> = [
  { view: 'home', icon: '⌂', label: 'Home' }, { view: 'builder', icon: '✦', label: 'Build' },
  { view: 'library', icon: '◫', label: 'Explore' }, { view: 'saved', icon: '▣', label: 'Saved' }, { view: 'progress', icon: '↗', label: 'Progress' },
]

const effortLabel:Record<TrainingEffort,string>={easy:'Take it easy',standard:'Standard',push:'Push it'}

export function Shell({ view, title, trainingEffort, effortPaused=false, onNavigate, onBack, children }: { view: View; title: string; trainingEffort:TrainingEffort; effortPaused?:boolean; onNavigate: (view: View) => void; onBack: () => void; children: ReactNode }) {
  const mainRef=useRef<HTMLElement>(null)
  const activeView = view === 'plan' ? 'builder' : view === 'checkin' ? 'home' : view
  useEffect(()=>{mainRef.current?.focus({preventScroll:true})},[view])
  return <div className={`app-shell effort-${trainingEffort}`}>
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate('home')} aria-label="Movement OS home"><span className="brand-mark">M</span><span>Movement OS</span></button>
      <span className="screen-title">{title}</span>
      <span className={`shell-effort-pill ${effortPaused?'paused':''}`}>{effortPaused?'Training effort paused':effortLabel[trainingEffort]}</span>
      <button className="icon-button" onClick={() => onNavigate('profile')} aria-label="Profile">◎</button>
    </header>
    <main className="app-main" ref={mainRef} tabIndex={-1} aria-label={title}>{children}</main>
    {view !== 'home' && view !== 'player' && <button className="bottom-back" onClick={onBack}><span>←</span> Back</button>}
    {view !== 'player' && <nav className="bottom-nav" aria-label="Primary navigation">
      <button className="rail-brand" onClick={() => onNavigate('home')} aria-label="Movement OS home"><span>M</span></button>
      {nav.map(item => <button key={item.view} className={activeView === item.view ? 'active' : ''} onClick={() => onNavigate(item.view)}>
        <span>{item.icon}</span><small>{item.label}</small>
      </button>)}
    </nav>}
  </div>
}
