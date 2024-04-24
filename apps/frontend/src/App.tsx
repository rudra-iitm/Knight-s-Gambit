import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from './pages/Homepage';
import Arena from './pages/Arena';
import Auth from './pages/Auth';
import BotArena from './pages/Bot';

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/arena/bot' element={<BotArena />} />
        <Route path='/arena/:gameId' element={<Arena />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
