import { exerciseById, exercises } from '../data/exercises'
import type { AppState, BuilderPreferences, Category, Exercise, ExerciseStat, Intention, MuscleArea, WorkoutExercise, WorkoutPlan, WorkoutSession } from './types'

const MAX_LEVEL = 5
const sectionTargets = { train:{ Prepare:.16, 'Main work':.58, Condition:.12, Restore:.14 }, recover:{ Prepare:.1, 'Main work':0, Condition:0, Restore:.9 } } as const

function hash(input:string) { let value=2166136261; for (let index=0;index<input.length;index+=1) { value^=input.charCodeAt(index); value=Math.imul(value,16777619) } return Math.abs(value) }
const seededNoise = (seed:string,id:string) => (hash(`${seed}:${id}`)%1000)/1000
const allExercises = (state:AppState) => [...exercises,...state.customExercises]
const resolveExercise = (id:string,state:AppState) => exerciseById.get(id) ?? state.customExercises.find(item => item.id===id)
const muscles = (exercise:Exercise) => [...exercise.primaryMuscles,...exercise.secondaryMuscles]

export function exerciseMatchesArea(exercise:Exercise,area:MuscleArea) {
  if (area==='full_body') return true
  if (area==='upper_body') return exercise.category==='upper' || muscles(exercise).some(value => ['chest','upper_back','shoulders','anterior_shoulder','posterior_shoulder','biceps','triceps','neck'].includes(value))
  if (area==='lower_body' || area==='legs') return exercise.category==='lower' || muscles(exercise).some(value => ['hips','hip_flexors','glutes','quads','hamstrings','adductors','calves','legs'].includes(value))
  if (area==='core') return exercise.category==='core' || muscles(exercise).some(value => ['core','deep_core','rectus_abdominis','obliques','lower_back'].includes(value))
  return muscles(exercise).includes(area)
}

const today = () => new Date().toDateString()
const checkInAreas = (state:AppState) => state.dailyCheckIn.date===today() ? state.dailyCheckIn.tightAreas : []
const activeIssueAreas = (state:AppState,severity?:'flare') => state.issues.filter(item => item.status==='active' && (!severity || item.severity===severity)).map(item => item.area)

function targetLevel(exercise:Exercise,state:AppState,preferences?:BuilderPreferences) {
  if (exercise.category==='upper') return state.profile.upper
  if (exercise.category==='lower') return state.profile.lower
  if (exercise.category==='core') return state.profile.core
  if (exercise.category==='conditioning') return state.profile.conditioning
  return preferences?.level ?? state.profile.level
}

export function getExerciseDecision(id:string,state:AppState) {
  const exercise=resolveExercise(id,state); const stat=state.exerciseStats[id]
  if (!exercise) return { action:'maintain' as const, reason:'Unknown movement' }
  if (!stat) return { action:'maintain' as const, reason:'No sessions logged yet' }
  if (stat.lastRating==='brutal') return exercise.level>1 ? { action:'regress' as const, reason:'Last session was very hard' } : { action:'maintain' as const, reason:'Already at the easiest variant' }
  if (stat.lastRating==='hard') return { action:'maintain' as const, reason:'Recent session was hard' }
  if (stat.consecutiveSuccesses>=3 && exercise.level<MAX_LEVEL) return { action:'progress' as const, reason:'Three consecutive easy/good sessions' }
  return { action:'maintain' as const, reason:'Maintain current level' }
}

function exerciseLoad(exercise:Exercise) { return Math.round(exercise.durationSeconds*(.75+Math.max(0,exercise.level)*.25)) }
export function getAreaLoad(state:AppState,category:'upper'|'lower'|'core'|'conditioning',hours=72) {
  const cutoff=Date.now()-hours*3600000; let total=0
  state.history.filter(session => Date.parse(session.date)>=cutoff).forEach(session => session.exercises.forEach(item => { const exercise=resolveExercise(item.id,state); if (exercise?.category===category) total+=exerciseLoad(exercise) }))
  return total
}
export const getAreaLoadBreakdown = (state:AppState,hours=72) => ({ upper:getAreaLoad(state,'upper',hours), lower:getAreaLoad(state,'lower',hours), core:getAreaLoad(state,'core',hours), conditioning:getAreaLoad(state,'conditioning',hours) })

