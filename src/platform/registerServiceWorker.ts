export function registerOfflineUpdates(
  isProduction=import.meta.env.PROD,
  browserWindow:Pick<Window,'addEventListener'> & {location:{reload:()=>void}}=window,
  browserNavigator:Pick<Navigator,'serviceWorker'>|Navigator=navigator,
) {
  if(!isProduction||!('serviceWorker' in browserNavigator))return false
  let refreshing=false
  browserNavigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(refreshing)return
    refreshing=true
    browserWindow.location.reload()
  })
  browserWindow.addEventListener('load',()=>browserNavigator.serviceWorker.register('./sw.js').then(registration=>registration.update()).catch(error=>console.warn('Offline update unavailable',error)))
  return true
}
