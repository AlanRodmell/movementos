import { exercises } from '../data/exercises'
import type { AppState, ContextLearningStat, ExerciseFeedback, ExerciseLearningEntry, LearningContext, LearningEvent, LearningModel, ProgressionRecommendation, RoutineLearningStat, SessionExercise, WorkoutAction, WorkoutSession } from './types'

export const LEARNING_VERSION = 1 as const
export const MAX_LEARNING_EVENTS = 300
export const MAX_CONTEXTS_PER_EXERCISE = 12

export const emptyLearningModel = (): LearningModel => ({ version:LEARNING_VERSION, exercises:{}, routineContexts:{}, events:[], recommendations:[] })

export const emptyLearningEntry = (): ExerciseLearningEntry => ({
  exposures:0, completedAppearances:0, skips:0, swapsOut:0, swapsIn:0, positiveFeedback:0, tooEasy:0, tooHard:0,
  discomfort:0, negativePreference:0, easierSelections:0, harderSelections:0, lastSelectedAt:null, lastCompletedAt:null,
  preference:0, difficultySuitability:0, completionReliability:.5, evidence:0, contexts:{}, successfulPerformances:0,
  performanceHistory:[], lastDiscomfortAt:null, progressionStatus:'none', progressionEvidenceAt:0,
})

export function normaliseLearningModel(value:unknown):LearningModel{
  if(!value||typeof value!=='object'||Array.isArray(value))return emptyLearningModel()
  const raw=value as Record<string,unknown>;const rawEvents=Array.isArray(raw.events)?raw.events.filter(item=>item&&typeof item==='object').slice(0,MAX_LEARNING_EVENTS) as LearningEvent[]:[];const rawExercises=raw.exercises&&typeof raw.exercises==='object'&&!Array.isArray(raw.exercises)?raw.exercises as Record<string,unknown>:{}
  const learned=Object.fromEntries(Object.entries(rawExercises).filter(([id,item])=>/^[\w-]{1,100}$/.test(id)&&item&&typeof item==='object'&&!Array.isArray(item)).slice(0,1000).map(([id,item])=>{
    const entry=item as Partial<ExerciseLearningEntry>;const base=emptyLearningEntry();const numeric=(key:keyof ExerciseLearningEntry)=>Math.max(0,Number(entry[key])||0)
    const contexts=entry.contexts&&typeof entry.contexts==='object'&&!Array.isArray(entry.contexts)?Object.fromEntries(Object.entries(entry.contexts).filter(([key,value])=>key.length<=180&&value&&typeof value==='object').slice(0,MAX_CONTEXTS_PER_EXERCISE).map(([key,value])=>{
      const context=value as Partial<ContextLearningStat>;const reliability=Number(context.reliability);return[key,{preference:clamp(Number(context.preference)||0),difficultySuitability:clamp(Number(context.difficultySuitability)||0),reliability:clamp(Number.isFinite(reliability)?reliability:.5,0,1),evidence:Math.max(0,Number(context.evidence)||0),lastUpdatedAt:nowIso(context.lastUpdatedAt),skips:Math.max(0,Number(context.skips)||0),swapsOut:Math.max(0,Number(context.swapsOut)||0)}]
    })):{}
    const reliability=Number(entry.completionReliability)
    const performanceHistory=Array.isArray(entry.performanceHistory)?entry.performanceHistory.flatMap(sample=>{if(!sample||typeof sample!=='object')return[];const item=sample as unknown as Record<string,unknown>;const at=String(item.at??'');if(!Number.isFinite(Date.parse(at)))return[];const positive=(value:unknown)=>Number(value)>0?Number(value):undefined;return[{at,prescription:typeof item.prescription==='string'?item.prescription.slice(0,80):'',achievedReps:positive(item.achievedReps),achievedSeconds:positive(item.achievedSeconds),load:positive(item.load),loadUnit:item.loadUnit==='lbs'?'lbs' as const:'kg' as const}] }).slice(-8):[]
    const inferredDiscomfortAt=rawEvents.find(event=>event.exerciseId===id&&event.feedback==='discomfort')?.at
    const discomfortAt=entry.lastDiscomfortAt??inferredDiscomfortAt
    const lastDiscomfortAt=discomfortAt&&Number.isFinite(Date.parse(discomfortAt))?discomfortAt:null
    return[id,{...base,...entry,exposures:numeric('exposures'),completedAppearances:numeric('completedAppearances'),skips:numeric('skips'),swapsOut:numeric('swapsOut'),swapsIn:numeric('swapsIn'),positiveFeedback:numeric('positiveFeedback'),tooEasy:numeric('tooEasy'),tooHard:numeric('tooHard'),discomfort:numeric('discomfort'),negativePreference:numeric('negativePreference'),easierSelections:numeric('easierSelections'),harderSelections:numeric('harderSelections'),evidence:numeric('evidence'),successfulPerformances:numeric('successfulPerformances'),preference:clamp(Number(entry.preference)||0),difficultySuitability:clamp(Number(entry.difficultySuitability)||0),completionReliability:clamp(Number.isFinite(reliability)?reliability:.5,0,1),contexts,performanceHistory,lastDiscomfortAt}]
  }))
  const events=rawEvents
  const recommendations=Array.isArray(raw.recommendations)?raw.recommendations.filter(item=>item&&typeof item==='object').slice(0,100) as ProgressionRecommendation[]:[]
  const routineContexts=raw.routineContexts&&typeof raw.routineContexts==='object'&&!Array.isArray(raw.routineContexts)?Object.fromEntries(Object.entries(raw.routineContexts as Record<string,unknown>).filter(([key,value])=>key.length<=160&&value&&typeof value==='object').slice(0,50).map(([key,value])=>{const item=value as Partial<RoutineLearningStat>;return[key,{confidence:clamp(Number(item.confidence)||0),positive:Math.max(0,Number(item.positive)||0),negative:Math.max(0,Number(item.negative)||0),evidence:Math.max(0,Number(item.evidence)||0),lastUpdatedAt:nowIso(item.lastUpdatedAt),preferredMainCount:Math.max(0,Number(item.preferredMainCount)||0),preferredSets:Math.max(0,Number(item.preferredSets)||0),averageCompletionRate:clamp(Number(item.averageCompletionRate)||0,0,1),averageDurationRatio:Math.max(0,Number(item.averageDurationRatio)||0),warmupAffinity:clamp(Number(item.warmupAffinity)||0),conditioningAffinity:clamp(Number(item.conditioningAffinity)||0)}]})):{}
  return{version:LEARNING_VERSION,exercises:learned,routineContexts,events,recommendations}
}