export function getReadiness(state:AppState) {
  const rows=(['upper','lower','core','conditioning'] as const).map(area => {
    const checkAreas=checkInAreas(state); const affected=checkAreas.some(check => check==='full_body' || check===(area==='upper'?'upper_body':area==='lower'?'lower_body':area))
    const load48=getAreaLoad(state,area,48); const load72=getAreaLoad(state,area,72); const cutoff=Date.now()-48*3600000
    const hard=state.history.some(session => Date.parse(session.date)>=cutoff && ['hard','brutal'].includes(session.rating) && session.exercises.some(item => resolveExercise(item.id,state)?.category===area))
    if (affected || hard || load48>=180) return { area,status:'recover' as const,label:affected?'Sore (check-in)':'Recover',load:load48 }
    if (load72>=140) return { area,status:'caution' as const,label:'Caution',load:load72 }
    return { area,status:'ready' as const,label:'Ready',load:load72 }
  })
  const recover=rows.filter(row=>row.status==='recover').length; const caution=rows.filter(row=>row.status==='caution').length
  return { rows,status:recover>=2?'recover' as const:recover||caution?'caution' as const:'ready' as const }
}

function equipmentMatches(exercise:Exercise,selected:Set<string>) { return exercise.equipment.includes('none') || exercise.equipment.every(item=>selected.has(item)) }
function isFlareExcluded(exercise:Exercise,state:AppState) { return activeIssueAreas(state,'flare').some(area=>exerciseMatchesArea(exercise,area)||exercise.contraindications.includes(area)) }

function adjustedPrescription(exercise:Exercise,intention:Intention,state:AppState) {
  const affected=[...checkInAreas(state),...activeIssueAreas(state)].some(area=>exerciseMatchesArea(exercise,area)||exercise.contraindications.includes(area))
  if (!affected) return { prescription:exercise.prescription,durationSeconds:exercise.durationSeconds,adjusted:false }
  const cautiousRecovery=intention==='recover' && exercise.lowImpact
  const multiplier=cautiousRecovery?1.5:.5
  const prescription=exercise.prescription.replace(/\d+/g,value=>String(Math.max(1,Math.round(Number(value)*multiplier)))) + (cautiousRecovery?' 🎯':' 🩹')
  return { prescription,durationSeconds:Math.max(10,Math.round(exercise.durationSeconds*multiplier/5)*5),adjusted:true }
}

function eligible(category:Category,preferences:BuilderPreferences,state:AppState) {
  const selected=new Set(['none',...preferences.equipment]); const source=allExercises(state).filter(exercise => exercise.category===category && equipmentMatches(exercise,selected) && !state.profile.avoidList.includes(exercise.id) && (!exercise.optIn||state.profile.advancedBridges) && !isFlareExcluded(exercise,state))
  const exact=source.filter(exercise => exercise.level===0 || exercise.level===targetLevel(exercise,state,preferences) || (exercise.level===targetLevel(exercise,state,preferences)+1 && getExerciseDecision(exercise.id,state).action==='progress'))
  if (exact.length) return exact
  const below=source.filter(exercise=>exercise.level===0 || exercise.level<=targetLevel(exercise,state,preferences)); const nearest=Math.max(0,...below.map(exercise=>exercise.level))
  return below.filter(exercise=>exercise.level===0||exercise.level===nearest)
}

function recentUses(state:AppState,id:string,days=14) { const cutoff=Date.now()-days*86400000; return state.history.filter(session=>Date.parse(session.date)>=cutoff).reduce((sum,session)=>sum+session.exercises.filter(item=>item.id===id).length,0) }
function candidateScore(exercise:Exercise,preferences:BuilderPreferences,state:AppState,seed:string,usedPatterns:Map<string,number>) {
  const stat=state.exerciseStats[exercise.id]; let score=seededNoise(seed,exercise.id)*3
  if (exercise.goals.includes(preferences.goal)) score+=10
  if (preferences.focusAreas.some(area=>exerciseMatchesArea(exercise,area))) score+=20
  if (state.profile.favourites.includes(exercise.id)) score+=15
  score-=(usedPatterns.get(exercise.pattern)??0)*9; score-=recentUses(state,exercise.id)*2.2
  const load=getAreaLoad(state,exercise.category==='warmup'||exercise.category==='mobility'||exercise.category==='stretching'||exercise.category==='mindfulness'?'core':exercise.category as 'upper'|'lower'|'core'|'conditioning')
  score-=Math.min(8,load/35)
  if (stat?.lastRating==='good'||stat?.lastRating==='easy') score+=2
  if (stat?.lastRating==='hard') score-=4
  if (stat?.lastRating==='brutal') score-=9
  if (getExerciseDecision(exercise.id,state).action==='regress') score-=8
  return score
}

