import type { WorkoutSession } from '../domain/types'
import { GOOGLE_HEALTH_CONNECTION_KEY, buildGoogleHealthWorkout, clearGoogleHealthConnection, googleHealthExerciseType, loadGoogleHealthConnection, saveGoogleHealthConnection, syncWorkoutToGoogleHealth, utcOffsetSeconds } from './googleHealth'

const session = (overrides: Partial<WorkoutSession> = {}): WorkoutSession => ({
  id:'session_1',
  planName:'Lunch strength',
  date:'2026-08-26T12:30:00.000Z',
  durationSeconds:1800,
  intention:'train',
  goal:'strength',
  rating:'good',
  completedExerciseIds:['x001'],
  exercises:[],
  focus:['full_body'],
  areaLoadBefore:{},
  ...overrides,
})
beforeEach(()=>localStorage.clear())
afterEach(()=>vi.restoreAllMocks())

it('maps Movement OS goals onto the approved Google Health categories',()=>{
  expect(googleHealthExerciseType(session({goal:'strength'}))).toBe('STRENGTH_TRAINING')
  expect(googleHealthExerciseType(session({goal:'muscle'}))).toBe('STRENGTH_TRAINING')
  expect(googleHealthExerciseType(session({goal:'endurance'}))).toBe('CIRCUIT_TRAINING')
  expect(googleHealthExerciseType(session({goal:'general'}))).toBe('WORKOUT')
  expect(googleHealthExerciseType(session({intention:'recover',goal:'mobility'}))).toBe('OTHER')
})

it('reuses the stored session timing without inventing health metrics',()=>{
  const start=Date.parse('2026-08-26T12:00:00.000Z')
  const workout=buildGoogleHealthWorkout(session(),start)
  expect(workout).toMatchObject({
    dataSource:{recordingMethod:'ACTIVELY_MEASURED'},
    exercise:{
      interval:{startTime:'2026-08-26T12:00:00.000Z',endTime:'2026-08-26T12:30:00.000Z'},
      exerciseType:'STRENGTH_TRAINING',
      displayName:'Lunch strength',
      activeDuration:'1800s',
      metricsSummary:{},
    },
  })
  expect(workout.exercise.interval.startUtcOffset).toBe(utcOffsetSeconds(new Date(start)))
  expect(workout.exercise.notes).toContain('Lunch strength')
})

it('uses OTHER and keeps a descriptive name for mixed recovery sessions',()=>{
  const workout=buildGoogleHealthWorkout(session({intention:'recover',goal:'mobility',planName:'Hips and back reset'}),Date.parse('2026-08-26T12:00:00.000Z'))
  expect(workout.exercise.exerciseType).toBe('OTHER')
  expect(workout.exercise.displayName).toBe('Movement OS recovery · Hips and back reset')
})

it('stores only the opaque connection in the app localStorage pattern',()=>{
  const connection={connectionToken:'opaque-encrypted-connection-token',connectedAt:'2026-08-26T12:00:00.000Z'}
  expect(saveGoogleHealthConnection(connection)).toBe(true)
  expect(loadGoogleHealthConnection()).toEqual(connection)
  expect(localStorage.getItem(GOOGLE_HEALTH_CONNECTION_KEY)).not.toContain('access_token')
  clearGoogleHealthConnection()
  expect(loadGoogleHealthConnection()).toBeNull()
})

it('posts a completed workout and rotates the opaque connection token',async()=>{
  const fetchMock=vi.fn().mockResolvedValue({ok:true,status:200,json:async()=>({connectionToken:'rotated-opaque-connection-token'})})
  vi.stubGlobal('fetch',fetchMock)
  const connection={connectionToken:'original-opaque-connection-token',connectedAt:'2026-08-26T12:00:00.000Z'}
  const result=await syncWorkoutToGoogleHealth(connection,session(),Date.parse('2026-08-26T12:00:00.000Z'))
  expect(result.status.state).toBe('success')
  expect(result.connection?.connectionToken).toBe('rotated-opaque-connection-token')
  const [,request]=fetchMock.mock.calls[0]
  expect(request.method).toBe('POST')
  expect(JSON.parse(request.body)).toMatchObject({connectionToken:connection.connectionToken,workout:{exercise:{exerciseType:'STRENGTH_TRAINING'}}})
})

it('never throws into workout completion when the write fails',async()=>{
  const fetchMock=vi.fn().mockRejectedValue(new TypeError('offline'))
  vi.stubGlobal('fetch',fetchMock)
  const connection={connectionToken:'original-opaque-connection-token',connectedAt:'2026-08-26T12:00:00.000Z'}
  await expect(syncWorkoutToGoogleHealth(connection,session(),Date.parse('2026-08-26T12:00:00.000Z'))).resolves.toMatchObject({connection,status:{state:'failed'}})
})

it('clears an unusable connection when silent refresh is rejected',async()=>{
  const connection={connectionToken:'original-opaque-connection-token',connectedAt:'2026-08-26T12:00:00.000Z'}
  saveGoogleHealthConnection(connection)
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:401,json:async()=>({error:'authorization_expired'})}))
  const result=await syncWorkoutToGoogleHealth(connection,session(),Date.parse('2026-08-26T12:00:00.000Z'))
  expect(result.connection).toBeNull()
  expect(result.status.message).toMatch(/reconnected/i)
  expect(loadGoogleHealthConnection()).toBeNull()
})