const clamp = (value:number, min=-1, max=1) => Math.max(min, Math.min(max, value))
const ema = (current:number, target:number, rate:number) => clamp(current + (target - current) * rate)
const smooth = (current:number, target:number, rate:number) => current + (target - current) * rate
const nowIso = (fallback?:string) => fallback && Number.isFinite(Date.parse(fallback)) ? fallback : new Date().toISOString()

function decayed(entry:ExerciseLearningEntry, at:string) {
  const previous = entry.lastSelectedAt ?? entry.lastCompletedAt
  if (!previous) return entry
  const days = Math.max(0, (Date.parse(at) - Date.parse(previous)) / 86400000)
  const factor = Math.pow(.985, days)
  return { ...entry, preference:entry.preference * factor, difficultySuitability:entry.difficultySuitability * factor }
}

function updateContext(entry:ExerciseLearningEntry, context:LearningContext | undefined, at:string, update:(value:ContextLearningStat)=>ContextLearningStat) {
  if (!context) return entry
  const previous = entry.contexts[context.key] ?? { preference:0, difficultySuitability:0, reliability:.5, evidence:0, lastUpdatedAt:at, skips:0, swapsOut:0 }
  const contexts = { ...entry.contexts, [context.key]:update(previous) }
  const retained = Object.entries(contexts).sort((a,b)=>Date.parse(b[1].lastUpdatedAt)-Date.parse(a[1].lastUpdatedAt)).slice(0,MAX_CONTEXTS_PER_EXERCISE)
  return { ...entry, contexts:Object.fromEntries(retained) }
}

