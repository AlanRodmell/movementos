import { defaultState, downloadBackup, downloadHistoryCsv, loadState, normaliseState, saveState } from './state'
import type { WorkoutSession } from '../domain/types'

const readBlob=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsText(blob)})

describe('persistence resilience',()=>{
  afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals()})

  it('falls back to defaults when storage reads fail and reports failed quota writes without throwing',()=>{
    vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new DOMException('denied','SecurityError')})
    expect(loadState()).toEqual(defaultState)
    vi.restoreAllMocks()
    vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new DOMException('full','QuotaExceededError')})
    expect(()=>saveState(defaultState)).not.toThrow()
    expect(saveState(defaultState)).toBe(false)
  })

  it('sanitises malformed nested values and clamps imported collection sizes',()=>{
    const raw={
      profile:{name:`Bad\u0000Name${'x'.repeat(100)}`,equipment:['none','rocket'],avoidList:['ok','bad id!',...Array.from({length:1100},(_,i)=>`id_${i}`)]},
      issues:Array.from({length:300},(_,i)=>({id:`issue_${i}`,area:'unknown',severity:'unknown',side:'unknown',note:'x'.repeat(800)})),
      customExercises:Array.from({length:300},(_,i)=>({id:`u_custom_${i}`,name:'Custom',durationSeconds:99_999,equipment:['rocket'],primaryMuscles:['unknown']})),
      workoutHistory:Array.from({length:300},(_,i)=>({id:`session_${i}`,date:'not a date',exercises:[null,{id:'x001'}]})),
      savedWorkouts:Array.from({length:120},(_,i)=>({id:`plan_${i}`,groups:[{heading:'Unknown',items:[{id:'x001',secs:99_999}]}]})),
    }
    const state=normaliseState(raw)
    expect(state.profile.name).not.toContain('\u0000')
    expect(state.profile.name).toHaveLength(80)
    expect(state.profile.equipment).toEqual(['none'])
    expect(state.profile.avoidList).toHaveLength(1000)
    expect(state.issues).toHaveLength(250)
    expect(state.issues[0]).toMatchObject({area:'lower_back',severity:'mild',side:'bilateral'})
    expect(state.issues[0].note).toHaveLength(500)
    expect(state.customExercises).toHaveLength(250)
    expect(state.customExercises[0]).toMatchObject({durationSeconds:3600,equipment:['none'],primaryMuscles:['full_body']})
    expect(state.history).toHaveLength(250)
    expect(state.history[0].date).toBe(new Date(0).toISOString())
    expect(state.savedPlans).toHaveLength(100)
    expect(state.savedPlans[0].exercises[0]).toMatchObject({section:'Main work',durationSeconds:3600})
  })

  it('downloads a complete JSON backup with the expected filename and MIME type',async()=>{
    let blob:Blob|undefined
    vi.stubGlobal('URL',{...URL,createObjectURL:vi.fn((value:Blob)=>{blob=value;return'blob:backup'}),revokeObjectURL:vi.fn()})
    const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>undefined)
    downloadBackup({...defaultState,profile:{...defaultState.profile,name:'Alex'}})
    expect(click).toHaveBeenCalledOnce()
    expect(blob?.type).toBe('application/json;charset=utf-8')
    const contents=JSON.parse(await readBlob(blob!))
    expect(contents).toMatchObject({schemaVersion:11,profile:{name:'Alex'}})
    expect(contents).toHaveProperty('learningModel')
  })

  it('escapes spreadsheet formulas and quotes in CSV exports',async()=>{
    let blob:Blob|undefined
    vi.stubGlobal('URL',{...URL,createObjectURL:vi.fn((value:Blob)=>{blob=value;return'blob:csv'}),revokeObjectURL:vi.fn()})
    vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>undefined)
    const session:WorkoutSession={id:'csv',planName:'=HYPERLINK("bad")',date:'2026-08-19T10:00:00.000Z',durationSeconds:60,intention:'train',goal:'general',rating:'good',completedExerciseIds:['x001'],exercises:[{id:'x001',name:'+Formula',prescription:'@cmd',durationSeconds:30}],focus:[],areaLoadBefore:{}}
    downloadHistoryCsv({...defaultState,history:[session]})
    expect(blob?.type).toBe('text/csv;charset=utf-8')
    const csv=await readBlob(blob!)
    expect(csv).toContain(`"'=HYPERLINK(""bad"")"`)
    expect(csv).toContain(`'+Formula: @cmd`)
    expect(csv.split('\n')).toHaveLength(2)
  })
})
