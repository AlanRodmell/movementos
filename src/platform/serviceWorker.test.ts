import serviceWorkerSource from '../../public/sw.js?raw'
import manifestSource from '../../public/manifest.webmanifest?raw'

type Handler=(event:any)=>void

function harness(){
  const listeners:Record<string,Handler>={}
  const stored=new Map<string,unknown>()
  const cache={put:vi.fn(async(key:string|object,value:unknown)=>{stored.set(typeof key==='string'?key:(key as {url:string}).url,value)})}
  const caches={open:vi.fn(async()=>cache),keys:vi.fn(async()=>[] as string[]),delete:vi.fn(async()=>true),match:vi.fn(async(key:string|object)=>stored.get(typeof key==='string'?key:(key as {url:string}).url))}
  const worker={location:{origin:'https://movement.test'},addEventListener:vi.fn((type:string,handler:Handler)=>{listeners[type]=handler}),skipWaiting:vi.fn(async()=>undefined),clients:{claim:vi.fn(async()=>undefined)}}
  const fetch=vi.fn()
  new Function('self','caches','fetch','URL','Response',serviceWorkerSource)(worker,caches,fetch,URL,Response)
  return{listeners,stored,cache,caches,worker,fetch}
}

const response=(body='',ok=true)=>({ok,clone(){return this},text:async()=>body})

describe('offline application shell',()=>{
  it('declares an installable standalone manifest with a maskable icon',()=>{
    const manifest=JSON.parse(manifestSource)
    expect(manifest).toMatchObject({name:'Movement OS',start_url:'./',scope:'./',display:'standalone'})
    expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({src:'./icon.svg',purpose:'any maskable'})]))
  })

  it('installs the HTML shell, discovered assets, and core files before activating',async()=>{
    const env=harness()
    env.fetch.mockImplementation(async(path:string)=>path==='./index.html'?response('<script src="./assets/app.js"></script><link href="./assets/app.css">'):response('asset'))
    let pending:Promise<unknown>|undefined
    env.listeners.install({waitUntil:(promise:Promise<unknown>)=>{pending=promise}})
    await pending
    expect(env.caches.open).toHaveBeenCalledWith('movement-os-v7')
    expect(env.cache.put).toHaveBeenCalledWith('./index.html',expect.anything())
    expect(env.fetch).toHaveBeenCalledWith('./assets/app.js',{cache:'reload'})
    expect(env.fetch).toHaveBeenCalledWith('./manifest.webmanifest',{cache:'reload'})
    expect(env.worker.skipWaiting).toHaveBeenCalledOnce()
  })

  it('removes obsolete Movement OS caches but preserves unrelated caches',async()=>{
    const env=harness();env.caches.keys.mockResolvedValue(['movement-os-v6','movement-os-v7','other-app'])
    let pending:Promise<unknown>|undefined
    env.listeners.activate({waitUntil:(promise:Promise<unknown>)=>{pending=promise}})
    await pending
    expect(env.caches.delete).toHaveBeenCalledTimes(1)
    expect(env.caches.delete).toHaveBeenCalledWith('movement-os-v6')
    expect(env.worker.clients.claim).toHaveBeenCalledOnce()
  })

  it('serves cached navigation offline and updates the shell after a successful navigation',async()=>{
    const env=harness();const cached=response('cached');env.stored.set('./index.html',cached)
    const request={method:'GET',mode:'navigate',url:'https://movement.test/route'}
    env.fetch.mockRejectedValueOnce(new Error('offline'))
    let result:Promise<unknown>|undefined
    env.listeners.fetch({request,respondWith:(promise:Promise<unknown>)=>{result=promise}})
    await expect(result).resolves.toBe(cached)

    const online=response('fresh');env.fetch.mockResolvedValueOnce(online)
    env.listeners.fetch({request,respondWith:(promise:Promise<unknown>)=>{result=promise}})
    await expect(result).resolves.toBe(online)
    expect(env.cache.put).toHaveBeenCalledWith('./index.html',online)
  })

  it('uses cache-first for same-origin assets, caches misses, and ignores non-GET requests',async()=>{
    const env=harness();const cached=response('cached asset');const request={method:'GET',mode:'cors',url:'https://movement.test/icon.svg'}
    env.stored.set(request.url,cached)
    let result:Promise<unknown>|undefined
    env.listeners.fetch({request,respondWith:(promise:Promise<unknown>)=>{result=promise}})
    await expect(result).resolves.toBe(cached)
    expect(env.fetch).not.toHaveBeenCalled()

    const miss={...request,url:'https://movement.test/new.js'};const fetched=response('new')
    env.fetch.mockResolvedValueOnce(fetched)
    env.listeners.fetch({request:miss,respondWith:(promise:Promise<unknown>)=>{result=promise}})
    await expect(result).resolves.toBe(fetched)
    expect(env.cache.put).toHaveBeenCalledWith(miss,fetched)

    const respondWith=vi.fn();env.listeners.fetch({request:{...request,method:'POST'},respondWith})
    expect(respondWith).not.toHaveBeenCalled()
  })
})
