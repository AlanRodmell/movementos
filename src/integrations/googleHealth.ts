import type { WorkoutSession } from '../domain/types'
import { GOOGLE_HEALTH_BROKER_URL, GOOGLE_HEALTH_CLIENT_ID } from './googleHealthConfig'

export const GOOGLE_HEALTH_SCOPE = 'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.writeonly'
export const GOOGLE_HEALTH_CONNECTION_KEY = 'movementos:google-health'
export const GOOGLE_HEALTH_OAUTH_KEY = 'movementos:google-health-oauth'
export const GOOGLE_HEALTH_RESULT_KEY = 'movementos:google-health-result'

const callbackMarker = 'google-health-callback'

export interface GoogleHealthConnection {
  connectionToken: string
  connectedAt: string
}

export interface GoogleHealthStatus {
  state: 'idle' | 'syncing' | 'success' | 'failed'
  message: string
  sessionId?: string
}

interface GoogleHealthCallbackResult {
  ok: boolean
  message: string
}

export type GoogleHealthExerciseType = 'STRENGTH_TRAINING' | 'CIRCUIT_TRAINING' | 'WORKOUT' | 'OTHER'

export interface GoogleHealthWorkout {
  dataSource: { recordingMethod: 'ACTIVELY_MEASURED' }
  exercise: {
    interval: {
      startTime: string
      startUtcOffset: string
      endTime: string
      endUtcOffset: string
    }
    exerciseType: GoogleHealthExerciseType
    displayName: string
    activeDuration: string
    metricsSummary: Record<string, never>
    notes: string
  }
}

const safeJson = <T>(value: string | null): T | null => {
  if (!value) return null
  try { return JSON.parse(value) as T } catch { return null }
}

const trimBrokerUrl = () => GOOGLE_HEALTH_BROKER_URL.replace(/\/$/, '')

export const isGoogleHealthConfigured = () => {
  if (GOOGLE_HEALTH_CLIENT_ID.includes('REPLACE_WITH_') || GOOGLE_HEALTH_BROKER_URL.includes('REPLACE_WITH_')) return false
  try { return new URL(GOOGLE_HEALTH_BROKER_URL).protocol === 'https:' } catch { return false }
}

export const getGoogleHealthRedirectUri = () => new URL('oauth-callback.html', document.baseURI).href

export const loadGoogleHealthConnection = (): GoogleHealthConnection | null => {
  const connection = safeJson<GoogleHealthConnection>(localStorage.getItem(GOOGLE_HEALTH_CONNECTION_KEY))
  return connection && typeof connection.connectionToken === 'string' && connection.connectionToken.length > 20 && typeof connection.connectedAt === 'string' ? connection : null
}

export const saveGoogleHealthConnection = (connection: GoogleHealthConnection) => {
  try { localStorage.setItem(GOOGLE_HEALTH_CONNECTION_KEY, JSON.stringify(connection)); return true } catch { return false }
}

export const clearGoogleHealthConnection = () => {
  try { localStorage.removeItem(GOOGLE_HEALTH_CONNECTION_KEY) } catch { /* Storage can be unavailable in privacy modes. */ }
}

const base64Url = (bytes: Uint8Array) => {
  let binary = ''
  bytes.forEach(byte => { binary += String.fromCharCode(byte) })
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

const randomValue = (length = 32) => {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return base64Url(bytes)
}

const createCodeChallenge = async (verifier: string) => base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))))

export const beginGoogleHealthConnection = async () => {
  if (!isGoogleHealthConfigured()) throw new Error('Google Health setup is incomplete.')
  const state = randomValue()
  const verifier = randomValue(64)
  const redirectUri = getGoogleHealthRedirectUri()
  sessionStorage.setItem(GOOGLE_HEALTH_OAUTH_KEY, JSON.stringify({ state, verifier, redirectUri, brokerUrl:trimBrokerUrl(), createdAt:Date.now() }))
  const authorization = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authorization.search = new URLSearchParams({
    client_id:GOOGLE_HEALTH_CLIENT_ID,
    redirect_uri:redirectUri,
    response_type:'code',
    access_type:'offline',
    prompt:'consent',
    scope:GOOGLE_HEALTH_SCOPE,
    state,
    code_challenge:await createCodeChallenge(verifier),
    code_challenge_method:'S256',
  }).toString()
  window.location.assign(authorization.toString())
}