function updateAction(entry:ExerciseLearningEntry, action:WorkoutAction, at:string) {
  let next = decayed(entry, at)
  if (action.type === 'completed') next = { ...next, completedAppearances:next.completedAppearances+1, lastCompletedAt:at, completionReliability:ema(next.completionReliability,1,.12), evidence:next.evidence+1 }
  if (action.type === 'skipped') {
    const penalty = next.skips >= 2 ? -.22 : -.1
    next = { ...next, skips:next.skips+1, preference:ema(next.preference,penalty,.14), completionReliability:ema(next.completionReliability,0,.16), evidence:next.evidence+1 }
    next = updateContext(next,action.context,at,value=>({...value,preference:ema(value.preference,penalty,.2),reliability:ema(value.reliability,0,.18),evidence:value.evidence+1,skips:value.skips+1,lastUpdatedAt:at}))
  }
  if (action.type === 'swapped_out') {
    next = { ...next, swapsOut:next.swapsOut+1, preference:ema(next.preference,-.3,.18), evidence:next.evidence+1 }
    next = updateContext(next,action.context,at,value=>({...value,preference:ema(value.preference,-.45,.26),evidence:value.evidence+1,swapsOut:value.swapsOut+1,lastUpdatedAt:at}))
  }
  if (action.type === 'swapped_in') {
    next = { ...next, swapsIn:next.swapsIn+1, preference:ema(next.preference,.35,.16), evidence:next.evidence+1 }
    next = updateContext(next,action.context,at,value=>({...value,preference:ema(value.preference,.45,.2),evidence:value.evidence+1,lastUpdatedAt:at}))
  }
  if (action.type === 'easier') next = { ...next, easierSelections:next.easierSelections+1, difficultySuitability:ema(next.difficultySuitability,-.6,.25), evidence:next.evidence+1 }
  if (action.type === 'harder') next = { ...next, harderSelections:next.harderSelections+1, difficultySuitability:ema(next.difficultySuitability,.6,.25), evidence:next.evidence+1 }
  if (action.type === 'prescription_down') next = { ...next, difficultySuitability:ema(next.difficultySuitability,-.35,.16), evidence:next.evidence+1 }
  if (action.type === 'prescription_up') next = { ...next, difficultySuitability:ema(next.difficultySuitability,.35,.16), evidence:next.evidence+1 }
  return next
}

function updateFeedback(entry:ExerciseLearningEntry, feedback:ExerciseFeedback, at:string, context?:LearningContext) {
  let next = decayed(entry,at)
  if (feedback === 'good_fit') next = { ...next, positiveFeedback:next.positiveFeedback+1, preference:ema(next.preference,.75,.2), difficultySuitability:ema(next.difficultySuitability,.35,.12), evidence:next.evidence+2 }
  if (feedback === 'too_easy') next = { ...next, tooEasy:next.tooEasy+1, difficultySuitability:ema(next.difficultySuitability,.8,.28), evidence:next.evidence+2 }
  if (feedback === 'too_hard') next = { ...next, tooHard:next.tooHard+1, difficultySuitability:ema(next.difficultySuitability,-.8,.28), evidence:next.evidence+2 }
  if (feedback === 'discomfort') next = { ...next, discomfort:next.discomfort+1, lastDiscomfortAt:at, difficultySuitability:ema(next.difficultySuitability,-1,.42), completionReliability:ema(next.completionReliability,0,.28), evidence:next.evidence+3 }
  if (feedback === 'didnt_enjoy') next = { ...next, negativePreference:next.negativePreference+1, preference:ema(next.preference,-.9,.35), evidence:next.evidence+2 }
  return updateContext(next,context,at,value=>({
    ...value,
    preference:feedback==='good_fit'?ema(value.preference,.8,.25):feedback==='didnt_enjoy'?ema(value.preference,-.9,.38):value.preference,
    difficultySuitability:feedback==='too_easy'?ema(value.difficultySuitability,.8,.3):feedback==='too_hard'||feedback==='discomfort'?ema(value.difficultySuitability,-.9,.35):value.difficultySuitability,
    evidence:value.evidence+2,lastUpdatedAt:at,
  }))
}

