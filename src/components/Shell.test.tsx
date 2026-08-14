import { render, screen } from '@testing-library/react'
import { Shell } from './Shell'

it('places Back in the lower action area and never in the top bar', () => {
  render(<Shell view="library" title="Library" onNavigate={() => undefined} onBack={() => undefined}><p>content</p></Shell>)
  const back = screen.getByRole('button', { name:/back/i })
  expect(back).toHaveClass('bottom-back')
  expect(document.querySelector('.topbar')?.textContent).not.toMatch(/Back/)
})
