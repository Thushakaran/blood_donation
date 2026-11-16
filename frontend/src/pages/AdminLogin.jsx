import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField, { inputClass } from '../components/FormField';

export default function AdminLogin() {
  const { isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-8 shadow">
        <h1 className="text-center text-3xl font-bold text-rose-800">Admin Login</h1>
        {error ? <p className="text-center text-sm text-rose-600">{error}</p> : null}
        <FormField label="Username">
          <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormField>
        <FormField label="Password">
          <input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        <button type="submit" className="w-full rounded-lg bg-rose-700 py-2 text-white hover:bg-rose-800">
          Login Here
        </button>
        <p className="text-center text-xs text-slate-500">Default login: admin / admin123</p>
      </form>
    </div>
  );
}
