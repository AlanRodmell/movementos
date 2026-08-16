import { fireEvent,render,screen } from '@testing-library/react'
import { BodyAreaPicker } from './BodyAreaPicker'

it('keeps detailed areas grouped until their body region is opened',()=>{
  const onChange=vi.fn()
  render(<BodyAreaPicker value={[]} onChange={onChange}/>)
  expect(screen.queryByRole('button',{name:'Hands'})).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/upper body/i}))
  fireEvent.click(screen.getByRole('button',{name:'Hands'}))
  expect(onChange).toHaveBeenCalledWith(['hands'])
  expect(screen.getByRole('button',{name:/upper body/i})).toHaveAttribute('aria-expanded','true')
})
