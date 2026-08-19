import { defaultState } from '../storage/state'
import type { WorkoutSession } from './types'
import { getDashboardStats } from './stats'

const session=(id:string,date:Date,durationSeconds=60,completedExerciseIds=['x001']):WorkoutSession=>({id,planName:id,date:date.toISOString(),durationSeconds,intention:'train',goal:'general',rating:'good',completedExerciseIds,exercises:[],focus:[],areaLoadBefore:{}})

describe('dashboard statistics',()=>{
  afterEach(()=>vi.useRealTimers())

  it('calculates the rolling seven-day window, unique active days, minutes and completions',()=>{
    vi.useFakeTimers();vi.setSystemTime(new Date(2026,7,19,12))
    const history=[
      session('today-a',new Date(2026,7,19,8),90,['x001','u1']),
      session('today-b',new Date(2026,7,19,18),30,['w1']),
      session('six-days',new Date(2026,7,13,1),120,['m1']),
      session('outside',new Date(2026,7,12,23,59),600,['c1']),
    ]
    expect(getDashboardStats({...defaultState,history})).toEqual({sessions:4,activeDays:2,minutes:4,completed:5,streak:1})
  })

  it('counts a streak ending yesterday and stops at the first missing local day',()=>{
    vi.useFakeTimers();vi.setSystemTime(new Date(2026,7,19,12))
    const history=[18,17,15].map(day=>session(String(day),new Date(2026,7,day,10)))
    expect(getDashboardStats({...defaultState,history}).streak).toBe(2)
  })

  it('uses local calendar days across the daylight-saving boundary',()=>{
    vi.useFakeTimers();vi.setSystemTime(new Date(2026,2,30,12))
    const history=[29,28,27].map(day=>session(String(day),new Date(2026,2,day,12)))
    expect(getDashboardStats({...defaultState,history}).streak).toBe(3)
    expect(getDashboardStats({...defaultState,history}).activeDays).toBe(3)
  })
})
