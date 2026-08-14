import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppErrorBoundary } from './components/AppErrorBoundary'

createRoot(document.getElementById('root')!).render(<StrictMode><AppErrorBoundary><App /></AppErrorBoundary></StrictMode>)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let refreshing=false
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(refreshing)return
    refreshing=true
    window.location.reload()
  })
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(registration=>registration.update()).catch(error=>console.warn('Offline update unavailable',error)))
}
