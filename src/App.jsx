import './App.css'
import { Routes, Route } from 'react-router-dom'
import Chatbot from './Pages/Chabot'
import Bodha from './Pages/Bodha'
import Vidya from './Pages/Vidya'
import Abhyas from './Pages/Abhyas'
import Login from './Pages/Login'
import Signup from './Pages/Signup'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Chatbot />} />
      <Route path="/bodha" element={<Bodha />} />
      <Route path="/vidya" element={<Vidya />} />
      <Route path="/abhyas" element={<Abhyas />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<Chatbot />} />
    </Routes>
  )
}

export default App
