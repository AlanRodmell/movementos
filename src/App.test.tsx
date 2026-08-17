import { fireEvent,render,screen } from '@testing-library/react'
import App from './App'

function submitDefaultBuilder() {
  for(let step=0;step<4;step+=1)fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/generate my session/i}))
}

it('builds a fresh routine on each builder submission and exposes one start action',()=>{
  localStorage.clear()
  window.scrollTo=vi.fn()
  render(<App/>)

  fireEvent.click(screen.getByRole('button',{name:'Build my own'}))
  submitDefaultBuilder()
  const firstRoutine=screen.getAllByRole('listitem').map(item=>item.getAttribute('aria-label'))
  expect(screen.getAllByRole('button',{name:/^Start session/})).toHaveLength(1)

  fireEvent.click(screen.getByRole('button',{name:/back/i}))
  submitDefaultBuilder()
  const nextRoutine=screen.getAllByRole('listitem').map(item=>item.getAttribute('aria-label'))
  expect(nextRoutine).not.toEqual(firstRoutine)
  expect(screen.getAllByRole('button',{name:/^Start session/})).toHaveLength(1)
})
