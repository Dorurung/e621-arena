import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import E621Arena from './e621Arena.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <E621Arena />
  </StrictMode>,
)
