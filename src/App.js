import React, { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('login');
  };

  if (page === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (page === 'register') {
    return <Register onRegister={() => setPage('login')} />;
  }

  return <Login onLogin={handleLogin} onRegister={() => setPage('register')} />;
}

export default App;