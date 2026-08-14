import type { ReactNode } from 'react'

export type View = 'home' | 'builder' | 'plan' | 'library' | 'player' | 'progress' | 'profile'

const nav: Array<{ view: View; icon: string; label: string }> = [
  { view: 'home', icon: '⌂', label: 'Home' }, { view: 'builder', icon: '✦', label: 'Build' },
  { view: 'library', icon: '◫', label: 'Explore' }, { view: 'progress', icon: '↗', label: 'Progress' },
]

export function Shell({ view, title, onNavigate, onBack, children }: { view: View; title: string; onNavigate: (view: View) => void; onBack: () => void; children: ReactNode }) {
  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate('home')} aria-label="Movement OS home"><span className="brand-mark">M</span><span>Movement OS</span></button>
      <span className="screen-title">{title}</span>
      <button className="icon-button" onClick={() => onNavigate('profile')} aria-label="Profile">◎</button>
    </header>
    <main className="app-main">{children}</main>
    {view !== 'home' && view !== 'player' && <button className="bottom-back" onClick={onBack}><span>←</span> Back</button>}
    {view !== 'player' && <nav className="bottom-nav" aria-label="Primary navigation">
      {nav.map(item => <button key={item.view} className={view === item.view ? 'active' : ''} onClick={() => onNavigate(item.view)}>
        <span>{item.icon}</span><small>{item.label}</small>
      </button>)}
    </nav>}
  </div>
}