function pick(pool:Exercise[],count:number,preferences:BuilderPreferences,state:AppState,seed:string,used:Set<string>,patterns:Map<string,number>) {
  const result:Exercise[]=[]
  const staples=pool.filter(exercise=>state.profile.favourites.includes(exercise.id) && !used.has(exercise.id))
  for (const exercise of staples.slice(0,count)) { result.push(exercise);used.add(exercise.id);patterns.set(exercise.pattern,(patterns.get(exercise.pattern)??0)+1) }
  while(result.length<count) { const next=pool.filter(exercise=>!used.has(exercise.id)).map(exercise=>({exercise,score:candidateScore(exercise,preferences,state,seed,patterns)})).sort((a,b)=>b.score-a.score)[0]?.exercise; if(!next)break;result.push(next);used.add(next.id);patterns.set(next.pattern,(patterns.get(next.pattern)??0)+1) }
  return result
}

const rationale=(exercise:Exercise,preferences:BuilderPreferences,state:AppState) => {
  const reasons:string[]=[]; if(exercise.goals.includes(preferences.goal))reasons.push(`supports ${preferences.goal}`); const focus=preferences.focusAreas.find(area=>exerciseMatchesArea(exercise,area)); if(focus)reasons.push(`targets ${focus.replaceAll('_',' ')}`); const decision=getExerciseDecision(exercise.id,state); if(decision.action!=='maintain')reasons.push(decision.action==='progress'?'earned progression':'easier work recommended'); return reasons.join(' · ')||`balances the ${exercise.pattern.replaceAll('_',' ')} pattern`
}

export function generateWorkout(preferences:BuilderPreferences,state:AppState,seed=new Date().toISOString().slice(0,10)):WorkoutPlan {
  const used=new Set<string>();const patterns=new Map<string,number>();const targets=sectionTargets[preferences.intention]
  const requestedExercises=preferences.exercisesPerRound==='auto' ? (preferences.durationMinutes!=='auto'&&preferences.durationMinutes<=15?3:preferences.durationMinutes!=='auto'&&preferences.durationMinutes>=45?6:4) : Math.max(1,Math.min(12,preferences.exercisesPerRound))
  const requestedSets=preferences.targetSets==='auto'?3:Math.max(1,Math.min(10,preferences.targetSets))
  const autoMinutes=Math.max(10,Math.round(((preferences.includeWarmup?180:0)+(requestedExercises*requestedSets*60)+180)/60))
  const durationMinutes=preferences.durationMinutes==='auto'?autoMinutes:preferences.durationMinutes
  const seconds=durationMinutes*60;const countFor=(ratio:number,average=55)=>Math.max(0,Math.round(seconds*ratio/average))
  const warmup=preferences.includeWarmup?pick(eligible('warmup',preferences,state),Math.max(1,countFor(targets.Prepare,40)),preferences,state,`${seed}:warm`,used,patterns):[]
  const mainPool=(['upper','lower','core'] as Category[]).flatMap(category=>eligible(category,preferences,state))
  const main=pick(mainPool,preferences.intention==='recover'?0:requestedExercises,preferences,state,`${seed}:main`,used,patterns)
  const condition=preferences.intention==='train'&&preferences.includeConditioning?pick(eligible('conditioning',preferences,state),Math.max(1,countFor(targets.Condition,45)),preferences,state,`${seed}:condition`,used,patterns):[]
  const recoveryCategories:Category[]=preferences.recoveryModes.length?preferences.recoveryModes:['mobility','stretching']
  const recoveryPool=recoveryCategories.flatMap(category=>eligible(category,preferences,state))
  const restoreCount=Math.max(2,countFor(targets.Restore,60));const restoreMovementCount=Math.max(1,restoreCount-1)
  const restoreMovements=pick(recoveryPool,restoreMovementCount,preferences,state,`${seed}:restore`,used,patterns)
  const meditation=pick(eligible('mindfulness',preferences,state),1,preferences,state,`${seed}:meditation`,used,patterns)
  const planned:Array<{section:WorkoutExercise['section'];exercise:Exercise;setNumber?:number;totalSets?:number}>=[]
  warmup.forEach(exercise=>planned.push({section:'Prepare',exercise}))
  for(let setNumber=1;setNumber<=requestedSets;setNumber+=1) main.forEach(exercise=>planned.push({section:'Main work',exercise,setNumber,totalSets:requestedSets}))
  condition.forEach(exercise=>planned.push({section:'Condition',exercise}))
  ;[...restoreMovements,...meditation].forEach(exercise=>planned.push({section:'Restore',exercise}))
  const selected=planned.map(({section,exercise,setNumber,totalSets})=>{const adjusted=adjustedPrescription(exercise,preferences.intention,state);return { exerciseId:exercise.id,...adjusted,rationale:rationale(exercise,preferences,state),section,scaled:null,originalLevel:exercise.level,setNumber,totalSets }})
  const focus=preferences.focusAreas.map(area=>area.replaceAll('_',' ')).join(' + ')||'full body';const readiness=getReadiness(state)
  const structureInsight=preferences.intention==='recover'?`${restoreMovements.length} mobility/stretch movements; exactly one meditation included.`:`${main.length} main movement${main.length===1?'':'s'} across ${requestedSets} set${requestedSets===1?'':'s'}; exactly one meditation included.`
  return { id:`plan_${Date.now()}`,name:preferences.intention==='recover'?`${durationMinutes} min Restore`:`${focus.replace(/\b\w/g,char=>char.toUpperCase())} · ${preferences.goal}`,intention:preferences.intention,goal:preferences.goal,durationMinutes,createdAt:new Date().toISOString(),exercises:selected,focusAreas:preferences.focusAreas,insights:[`${selected.length} movements selected from ${allExercises(state).length} supported exercises.`,structureInsight,readiness.status==='ready'?'Current training load is ready.':`Readiness is ${readiness.status}; volume and selection were adjusted.`,state.issues.some(issue=>issue.status==='active')?'Active issues were applied to selection and prescriptions.':'No active issue constraints applied.',Object.keys(state.exerciseStats).length?'Exercise history informed progression and regression.':'Complete and rate sessions to begin progression.'] }
}

