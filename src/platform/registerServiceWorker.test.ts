import { registerOfflineUpdates } from './registerServiceWorker'

it('skips registration outside production or when service workers are unavailable',()=>{
  expect(registerOfflineUpdates(false,{addEventListener:vi.fn(),location:{reload:vi.fn()}},{} as Navigator)).toBe(false)
  expect(registerOfflineUpdates(true,{addEventListener:vi.fn(),location:{reload:vi.fn()}},{} as Navigator)).toBe(false)
})

it('registers and updates on load and reloads only once for a new controller',async()=>{
  const listeners:Record<string,()=>void>={}
  const update=vi.fn(async()=>undefined)
  const register=vi.fn(async()=>({update}))
  const serviceWorker={addEventListener:vi.fn((type:string,handler:()=>void)=>{listeners[type]=handler}),register}
  const windowListeners:Record<string,()=>void>={}
  const reload=vi.fn()
  const browserWindow={addEventListener:vi.fn((type:string,handler:()=>void)=>{windowListeners[type]=handler}),location:{reload}}
  expect(registerOfflineUpdates(true,browserWindow,{serviceWorker} as unknown as Navigator)).toBe(true)
  windowListeners.load()
  await vi.waitFor(()=>expect(update).toHaveBeenCalledOnce())
  expect(register).toHaveBeenCalledWith('./sw.js')
  listeners.controllerchange();listeners.controllerchange()
  expect(reload).toHaveBeenCalledOnce()
})

it('warns without interrupting the app when registration fails',async()=>{
  const warn=vi.spyOn(console,'warn').mockImplementation(()=>undefined)
  const windowListeners:Record<string,()=>void>={}
  const browserWindow={addEventListener:vi.fn((type:string,handler:()=>void)=>{windowListeners[type]=handler}),location:{reload:vi.fn()}}
  const serviceWorker={addEventListener:vi.fn(),register:vi.fn(async()=>{throw new Error('offline')})}
  registerOfflineUpdates(true,browserWindow,{serviceWorker} as unknown as Navigator)
  windowListeners.load()
  await vi.waitFor(()=>expect(warn).toHaveBeenCalledWith('Offline update unavailable',expect.any(Error)))
  warn.mockRestore()
})
