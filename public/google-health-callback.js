(() => {
  'use strict'
  const oauthKey = 'movementos:google-health-oauth'
  const connectionKey = 'movementos:google-health'
  const resultKey = 'movementos:google-health-result'
  const status = document.getElementById('status')
  const returnToApp = (result) => {
    try { sessionStorage.setItem(resultKey, JSON.stringify(result)) } catch { /* The app still returns safely. */ }
    const appUrl = new URL('./', window.location.href)
    appUrl.search = 'google-health-callback=1'
    window.location.replace(appUrl)
  }
  const fail = (message) => {
    if (status) status.textContent = message
    window.setTimeout(() => returnToApp({ ok:false, message }), 250)
  }
  const run = async () => {
    const query = new URLSearchParams(window.location.search)
    let pending
    try { pending = JSON.parse(sessionStorage.getItem(oauthKey) || 'null') } catch { pending = null }
    const code = query.get('code')
    const returnedState = query.get('state')
    const oauthError = query.get('error')
    if (oauthError) return fail(oauthError === 'access_denied' ? 'Google Health connection was cancelled.' : 'Google Health did not authorize the connection.')
    if (!pending || !code || !returnedState || returnedState !== pending.state || Date.now() - pending.createdAt > 10 * 60 * 1000) return fail('The secure Google Health connection expired. Please try again.')
    try {
      const response = await fetch(`${String(pending.brokerUrl).replace(/\/$/, '')}/oauth/exchange`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ code, codeVerifier:pending.verifier, redirectUri:pending.redirectUri }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || typeof result.connectionToken !== 'string') throw new Error('exchange_failed')
      localStorage.setItem(connectionKey, JSON.stringify({ connectionToken:result.connectionToken, connectedAt:new Date().toISOString() }))
      sessionStorage.removeItem(oauthKey)
      returnToApp({ ok:true, message:'Google Health connected. Completed workouts will sync automatically.' })
    } catch {
      fail('Google Health connection could not be completed. Please try again.')
    }
  }
  void run()
})()