export function findTierVariant(id:string,direction:-1|1,state:AppState) { const current=resolveExercise(id,state); if(!current||current.level===0||current.isCustom)return null; return allExercises(state).filter(exercise=>exercise.id!==id&&exercise.pattern===current.pattern&&exercise.level===current.level+direction&&!isFlareExcluded(exercise,state)&&!state.profile.avoidList.includes(exercise.id))[0]??null }
export function scalePlanExercise(plan:WorkoutPlan,index:number,direction:-1|1,state:AppState) { const item=plan.exercises[index];const variant=findTierVariant(item.exerciseId,direction,state);if(!variant)return plan;const adjustment=adjustedPrescription(variant,plan.intention,state);const exercises=plan.exercises.map((entry,itemIndex)=>itemIndex===index?{...entry,exerciseId:variant.id,...adjustment,scaled:direction>0?'up' as const:'down' as const,rationale:`${direction>0?'Manually progressed to a harder family variant.':'Manually regressed to an easier family variant.'}${adjustment.adjusted?' Recovery adjustment retained.':''}`}:entry);return {...plan,exercises} }
export function adjustPlanPrescription(plan:WorkoutPlan,index:number,direction:-1|1) { const exercises=plan.exercises.map((entry,itemIndex)=>{if(itemIndex!==index)return entry;const timed=/sec|min/i.test(entry.prescription);const step=timed?5:1;const prescription=entry.prescription.replace(/\d+/g,value=>String(Math.max(1,Number(value)+direction*step)));return {...entry,prescription,durationSeconds:timed?Math.max(5,entry.durationSeconds+direction*5):entry.durationSeconds}});return {...plan,exercises} }
export function removePlanExercise(plan:WorkoutPlan,index:number) { return {...plan,exercises:plan.exercises.filter((_,itemIndex)=>itemIndex!==index)} }
export function reorderPlanExercise(plan:WorkoutPlan,fromIndex:number,toIndex:number) {
  if (fromIndex===toIndex || fromIndex<0 || toIndex<0 || fromIndex>=plan.exercises.length || toIndex>=plan.exercises.length) return plan
  if (plan.exercises[fromIndex].section!==plan.exercises[toIndex].section) return plan
  const exercises=[...plan.exercises]
  const [moved]=exercises.splice(fromIndex,1)
  exercises.splice(toIndex,0,moved)
  return {...plan,exercises}
}