const event = (type:LearningEvent['type'], label:string, at:string, exerciseId?:string, context?:LearningContext, feedback?:ExerciseFeedback):LearningEvent => ({ id:`learning_${at}_${type}_${exerciseId??'routine'}_${Math.random().toString(36).slice(2,7)}`, type,label,at,exerciseId,context,feedback })

function groupRows(session:WorkoutSession) {
  const rows = new Map<string,SessionExercise>()
  session.exercises.forEach(row=>rows.set(row.id,row))
  return rows
}

export function applyLearningFromSession(model:LearningModel, session:WorkoutSession):LearningModel {
  const at=nowIso(session.date)
  const entries={...model.exercises}
  const newEvents:LearningEvent[]=[]
  const rows=groupRows(session)
  const actions=session.actions??[]
  const exposed=new Map<string,number>()
  session.exercises.forEach(row=>exposed.set(row.id,row.plannedAppearances??1))
  actions.filter(action=>action.type==='swapped_out').forEach(action=>exposed.set(action.exerciseId,(exposed.get(action.exerciseId)??0)+1))
  exposed.forEach((count,id)=>{
    const previous=decayed(entries[id]??emptyLearningEntry(),at)
    entries[id]={...previous,exposures:previous.exposures+count,lastSelectedAt:at}
  })
  actions.forEach(action=>{
    entries[action.exerciseId]=updateAction(entries[action.exerciseId]??emptyLearningEntry(),action,at)
    const labels:Partial<Record<WorkoutAction['type'],string>>={skipped:'Skipped',swapped_out:'Swapped out',swapped_in:'Selected as replacement',easier:'Chose easier',harder:'Chose harder',prescription_down:'Reduced prescription',prescription_up:'Increased prescription'}
    if(labels[action.type])newEvents.push(event(action.type,labels[action.type]!,at,action.exerciseId,action.context))
  })
  rows.forEach((row,id)=>{
    let entry=entries[id]??emptyLearningEntry()
    if (!(actions.some(action=>action.exerciseId===id&&action.type==='completed'))) {
      const completed=row.completedAppearances??session.completedExerciseIds.filter(item=>item===id).length
      for(let i=0;i<completed;i+=1)entry=updateAction(entry,{id:`legacy_${i}`,type:'completed',exerciseId:id,occurrenceIndex:i,at},at)
    }
    if(row.feedback){entry=updateFeedback(entry,row.feedback,at,actions.find(action=>action.exerciseId===id)?.context);newEvents.push(event('exercise_feedback',feedbackLabel(row.feedback),at,id,undefined,row.feedback))}
    const completed=row.completedAppearances??session.completedExerciseIds.filter(item=>item===id).length
    const explicitlySuccessful=row.feedback==='good_fit'||row.feedback==='too_easy'
    const success=completed>0&&!['too_hard','discomfort'].includes(row.feedback??'')&&(explicitlySuccessful||['easy','good','unrated'].includes(session.rating))
    const performanceHistory=row.performance?[...(entry.performanceHistory??[]),{...row.performance,at,prescription:row.prescription}].slice(-8):(entry.performanceHistory??[])
    if(success)entry={...entry,successfulPerformances:entry.successfulPerformances+1,lastPerformance:row.performance??entry.lastPerformance,performanceHistory}
    else if(row.performance)entry={...entry,lastPerformance:row.performance,performanceHistory}
    entries[id]=entry
  })
  if(session.rating!=='unrated')newEvents.push(event('overall_rating',`Workout rated ${session.rating}`,at))
  const routineKey=`${session.goal}|${session.intention}|${session.balanceReport?.templateKey??'legacy'}`;const previousRoutine=model.routineContexts[routineKey]??{confidence:0,positive:0,negative:0,evidence:0,lastUpdatedAt:at,preferredMainCount:0,preferredSets:0,averageCompletionRate:0,averageDurationRatio:0,warmupAffinity:0,conditioningAffinity:0}
  const positiveRating=session.rating==='easy'||session.rating==='good';const negativeRating=session.rating==='hard'||session.rating==='brutal';const target=session.rating==='brutal'?-1:session.rating==='hard'?-.35:positiveRating ? .7 : 0
  const structure=session.planStructure
  const planned=session.exercises.reduce((sum,row)=>sum+(row.plannedAppearances??1),0);const completed=session.exercises.reduce((sum,row)=>sum+(row.completedAppearances??0),0)
  const completionRate=planned?completed/planned:0;const durationRatio=structure?.targetDurationMinutes?session.durationSeconds/(structure.targetDurationMinutes*60):1
  const sectionRate=(section:SessionExercise['section'])=>{const selected=session.exercises.filter(row=>row.section===section);const sectionPlanned=selected.reduce((sum,row)=>sum+(row.plannedAppearances??1),0);return sectionPlanned?selected.reduce((sum,row)=>sum+(row.completedAppearances??0),0)/sectionPlanned:0}
  const routine:RoutineLearningStat={
    confidence:session.rating==='unrated'?previousRoutine.confidence:ema(previousRoutine.confidence,target,.18),positive:previousRoutine.positive+(positiveRating?1:0),negative:previousRoutine.negative+(negativeRating?1:0),evidence:previousRoutine.evidence+(session.rating==='unrated'?0:1),lastUpdatedAt:at,
    preferredMainCount:positiveRating&&structure?(previousRoutine.preferredMainCount?smooth(previousRoutine.preferredMainCount,structure.mainExerciseCount,.25):structure.mainExerciseCount):previousRoutine.preferredMainCount??0,
    preferredSets:positiveRating&&structure?(previousRoutine.preferredSets?smooth(previousRoutine.preferredSets,structure.totalSets,.25):structure.totalSets):previousRoutine.preferredSets??0,
    averageCompletionRate:previousRoutine.evidence?ema(previousRoutine.averageCompletionRate??0,completionRate,.2):completionRate,
    averageDurationRatio:previousRoutine.evidence?smooth(previousRoutine.averageDurationRatio??0,durationRatio,.2):durationRatio,
    warmupAffinity:structure?.includeWarmup?ema(previousRoutine.warmupAffinity??0,positiveRating&&sectionRate('Prepare')>=.75?.8:negativeRating||sectionRate('Prepare')<.5?-.6:0,.2):previousRoutine.warmupAffinity??0,
    conditioningAffinity:structure?.includeConditioning?ema(previousRoutine.conditioningAffinity??0,positiveRating&&sectionRate('Condition')>=.75?.8:negativeRating||sectionRate('Condition')<.5?-.6:0,.2):previousRoutine.conditioningAffinity??0,
  }
  const routineContexts=Object.fromEntries(Object.entries({...model.routineContexts,[routineKey]:routine}).sort((a,b)=>Date.parse(b[1].lastUpdatedAt)-Date.parse(a[1].lastUpdatedAt)).slice(0,50))
  const next={...model,version:LEARNING_VERSION,exercises:entries,routineContexts,events:[...newEvents,...model.events].slice(0,MAX_LEARNING_EVENTS)}
  return refreshRecommendations(next,session)
}

