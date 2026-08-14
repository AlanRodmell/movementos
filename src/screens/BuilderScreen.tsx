import { useState } from 'react'
import type { BuilderPreferences, DailyCheckIn, Equipment, Goal, Intention, MuscleArea, Profile } from '../domain/types'

const goals: Array<{ id: Goal; title: string; note: string }> = [
  { id: 'general', title: 'General fitness', note: 'Balanced strength and movement' }, { id: 'strength', title: 'Strength', note: 'Harder patterns and longer recovery' },
  { id: 'muscle', title: 'Muscle', note: 'More volume and repeat exposure' }, { id: 'endurance', title: 'Endurance', note: 'More sustained work and conditioning' },
  { id: 'mobility', title: 'Mobility', note: 'Range, control and restoration' },
]
const areas: Array<[MuscleArea,string]> = [['full_body','Full body'],['upper_body','Upper body'],['lower_body','Lower body'],['core','Core'],['chest','Chest'],['upper_back','Back'],['shoulders','Shoulders'],['hips','Hips'],['glutes','Glutes'],['hamstrings','Hamstrings']]
const equipment: Array<[Equipment,string]> = [['none','Bodyweight'],['bands','Bands'],['dumbbells','Dumbbells'],['kettlebell','Kettlebell'],['barbell','Barbell'],['bar','Pull-up bar'],['bench','Bench'],['cable','Cable'],['machine','Machines'],['box','Box / step'],['rope','Rope']]

export function BuilderScreen({ profile, dailyCheckIn, onCheckIn, onGenerate }: { profile: Profile; dailyCheckIn: DailyCheckIn; onCheckIn: (checkIn: DailyCheckIn) => void; onGenerate: (preferences: BuilderPreferences) => void }) {
  const [step, setStep] = useState(0)
  const [intention, setIntention] = useState<Intention>('train')
  const [goal, setGoal] = useState<Goal>(profile.goal)
  const [focusAreas, setFocusAreas] = useState<MuscleArea[]>(['full_body'])
  const [durationMinutes, setDuration] = useState(30)
  const [selectedEquipment, setEquipment] = useState<Equipment[]>(profile.equipment)
  const isToday = dailyCheckIn.date === new Date().toDateString()
  const [tightAreas, setTightAreas] = useState<MuscleArea[]>(isToday ? dailyCheckIn.tightAreas : [])
  const [primaryArea, setPrimaryArea] = useState<MuscleArea | null>(isToday ? dailyCheckIn.primaryArea : null)
  const toggleArea = (area: MuscleArea) => setFocusAreas(current => current.includes(area) ? current.filter(item => item !== area) : [...current.filter(item => item !== 'full_body'), area])
  const toggleEquipment = (item: Equipment) => setEquipment(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item])
  const checkInOptions: Array<[MuscleArea,string]> = [['neck','Neck'],['shoulders','Shoulders'],['chest','Chest'],['upper_back','Upper back'],['lower_back','Lower back'],['hips','Hips'],['hip_flexors','Hip flexors'],['glutes','Glutes'],['quads','Quads'],['hamstrings','Hamstrings'],['calves','Calves'],['core','Core']]
  const next = () => {
    if (step === 0) onCheckIn({ date:new Date().toDateString(),tightAreas,primaryArea:tightAreas.length ? (primaryArea ?? tightAreas[0]) : null })
    if (step < 4) setStep(step + 1)
    else onGenerate({ intention, goal: intention === 'recover' ? 'mobility' : goal, durationMinutes, focusAreas, equipment: selectedEquipment, level: profile.level, includeConditioning: goal === 'endurance' || focusAreas.includes('full_body') })
  }
  return <div className="screen builder-screen">
    <div className="wizard-progress"><span>SETUP {step + 1} OF 5</span><div>{[0,1,2,3,4].map(value => <i className={value <= step ? 'active' : ''} key={value}/>)}</div></div>
    {step === 0 && <section className="wizard-panel"><span className="eyebrow">DAILY CHECK-IN</span><h1>How are you moving today?</h1><p>Select anything that feels tight or sensitive. The engine will adapt volume and exercise choice for today.</p><div className="filter-pills"><button className={!tightAreas.length ? 'selected' : ''} onClick={() => { setTightAreas([]);setPrimaryArea(null) }}>Nothing to flag</button>{checkInOptions.map(([id,label]) => <button key={id} className={tightAreas.includes(id)?'selected':''} onClick={() => setTightAreas(current => { const next=current.includes(id)?current.filter(item=>item!==id):[...current,id];if(primaryArea===id&&!next.includes(id))setPrimaryArea(next[0]??null);return next })}>{label}</button>)}</div>{tightAreas.length>1&&<label className="checkin-primary">Most noticeable today<select value={primaryArea??tightAreas[0]} onChange={event=>setPrimaryArea(event.target.value as MuscleArea)}>{tightAreas.map(area=><option key={area} value={area}>{area.replaceAll('_',' ')}</option>)}</select></label>}</section>}
    {step === 1 && <section className="wizard-panel"><span className="eyebrow">INTENTION</span><h1>What does your body need?</h1><p>This changes the structure, intensity, and exercise pool.</p><div className="choice-stack">
      <button className={intention === 'train' ? 'choice selected' : 'choice'} onClick={() => setIntention('train')}><span className="choice-symbol">↑</span><span><strong>Train</strong><small>Strength, muscle or conditioning</small></span><b>✓</b></button>
      <button className={intention === 'recover' ? 'choice selected recovery' : 'choice'} onClick={() => setIntention('recover')}><span className="choice-symbol">〰</span><span><strong>Recover</strong><small>Mobility, breathing and gentle movement</small></span><b>✓</b></button>
    </div></section>}
    {step === 2 && <section className="wizard-panel"><span className="eyebrow">OUTCOME</span><h1>What are you training for?</h1><div className="choice-grid">{goals.filter(item => intention === 'train' || item.id === 'mobility').map(item => <button key={item.id} className={goal === item.id ? 'mini-choice selected' : 'mini-choice'} onClick={() => setGoal(item.id)}><strong>{item.title}</strong><small>{item.note}</small></button>)}</div></section>}
    {step === 3 && <section className="wizard-panel"><span className="eyebrow">FOCUS</span><h1>Where should we focus?</h1><p>Select one or more areas. Full body gives the engine maximum freedom.</p><div className="filter-pills">{areas.map(([id,label]) => <button key={id} className={focusAreas.includes(id) ? 'selected' : ''} onClick={() => id === 'full_body' ? setFocusAreas(['full_body']) : toggleArea(id)}>{label}</button>)}</div></section>}
    {step === 4 && <section className="wizard-panel"><span className="eyebrow">CONSTRAINTS</span><h1>Time and equipment</h1><label className="range-label"><span>Session length</span><strong>{durationMinutes} min</strong></label><input type="range" min="10" max="60" step="5" value={durationMinutes} onChange={event => setDuration(Number(event.target.value))}/><h3>Available today</h3><div className="filter-pills">{equipment.map(([id,label]) => <button key={id} className={selectedEquipment.includes(id) ? 'selected' : ''} onClick={() => toggleEquipment(id)}>{label}</button>)}</div></section>}
    <div className="wizard-actions">{step > 0 && <button className="secondary" onClick={() => setStep(step - 1)}>Previous step</button>}<button className="primary" onClick={next}>{step === 4 ? 'Generate my session' : 'Continue'} <span>→</span></button></div>
  </div>
}