export function swapPlanExercise(plan:WorkoutPlan,index:number,state:AppState) {
  const current=plan.exercises[index]; const exercise=resolveExercise(current.exerciseId,state); if(!exercise)return plan
  const used=new Set(plan.exercises.map(item=>item.exerciseId)); const alternatives=allExercises(state).filter(item=>item.id!==exercise.id&&!used.has(item.id)&&item.category===exercise.category&&item.level===exercise.level&&item.pattern!==exercise.pattern&&!isFlareExcluded(item,state)&&!state.profile.avoidList.includes(item.id))
  const swapPreferences:BuilderPreferences={ intention:plan.intention,goal:plan.goal,durationMinutes:plan.durationMinutes,focusAreas:plan.focusAreas,equipment:state.profile.equipment,level:state.profile.level,includeConditioning:true,includeWarmup:true,exercisesPerRound:'auto',targetSets:'auto',recoveryModes:['mobility','stretching'] }
  const replacement=alternatives.sort((a,b)=>candidateScore(b,swapPreferences,state,`${plan.id}:swap:${index}`,new Map())-candidateScore(a,swapPreferences,state,`${plan.id}:swap:${index}`,new Map()))[0]
  if(!replacement)return plan
  const adjustment=adjustedPrescription(replacement,plan.intention,state)
  const exercises=plan.exercises.map((item,itemIndex)=>itemIndex===index?{...item,exerciseId:replacement.id,...adjustment,rationale:`Swapped for a comparable movement at the same level.${adjustment.adjusted?' Recovery adjustment applied.':''}`,scaled:null,originalLevel:replacement.level}:item)
  return {...plan,exercises}
}

export function applySessionCompletion(state:AppState,session:WorkoutSession):AppState {
  const stats={...state.exerciseStats}; for(const id of [...new Set(session.completedExerciseIds)]) { const previous=stats[id]??{attempts:0,completed:0,easyGood:0,hard:0,brutal:0,consecutiveSuccesses:0,lastRating:null,lastCompletedAt:null,lastDurationSeconds:null,progressionReady:false,coachDecision:null} satisfies ExerciseStat; const positive=session.rating==='easy'||session.rating==='good'; const next={...previous,attempts:previous.attempts+1,completed:previous.completed+1,easyGood:previous.easyGood+(positive?1:0),hard:previous.hard+(session.rating==='hard'?1:0),brutal:previous.brutal+(session.rating==='brutal'?1:0),consecutiveSuccesses:positive?previous.consecutiveSuccesses+1:0,lastRating:session.rating,lastCompletedAt:session.date,lastDurationSeconds:session.exercises.find(item=>item.id===id)?.durationSeconds??null}; const exercise=resolveExercise(id,state); const action=session.rating==='brutal'&&exercise&&exercise.level>1?'regress':next.consecutiveSuccesses>=3&&exercise&&exercise.level<MAX_LEVEL?'progress':'maintain';stats[id]={...next,progressionReady:action==='progress',coachDecision:action} }
  return {...state,exerciseStats:stats,history:[session,...state.history].slice(0,250)}
}

export function generateCategoryWorkout(area:MuscleArea,state:AppState,durationMinutes=20) { const recover=area==='hips';return generateWorkout({intention:recover?'recover':'train',goal:recover?'mobility':area==='full_body'?'endurance':state.profile.goal,durationMinutes,focusAreas:[area],equipment:state.profile.equipment,level:state.profile.level,includeConditioning:area==='full_body',includeWarmup:!recover,exercisesPerRound:'auto',targetSets:'auto',recoveryModes:['mobility','stretching']},state,`${new Date().toISOString().slice(0,10)}:${area}`) }

export function createManualWorkout(ids:string[],state:AppState):WorkoutPlan {
  const selected=ids.map(id=>resolveExercise(id,state)).filter((item):item is Exercise=>Boolean(item))
  const manual:WorkoutExercise[]=selected.map(exercise=>{const adjustment=adjustedPrescription(exercise,'train',state);return {exerciseId:exercise.id,...adjustment,rationale:`Selected manually from your exercise library.${adjustment.adjusted?' Recovery adjustment applied.':''}`,section:exercise.category==='warmup'?'Prepare':exercise.category==='mobility'||exercise.category==='stretching'||exercise.category==='mindfulness'?'Restore':exercise.category==='conditioning'?'Condition':'Main work',scaled:null,originalLevel:exercise.level}})
  return {id:`manual_${Date.now()}`,name:'My selected workout',intention:'train',goal:state.profile.goal,durationMinutes:Math.max(1,Math.round(manual.reduce((sum,item)=>sum+item.durationSeconds,0)/60)),createdAt:new Date().toISOString(),exercises:manual,focusAreas:[],insights:[`${manual.length} movements selected from your library.`,'Adjust, scale, swap, or avoid any movement before starting.']}
}
