import { fireEvent,render,screen } from '@testing-library/react'
import { STORAGE_KEY } from '../storage/state'
import { AppErrorBoundary } from './AppErrorBoundary'

function Bomb():React.ReactNode{throw new Error('render failed')}

describe('application render recovery',()=>{
  beforeEach(()=>localStorage.clear())
  afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals()})

  it('renders children while the application is healthy',()=>{
    render(<AppErrorBoundary><p>Healthy</p></AppErrorBoundary>)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('offers reload only when no stored recovery data exists',()=>{
    vi.spyOn(console,'error').mockImplementation(()=>undefined)
    render(<AppErrorBoundary><Bomb/></AppErrorBoundary>)
    expect(screen.getByRole('heading',{name:'The app could not finish loading.'})).toBeInTheDocument()
    expect(screen.getByRole('button',{name:'Reload app'})).toBeInTheDocument()
    expect(screen.queryByRole('button',{name:'Download recovery backup'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button',{name:'Reset local app data'})).not.toBeInTheDocument()
  })

  it('downloads stored recovery data and requires confirmation before reset',()=>{
    vi.spyOn(console,'error').mockImplementation(()=>undefined)
    localStorage.setItem(STORAGE_KEY,'{"schemaVersion":11}')
    let captured:Blob|undefined
    vi.stubGlobal('URL',{createObjectURL:vi.fn((blob:Blob)=>{captured=blob;return'blob:recovery'}),revokeObjectURL:vi.fn()})
    const linkClick=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>undefined)
    const confirm=vi.spyOn(window,'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    render(<AppErrorBoundary><Bomb/></AppErrorBoundary>)
    fireEvent.click(screen.getByRole('button',{name:'Download recovery backup'}))
    expect(linkClick).toHaveBeenCalledOnce()
    expect(captured?.type).toBe('application/json')
    fireEvent.click(screen.getByRole('button',{name:'Reset local app data'}))
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    fireEvent.click(screen.getByRole('button',{name:'Reset local app data'}))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(confirm).toHaveBeenCalledTimes(2)
  })
})
