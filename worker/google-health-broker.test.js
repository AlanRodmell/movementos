// @vitest-environment node
import broker from './google-health-broker.js'

const env={
  ALLOWED_ORIGINS:'https://alanrodmell.github.io,http://localhost:5173',
  GOOGLE_HEALTH_CLIENT_ID:'client.apps.googleusercontent.com',
  GOOGLE_HEALTH_CLIENT_SECRET:'server-only-secret',
  GOOGLE_HEALTH_REDIRECT_URI:'https://alanrodmell.github.io/movementos/oauth-callback.html',
  TOKEN_ENCRYPTION_SECRET:'test-encryption-secret-with-sufficient-entropy',
}
const origin='https://alanrodmell.github.io'
const post=(path,body,requestOrigin=origin)=>new Request(`https://broker.example${path}`,{method:'POST',headers:{Origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify(body)})
const workout={dataSource:{recordingMethod:'ACTIVELY_MEASURED'},exercise:{interval:{startTime:'2026-08-26T12:00:00.000Z',startUtcOffset:'3600s',endTime:'2026-08-26T12:30:00.000Z',endUtcOffset:'3600s'},exerciseType:'STRENGTH_TRAINING',displayName:'Lunch strength',activeDuration:'1800s',metricsSummary:{},notes:'Completed in Movement OS'}}

afterEach(()=>vi.restoreAllMocks())

it('exchanges a PKCE code and makes only the write-only Health request',async()=>{
  const fetchMock=vi.spyOn(globalThis,'fetch').mockImplementation(async(url,init)=>{
    if(String(url).includes('/token'))return new Response(JSON.stringify({access_token:'access',refresh_token:'refresh',expires_in:3600}),{status:200,headers:{'Content-Type':'application/json'}})
    expect(String(url)).toBe('https://health.googleapis.com/v4/users/me/dataTypes/exercise/dataPoints')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer access')
    expect(JSON.parse(init.body)).toEqual(workout)
    return new Response(JSON.stringify({done:true}),{status:200,headers:{'Content-Type':'application/json'}})
  })
  const exchange=await broker.fetch(post('/oauth/exchange',{code:'code',codeVerifier:'verifier',redirectUri:env.GOOGLE_HEALTH_REDIRECT_URI}),env)
  expect(exchange.status).toBe(200)
  const {connectionToken}=await exchange.json()
  expect(connectionToken).toEqual(expect.any(String))
  const write=await broker.fetch(post('/workouts',{connectionToken,workout}),env)
  expect(write.status).toBe(200)
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(fetchMock.mock.calls.every(([,init])=>init.method==='POST')).toBe(true)
})

it('refreshes an expired access token immediately before writing',async()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-08-26T12:00:00Z'))
  const fetchMock=vi.spyOn(globalThis,'fetch').mockImplementation(async(url,init)=>{
    if(String(url).includes('/token')){
      const params=new URLSearchParams(init.body)
      return new Response(JSON.stringify(params.get('grant_type')==='authorization_code'?{access_token:'first',refresh_token:'refresh',expires_in:60}:{access_token:'renewed',expires_in:3600}),{status:200,headers:{'Content-Type':'application/json'}})
    }
    expect(init.headers.Authorization).toBe('Bearer renewed')
    return new Response(JSON.stringify({done:true}),{status:200,headers:{'Content-Type':'application/json'}})
  })
  const exchange=await broker.fetch(post('/oauth/exchange',{code:'code',codeVerifier:'verifier',redirectUri:env.GOOGLE_HEALTH_REDIRECT_URI}),env)
  const {connectionToken}=await exchange.json()
  vi.advanceTimersByTime(61_000)
  const write=await broker.fetch(post('/workouts',{connectionToken,workout}),env)
  expect(write.status).toBe(200)
  expect(fetchMock).toHaveBeenCalledTimes(3)
  vi.useRealTimers()
})

it('rejects untrusted browser origins before handling credentials',async()=>{
  const fetchMock=vi.spyOn(globalThis,'fetch')
  const response=await broker.fetch(post('/workouts',{connectionToken:'anything',workout},'https://attacker.example'),env)
  expect(response.status).toBe(403)
  expect(fetchMock).not.toHaveBeenCalled()
})

it('fails closed when server-only secrets have not been configured',async()=>{
  const response=await broker.fetch(post('/workouts',{connectionToken:'anything',workout}),{...env,TOKEN_ENCRYPTION_SECRET:'REPLACE_ME'})
  expect(response.status).toBe(503)
  await expect(response.json()).resolves.toEqual({error:'broker_not_configured'})
})