function feedbackLabel(feedback:ExerciseFeedback){return({good_fit:'Good fit',too_easy:'Too easy',too_hard:'Too hard',discomfort:'Discomfort',didnt_enjoy:"Didn't enjoy"})[feedback]}
const allExercises=(state:Pick<AppState,'customExercises'>)=>[...exercises,...state.customExercises]

function recommendationFor(id:string,entry:ExerciseLearningEntry,state:Pick<AppState,'customExercises'|'profile'>,at:string):ProgressionRecommendation|null{
  const exercise=allExercises(state).find(item=>item.id===id)
  if(!exercise||entry.successfulPerformances<3||entry.lastDiscomfortAt&&Date.parse(at)-Date.parse(entry.lastDiscomfortAt)<30*86400000)return null
  if(entry.deferredUntil&&Date.parse(entry.deferredUntil)>Date.parse(at))return null
  const evidence=[`Completed successfully ${entry.successfulPerformances} times`,`${entry.positiveFeedback} positive ratings`,entry.tooEasy?`Marked too easy ${entry.tooEasy} times`:`No recent difficulty flags`]
  const harder=allExercises(state).filter(candidate=>candidate.pattern===exercise.pattern&&candidate.level>exercise.level&&candidate.equipment.every(eq=>eq==='none'||state.profile.equipment.includes(eq))).sort((a,b)=>a.level-b.level)[0]
  if(harder)return{id:`progress_${id}_variation_${entry.progressionEvidenceAt}`,exerciseId:id,category:'variation',status:'ready',title:`Try ${harder.name}`,evidence,createdAt:at,fromExerciseId:id,toExerciseId:harder.id}
  if(entry.lastPerformance?.load&&entry.lastPerformance.load>0){const increase=Math.max(entry.lastPerformance.loadUnit==='lbs'?2.5:1,Math.round(entry.lastPerformance.load*.05*2)/2);return{id:`progress_${id}_load_${entry.progressionEvidenceAt}`,exerciseId:id,category:'load',status:'ready',title:`Increase to ${entry.lastPerformance.load+increase} ${entry.lastPerformance.loadUnit??'kg'}`,evidence:[...evidence,`Last recorded load ${entry.lastPerformance.load} ${entry.lastPerformance.loadUnit??'kg'}`],createdAt:at,load:entry.lastPerformance.load+increase,loadUnit:entry.lastPerformance.loadUnit??'kg'}}
  const match=(entry.currentPrescription??exercise.prescription).match(/\d+/)
  if(!match)return null
  const current=Number(match[0]);const timed=/sec|min|hold/i.test(entry.currentPrescription??exercise.prescription);const next=current+(timed?5:2);const prescription=(entry.currentPrescription??exercise.prescription).replace(match[0],String(next))
  return{id:`progress_${id}_volume_${entry.progressionEvidenceAt}`,exerciseId:id,category:'volume',status:'ready',title:`Increase to ${prescription}`,evidence,createdAt:at,prescription,previousPrescription:entry.currentPrescription??exercise.prescription}
}

