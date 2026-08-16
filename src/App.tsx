import { useCallback, useEffect, useState } from 'react'
import { Shell, type View } from './components/Shell'
import { addPlanExercise, adjustPlanPrescription, applySessionCompletion, avoidPlanExercise, createManualWorkout, generateCategoryWorkout, generateWorkout, getAreaLoadBreakdown, removePlanExercise, reorderPlanExercise, scalePlanExercise, swapPlanExercise } from './domain/engine'
import type { ActiveSession, AppState, BuilderPreferences, Exercise, MuscleArea, Profile, WorkoutPlan, WorkoutSession } from './domain/types'
import { HomeScreen } from './screens/HomeScreen'
import { BuilderScreen } from './screens/BuilderScreen'
import { PlanScreen } from './screens/PlanScreen'
import { LibraryScreen } from './screens/LibraryScreen'
import { PlayerScreen } from './screens/PlayerScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { SavedPlansScreen } from './screens/SavedPlansScreen'
import { defaultState, loadState, saveState } from './storage/state'
import './styles.css'

const titles: Record<View,string> = { home: 'Home', builder: 'Build a session', plan: 'Your session', library: 'Exercise library', saved:'Saved workouts', player: 'Active session', progress: 'Progress', profile: 'Profile' }

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [view, setView] = useState<View>('home')
  const [history, setHistory] = useState<View[]>([])
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [lastPreferences, setLastPreferences] = useState<BuilderPreferences | null>(null)
  const [createCustom,setCreateCustom]=useState(false)
  useEffect(() => saveState(state), [state])

  const navigate = (next: View) => { if (next !== view) setHistory(current => [...current, view]); setView(next); window.scrollTo(0,0) }
  const goBack = () => { const copy = [...history]; const target = copy.pop() ?? 'home'; setHistory(copy); setView(target); window.scrollTo(0,0) }
  const showPlan = (nextPlan: WorkoutPlan, preferences?: BuilderPreferences) => { setPlan(nextPlan); if (preferences) setLastPreferences(preferences); navigate('plan') }
  const suggested = () => {
    const preferences: BuilderPreferences = { intention: state.profile.goal === 'mobility' ? 'recover' : 'train', goal: state.profile.goal, durationMinutes: 30, focusAreas: ['full_body'], equipment: state.profile.equipment, level: state.profile.level, includeConditioning: state.profile.goal === 'endurance' || state.profile.goal === 'general', includeWarmup:state.profile.goal!=='mobility', exercisesPerRound:'auto', targetSets:'auto', recoveryModes:['mobility','stretching'] }
    showPlan(generateWorkout(preferences, state), preferences)
  }
  const category = (area: MuscleArea) => showPlan(generateCategoryWorkout(area, state))
  const toggleList = (key: 'favourites'|'avoidList', id: string) => setState(current => ({ ...current, profile: { ...current.profile, [key]: current.profile[key].includes(id) ? current.profile[key].filter(item => item !== id) : [...current.profile[key], id] } }))
  const startPlan = () => {
    if (!plan) return
    setState(current => ({ ...current, activeSession: { plan, index:0, remainingSeconds:plan.exercises[0]?.durationSeconds ?? 0, running:true, deadlineAt:Date.now() + (plan.exercises[0]?.durationSeconds ?? 0) * 1000, startedAt:Date.now(), completedExerciseIds:[] } }))
    navigate('player')
  }
  const persistSession = useCallback((activeSession: ActiveSession) => setState(current => ({ ...current, activeSession })), [])
  const complete = (session: WorkoutSession) => { setState(current => ({ ...applySessionCompletion(current, session), activeSession:null })); setHistory([]); setView('progress'); window.scrollTo(0,0) }
  const upsertCustom = (exercise: Exercise) => setState(current => ({ ...current, customExercises:[exercise, ...current.customExercises.filter(item => item.id !== exercise.id)].slice(0,250) }))
  const avoidFromPlan = (index:number,id:string) => {
    const nextState={...state,profile:{...state.profile,avoidList:[...new Set([...state.profile.avoidList,id])]}}
    setState(nextState); if(plan)setPlan(avoidPlanExercise(plan,index,nextState))
  }
  const resetAllData=()=>{
    if(!confirm('Reset all Movement OS data on this device? This permanently deletes your profile, workouts, history, issues, and custom exercises. Export a backup first if you may need it.'))return
    setState(structuredClone(defaultState));setPlan(null);setLastPreferences(null);setCreateCustom(false);setHistory([]);setView('home');window.scrollTo(0,0)
  }

  if (view === 'player' && state.activeSession) return <PlayerScreen session={state.activeSession} state={state} customExercises={state.customExercises} soundEnabled={state.profile.soundEnabled} waitBetweenExercises={state.profile.waitBetweenExercises} areaLoadBefore={getAreaLoadBreakdown(state)} onProgress={persistSession} onComplete={complete} onExit={() => { setState(current => ({ ...current, activeSession:null })); setHistory([]); setView('home') }}/>

  let content: React.ReactNode
  const openSavedPlan=(index:number)=>{const savedPlan=state.savedPlans[index];if(savedPlan)showPlan(savedPlan)}
  const planIsSaved=Boolean(plan&&state.savedPlans.some(saved=>saved.id===plan.id&&JSON.stringify(saved.exercises)===JSON.stringify(plan.exercises)))
  if (view === 'home') content = <HomeScreen state={state} onBuild={() => navigate('builder')} onSuggested={suggested} onCategory={category} onResume={() => { setPlan(state.activeSession?.plan ?? null); navigate('player') }} onOpenPlan={openSavedPlan} onViewSaved={()=>navigate('saved')}/>
  else if (view === 'builder') content = <BuilderScreen profile={state.profile} dailyCheckIn={state.dailyCheckIn} onCheckIn={dailyCheckIn => setState(current => ({ ...current,dailyCheckIn }))} onGenerate={preferences => showPlan(generateWorkout(preferences, state), preferences)}/>
  else if (view === 'plan' && plan) content = <PlanScreen plan={plan} customExercises={state.customExercises} isSaved={planIsSaved} onStart={startPlan} onSave={() => setState(current => ({ ...current, savedPlans: [plan, ...current.savedPlans.filter(item => item.id !== plan.id)].slice(0,50) }))} onViewSaved={()=>navigate('saved')} onRegenerate={() => showPlan(lastPreferences ? generateWorkout(lastPreferences,state,`${Date.now()}`,plan.exercises.map(item=>item.exerciseId)) : generateCategoryWorkout('full_body',state), lastPreferences ?? undefined)} onEasier={index=>setPlan(scalePlanExercise(plan,index,-1,state))} onHarder={index=>setPlan(scalePlanExercise(plan,index,1,state))} onAdjust={(index,direction)=>setPlan(adjustPlanPrescription(plan,index,direction))} onSwap={index=>setPlan(swapPlanExercise(plan,index,state))} onReorder={(fromIndex,toIndex)=>setPlan(reorderPlanExercise(plan,fromIndex,toIndex))} onAdd={(groupIndex,exerciseId)=>setPlan(addPlanExercise(plan,groupIndex,exerciseId,state))} onRemove={index=>setPlan(removePlanExercise(plan,index))} onAvoid={avoidFromPlan}/>
  else if (view === 'library') content = <LibraryScreen state={state} onToggleFavourite={id => toggleList('favourites',id)} onToggleAvoid={id => toggleList('avoidList',id)} onCreateExercise={()=>{setCreateCustom(true);navigate('profile')}} onDeleteCustom={id=>setState(current=>({...current,customExercises:current.customExercises.filter(item=>item.id!==id)}))} onBuildSelected={ids=>showPlan(createManualWorkout(ids,state))}/>
  else if (view === 'saved') content = <SavedPlansScreen plans={state.savedPlans} onOpen={openSavedPlan} onDelete={id=>setState(current=>({...current,savedPlans:current.savedPlans.filter(item=>item.id!==id)}))} onBuild={()=>navigate('builder')}/>
  else if (view === 'progress') content = <ProgressScreen state={state}/>
  else content = <ProfileScreen state={state} initialCreate={createCustom} onCreateOpened={()=>setCreateCustom(false)} onProfile={(profile: Profile) => setState(current => ({ ...current, profile }))} onReplaceState={setState} onResetData={resetAllData} onAddIssue={(area,severity,side,note) => setState(current => ({ ...current, issues: [{ id:`issue_${Date.now()}`, area, severity, side, note:note.slice(0,500), status:'active', createdAt:new Date().toISOString(), resolvedAt:null }, ...current.issues] }))} onResolveIssue={id => setState(current => ({ ...current, issues: current.issues.map(issue => issue.id === id ? { ...issue, status:'resolved', resolvedAt:new Date().toISOString() } : issue) }))} onReopenIssue={id => setState(current => ({ ...current, issues:current.issues.map(issue => issue.id===id?{...issue,status:'active',resolvedAt:null}:issue) }))} onDeleteIssue={id => setState(current => ({...current,issues:current.issues.filter(issue=>issue.id!==id)}))} onSaveCustom={upsertCustom} onDeleteCustom={id => setState(current => ({ ...current, customExercises:current.customExercises.filter(item => item.id !== id) }))}/>

  return <Shell view={view} title={titles[view]} onNavigate={navigate} onBack={goBack}>{content}</Shell>
}
