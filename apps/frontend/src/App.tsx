import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from './pages/Homepage';
import Arena from './pages/Arena';
import Auth from './pages/Auth';

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/arena' element={<Arena />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
