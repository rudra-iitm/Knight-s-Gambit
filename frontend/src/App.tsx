import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from './pages/Homepage';
import Arena from './pages/Arena';

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/arena' element={<Arena />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