function refreshRecommendations(model:LearningModel,session:WorkoutSession):LearningModel{
  // The complete catalogue/profile-aware pass runs through getProgressionRecommendations.
  const touched=new Set(session.exercises.map(row=>row.id));const entries={...model.exercises}
  touched.forEach(id=>{const entry=entries[id];if(entry&&entry.successfulPerformances>=2&&entry.progressionStatus==='none')entries[id]={...entry,progressionStatus:entry.successfulPerformances>=3?'ready':'approaching'}})
  return{...model,exercises:entries}
}

export function getProgressionRecommendations(state:AppState){
  const at=new Date().toISOString();const existing=new Map(state.learningModel.recommendations.map(item=>[item.exerciseId,item]))
  return Object.entries(state.learningModel.exercises).flatMap(([id,entry])=>{
    const retained=existing.get(id)
    if(retained?.status==='accepted')return[retained]
    if(retained?.status==='kept'&&entry.evidence<=entry.progressionEvidenceAt+2)return[retained]
    if(retained?.status==='deferred'&&retained.availableAfter&&Date.parse(retained.availableAfter)>Date.parse(at))return[retained]
    const recommendation=recommendationFor(id,entry,state,at);return recommendation?[recommendation]:[]
  })
}

export function respondToProgression(state:AppState,recommendation:ProgressionRecommendation,response:'accept'|'keep'|'defer'):AppState{
  const at=new Date().toISOString();const entry=state.learningModel.exercises[recommendation.exerciseId]??emptyLearningEntry()
  const status:ProgressionRecommendation['status']=response==='accept'?'accepted':response==='keep'?'kept':'deferred';const updatedRecommendation:ProgressionRecommendation={...recommendation,status,availableAfter:response==='defer'?new Date(Date.now()+14*86400000).toISOString():undefined}
  const basePrescription=entry.currentPrescription??recommendation.previousPrescription??allExercises(state).find(exercise=>exercise.id===recommendation.exerciseId)?.prescription
  const loadPrescription=recommendation.category==='load'&&recommendation.load?`${recommendation.load} ${recommendation.loadUnit??'kg'} · ${basePrescription??''}`.trim():undefined
  const acceptedPrescription=recommendation.prescription??loadPrescription
  const updatedEntry:ExerciseLearningEntry={...entry,progressionStatus:status,progressionEvidenceAt:entry.evidence,deferredUntil:updatedRecommendation.availableAfter,
    previousPrescription:response==='accept'&&acceptedPrescription?basePrescription:entry.previousPrescription,
    currentPrescription:response==='accept'?(acceptedPrescription??entry.currentPrescription):entry.currentPrescription,
    previousExerciseId:response==='accept'&&recommendation.toExerciseId?recommendation.fromExerciseId:entry.previousExerciseId,
    currentExerciseId:response==='accept'&&recommendation.toExerciseId?recommendation.toExerciseId:entry.currentExerciseId}
  const type=response==='accept'?'progression_accepted':response==='keep'?'progression_kept':'progression_deferred'
  return{...state,learningModel:{...state.learningModel,exercises:{...state.learningModel.exercises,[recommendation.exerciseId]:updatedEntry},recommendations:[updatedRecommendation,...state.learningModel.recommendations.filter(item=>item.id!==recommendation.id)].slice(0,100),events:[event(type,`${response==='accept'?'Accepted':response==='keep'?'Kept current level for':'Deferred'} ${recommendation.title}`,at,recommendation.exerciseId),...state.learningModel.events].slice(0,MAX_LEARNING_EVENTS)}}
}

