import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ReceiptDetail from './pages/ReceiptDetail'
import Register from './pages/Register'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/receipts/:id" element={<ReceiptDetail />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
