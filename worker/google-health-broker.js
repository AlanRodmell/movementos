const tokenEndpoint = 'https://oauth2.googleapis.com/token'
const revokeEndpoint = 'https://oauth2.googleapis.com/revoke'
const workoutEndpoint = 'https://health.googleapis.com/v4/users/me/dataTypes/exercise/dataPoints'
const allowedExerciseTypes = new Set(['STRENGTH_TRAINING', 'CIRCUIT_TRAINING', 'WORKOUT', 'OTHER'])

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers:{ 'Content-Type':'application/json', 'Cache-Control':'no-store', ...headers } })
const bytesToBase64Url = (bytes) => {
  let binary = ''
  bytes.forEach(byte => { binary += String.fromCharCode(byte) })
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}
const base64UrlToBytes = (value) => {
  const binary = atob(value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4))
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}
const encryptionKey = async (secret) => crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret)), 'AES-GCM', false, ['encrypt', 'decrypt'])
const seal = async (value, secret) => {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name:'AES-GCM', iv }, await encryptionKey(secret), new TextEncoder().encode(JSON.stringify(value))))
  const combined = new Uint8Array(iv.length + encrypted.length)
  combined.set(iv); combined.set(encrypted, iv.length)
  return bytesToBase64Url(combined)
}
const unseal = async (value, secret) => {
  const combined = base64UrlToBytes(value)
  if (combined.length < 29) throw new Error('invalid_token')
  const decrypted = await crypto.subtle.decrypt({ name:'AES-GCM', iv:combined.slice(0, 12) }, await encryptionKey(secret), combined.slice(12))
  return JSON.parse(new TextDecoder().decode(decrypted))
}

const allowedOrigin = (request, env) => {
  const origin = request.headers.get('Origin') || ''
  const origins = String(env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean)
  return origins.includes(origin) ? origin : null
}
const isConfigured = (env) => typeof env.GOOGLE_HEALTH_CLIENT_ID === 'string' && env.GOOGLE_HEALTH_CLIENT_ID.endsWith('.apps.googleusercontent.com') && typeof env.GOOGLE_HEALTH_CLIENT_SECRET === 'string' && env.GOOGLE_HEALTH_CLIENT_SECRET.length >= 10 && typeof env.GOOGLE_HEALTH_REDIRECT_URI === 'string' && env.GOOGLE_HEALTH_REDIRECT_URI.startsWith('https://') && typeof env.TOKEN_ENCRYPTION_SECRET === 'string' && env.TOKEN_ENCRYPTION_SECRET.length >= 32
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin':origin,
  'Access-Control-Allow-Headers':'Content-Type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Access-Control-Max-Age':'86400',
  'Vary':'Origin',
})
const readBody = async (request) => {
  const text = await request.text()
  if (text.length > 24_000) throw new Error('request_too_large')
  return JSON.parse(text)
}
const tokenRequest = async (parameters) => {
  const response = await fetch(tokenEndpoint, { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body:new URLSearchParams(parameters) })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || typeof body.access_token !== 'string') throw Object.assign(new Error('oauth_failed'), { status:401 })
  return body
}
const tokenBundle = (body, existingRefreshToken) => ({
  accessToken:body.access_token,
  refreshToken:body.refresh_token || existingRefreshToken,
  expiresAt:Date.now() + Math.max(60, Number(body.expires_in) || 3600) * 1000,
})
const refreshIfNeeded = async (tokens, env) => {
  if (typeof tokens.accessToken === 'string' && Number(tokens.expiresAt) > Date.now() + 60_000) return tokens
  if (typeof tokens.refreshToken !== 'string') throw Object.assign(new Error('authorization_expired'), { status:401 })
  const refreshed = await tokenRequest({ client_id:env.GOOGLE_HEALTH_CLIENT_ID, client_secret:env.GOOGLE_HEALTH_CLIENT_SECRET, refresh_token:tokens.refreshToken, grant_type:'refresh_token' })
  return tokenBundle(refreshed, tokens.refreshToken)
}
const validTime = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value))
const sanitiseWorkout = (workout) => {
  const exercise = workout?.exercise
  const interval = exercise?.interval
  if (workout?.dataSource?.recordingMethod !== 'ACTIVELY_MEASURED' || !exercise || !interval || !allowedExerciseTypes.has(exercise.exerciseType)) throw new Error('invalid_workout')
  if (!validTime(interval.startTime) || !validTime(interval.endTime) || Date.parse(interval.startTime) > Date.parse(interval.endTime)) throw new Error('invalid_workout')
  if (!/^-?\d+s$/.test(interval.startUtcOffset) || !/^-?\d+s$/.test(interval.endUtcOffset) || !/^\d+s$/.test(exercise.activeDuration)) throw new Error('invalid_workout')
  return {
    dataSource:{ recordingMethod:'ACTIVELY_MEASURED' },
    exercise:{
      interval:{ startTime:interval.startTime, startUtcOffset:interval.startUtcOffset, endTime:interval.endTime, endUtcOffset:interval.endUtcOffset },
      exerciseType:exercise.exerciseType,
      displayName:String(exercise.displayName || 'Movement OS workout').slice(0, 120),
      activeDuration:exercise.activeDuration,
      metricsSummary:{},
      notes:String(exercise.notes || 'Completed in Movement OS').slice(0, 500),
    },
  }
}