export const consumeGoogleHealthCallbackResult = (): GoogleHealthCallbackResult | null => {
  const url = new URL(window.location.href)
  if (!url.searchParams.has(callbackMarker)) return null
  url.searchParams.delete(callbackMarker)
  window.history.replaceState({}, '', url)
  const result = safeJson<GoogleHealthCallbackResult>(sessionStorage.getItem(GOOGLE_HEALTH_RESULT_KEY))
  sessionStorage.removeItem(GOOGLE_HEALTH_RESULT_KEY)
  return result && typeof result.ok === 'boolean' && typeof result.message === 'string' ? result : { ok:false, message:'Google Health connection could not be completed.' }
}

export const googleHealthExerciseType = (session: WorkoutSession): GoogleHealthExerciseType => {
  if (session.intention === 'recover' || session.goal === 'mobility') return 'OTHER'
  if (session.goal === 'strength' || session.goal === 'muscle') return 'STRENGTH_TRAINING'
  if (session.goal === 'endurance') return 'CIRCUIT_TRAINING'
  return 'WORKOUT'
}

export const utcOffsetSeconds = (date: Date) => `${-date.getTimezoneOffset() * 60}s`

export const buildGoogleHealthWorkout = (session: WorkoutSession, startedAt: number): GoogleHealthWorkout => {
  const start = new Date(startedAt)
  const end = new Date(session.date)
  const exerciseType = googleHealthExerciseType(session)
  return {
    dataSource:{ recordingMethod:'ACTIVELY_MEASURED' },
    exercise:{
      interval:{ startTime:start.toISOString(), startUtcOffset:utcOffsetSeconds(start), endTime:end.toISOString(), endUtcOffset:utcOffsetSeconds(end) },
      exerciseType,
      displayName:exerciseType === 'OTHER' ? `Movement OS recovery · ${session.planName}`.slice(0,120) : session.planName.slice(0,120),
      activeDuration:`${Math.max(1, Math.round(session.durationSeconds))}s`,
      metricsSummary:{},
      notes:`Completed in Movement OS · ${session.planName}`.slice(0,500),
    },
  }
}

const brokerRequest = async (path: string, body: unknown) => {
  const response = await fetch(`${trimBrokerUrl()}${path}`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body) })
  const result = await response.json().catch(() => ({})) as { connectionToken?:unknown; error?:unknown }
  if (!response.ok) {
    const error = typeof result.error === 'string' ? result.error : 'request_failed'
    throw Object.assign(new Error(error), { status:response.status })
  }
  return result
}

export const syncWorkoutToGoogleHealth = async (connection: GoogleHealthConnection, session: WorkoutSession, startedAt: number): Promise<{ connection: GoogleHealthConnection | null; status: GoogleHealthStatus }> => {
  try {
    const result = await brokerRequest('/workouts', { connectionToken:connection.connectionToken, workout:buildGoogleHealthWorkout(session, startedAt) })
    const next = typeof result.connectionToken === 'string' ? { ...connection, connectionToken:result.connectionToken } : connection
    saveGoogleHealthConnection(next)
    return { connection:next, status:{ state:'success', message:'Workout sent to Google Health.', sessionId:session.id } }
  } catch (error) {
    if (typeof error === 'object' && error && 'status' in error && error.status === 401) {
      clearGoogleHealthConnection()
      return { connection:null, status:{ state:'failed', message:'Google Health needs to be reconnected.', sessionId:session.id } }
    }
    return { connection, status:{ state:'failed', message:'Workout saved here, but could not be sent to Google Health.', sessionId:session.id } }
  }
}

export const disconnectGoogleHealth = async (connection: GoogleHealthConnection | null) => {
  clearGoogleHealthConnection()
  try { if (connection && isGoogleHealthConfigured()) await brokerRequest('/oauth/revoke', { connectionToken:connection.connectionToken }) } catch { /* Local disconnect must always succeed. */ }
}
