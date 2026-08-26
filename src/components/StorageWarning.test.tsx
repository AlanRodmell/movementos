import { fireEvent,render,screen } from '@testing-library/react'
import { StorageWarning } from './StorageWarning'

it('offers recovery export and retry actions',()=>{
  const onRetry=vi.fn();const onExport=vi.fn()
  render(<StorageWarning onRetry={onRetry} onExport={onExport}/>)
  expect(screen.getByRole('alert')).toHaveTextContent('Your changes are not being saved')
  fireEvent.click(screen.getByRole('button',{name:'Export recovery copy'}))
  fireEvent.click(screen.getByRole('button',{name:'Retry saving'}))
  expect(onExport).toHaveBeenCalledOnce();expect(onRetry).toHaveBeenCalledOnce()
})