const exchange = async (request, env) => {
  const body = await readBody(request)
  if (typeof body.code !== 'string' || typeof body.codeVerifier !== 'string' || body.redirectUri !== env.GOOGLE_HEALTH_REDIRECT_URI) return json({ error:'invalid_oauth_request' }, 400)
  const token = await tokenRequest({ client_id:env.GOOGLE_HEALTH_CLIENT_ID, client_secret:env.GOOGLE_HEALTH_CLIENT_SECRET, code:body.code, code_verifier:body.codeVerifier, redirect_uri:body.redirectUri, grant_type:'authorization_code' })
  if (typeof token.refresh_token !== 'string') return json({ error:'refresh_token_missing' }, 401)
  return json({ connectionToken:await seal(tokenBundle(token), env.TOKEN_ENCRYPTION_SECRET) })
}

const createWorkout = async (request, env) => {
  const body = await readBody(request)
  if (typeof body.connectionToken !== 'string') return json({ error:'invalid_connection' }, 401)
  let tokens
  try { tokens = await unseal(body.connectionToken, env.TOKEN_ENCRYPTION_SECRET); tokens = await refreshIfNeeded(tokens, env) } catch { return json({ error:'authorization_expired' }, 401) }
  const workout = sanitiseWorkout(body.workout)
  const response = await fetch(workoutEndpoint, { method:'POST', headers:{ Authorization:`Bearer ${tokens.accessToken}`, 'Content-Type':'application/json' }, body:JSON.stringify(workout) })
  if (response.status === 401) return json({ error:'authorization_expired' }, 401)
  if (!response.ok) return json({ error:'health_write_failed' }, 502)
  return json({ connectionToken:await seal(tokens, env.TOKEN_ENCRYPTION_SECRET) })
}

const revoke = async (request, env) => {
  const body = await readBody(request)
  if (typeof body.connectionToken !== 'string') return json({ ok:true })
  try {
    const tokens = await unseal(body.connectionToken, env.TOKEN_ENCRYPTION_SECRET)
    const token = tokens.refreshToken || tokens.accessToken
    if (token) await fetch(revokeEndpoint, { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body:new URLSearchParams({ token }) })
  } catch { /* The browser still clears its opaque credential. */ }
  return json({ ok:true })
}

export default {
  async fetch(request, env) {
    const origin = allowedOrigin(request, env)
    if (!origin) return json({ error:'origin_not_allowed' }, 403)
    const cors = corsHeaders(origin)
    if (!isConfigured(env)) return json({ error:'broker_not_configured' }, 503, cors)
    if (request.method === 'OPTIONS') return new Response(null, { status:204, headers:cors })
    if (request.method !== 'POST') return json({ error:'method_not_allowed' }, 405, cors)
    try {
      const path = new URL(request.url).pathname.replace(/\/$/, '')
      const response = path === '/oauth/exchange' ? await exchange(request, env) : path === '/workouts' ? await createWorkout(request, env) : path === '/oauth/revoke' ? await revoke(request, env) : json({ error:'not_found' }, 404)
      const headers = new Headers(response.headers)
      Object.entries(cors).forEach(([key, value]) => headers.set(key, value))
      return new Response(response.body, { status:response.status, headers })
    } catch (error) {
      const status = error?.status === 401 ? 401 : error?.message === 'invalid_workout' || error?.message === 'request_too_large' ? 400 : 500
      return json({ error:status === 401 ? 'authorization_expired' : status === 400 ? 'invalid_request' : 'broker_error' }, status, cors)
    }
  },
}
