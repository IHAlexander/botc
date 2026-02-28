import { BrowserRouter, Routes, Route } from 'react-router-dom'
import JoinPage from './pages/JoinPage.jsx'
import PlayerPage from './pages/PlayerPage.jsx'
import StorytellerPage from './pages/StorytellerPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinPage />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/storyteller" element={<StorytellerPage />} />
      </Routes>
    </BrowserRouter>
  )
}
