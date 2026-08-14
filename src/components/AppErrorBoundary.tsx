import { Component, type ErrorInfo, type ReactNode } from 'react'
import { STORAGE_KEY } from '../storage/state'

export class AppErrorBoundary extends Component<{ children:ReactNode },{ failed:boolean }> {
  state={ failed:false }

  static getDerivedStateFromError() { return { failed:true } }

  componentDidCatch(error:Error,info:ErrorInfo) {
    console.error('Movement OS could not render',error,info)
  }

  private downloadRecovery = () => {
    const contents=localStorage.getItem(STORAGE_KEY)
    if(!contents)return
    const url=URL.createObjectURL(new Blob([contents],{type:'application/json'}))
    const link=document.createElement('a');link.href=url;link.download='movement-os-recovery-backup.json';link.click();URL.revokeObjectURL(url)
  }

  private reset = () => {
    if(!confirm('Reset locally stored Movement OS data? Download a recovery backup first if you may need it.'))return
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  render() {
    if(!this.state.failed)return this.props.children
    return <main className="render-recovery"><span className="brand-mark">M</span><span className="eyebrow">MOVEMENT OS RECOVERY</span><h1>The app could not finish loading.</h1><p>Your locally stored data has not been changed. Reload after the latest update, or download it before resetting the app.</p><button className="primary" onClick={()=>window.location.reload()}>Reload app</button>{localStorage.getItem(STORAGE_KEY)&&<><button className="secondary" onClick={this.downloadRecovery}>Download recovery backup</button><button className="text-button danger-text" onClick={this.reset}>Reset local app data</button></>}</main>
  }
}