export function revertProgression(state:AppState,recommendation:ProgressionRecommendation):AppState{
  if(recommendation.status!=='accepted')return state
  const at=new Date().toISOString();const entry=state.learningModel.exercises[recommendation.exerciseId]
  if(!entry)return state
  const deferredUntil=new Date(Date.now()+14*86400000).toISOString()
  const restored:ExerciseLearningEntry={...entry,progressionStatus:'deferred',deferredUntil,currentPrescription:entry.previousPrescription,currentExerciseId:undefined,previousPrescription:undefined,previousExerciseId:undefined}
  return{...state,learningModel:{...state.learningModel,exercises:{...state.learningModel.exercises,[recommendation.exerciseId]:restored},recommendations:state.learningModel.recommendations.filter(item=>item.id!==recommendation.id),events:[event('progression_reverted',`Reverted ${recommendation.title}`,at,recommendation.exerciseId),...state.learningModel.events].slice(0,MAX_LEARNING_EVENTS)}}
}

export function confidenceLabel(evidence:number){return evidence>=12?'Established':evidence>=4?'Learning':'New'}

export function recordProfileSignal(state:AppState,exerciseId:string,type:'favourited'|'avoided',active:boolean):AppState{
  const at=new Date().toISOString();const previous=state.learningModel.exercises[exerciseId]??emptyLearningEntry()
  const preference=type==='favourited'?(active?ema(previous.preference,1,.5):ema(previous.preference,0,.2)):(active?ema(previous.preference,-1,.35):previous.preference)
  const entry={...previous,preference,evidence:previous.evidence+1}
  const label=`${active?'':'Removed '}${type==='favourited'?'Favourite':'Avoid'}`
  return{...state,learningModel:{...state.learningModel,exercises:{...state.learningModel.exercises,[exerciseId]:entry},events:[event(type,label,at,exerciseId),...state.learningModel.events].slice(0,MAX_LEARNING_EVENTS)}}
}
