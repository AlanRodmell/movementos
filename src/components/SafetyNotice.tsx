export function SafetyNotice({ compact=false }: { compact?:boolean }) {
  return <aside className={`safety-notice ${compact?'compact':''}`} aria-label="Exercise safety">
    <span aria-hidden="true">!</span>
    <div><strong>Use your judgement</strong><p>Movement OS offers general exercise guidance, not diagnosis or medical care. Stop if a movement causes pain, dizziness, or unusual symptoms and seek appropriate professional advice.</p></div>
  </aside>
}
