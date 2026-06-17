import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

export default function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (!username.trim()) return setError('Username is required');

    setLoading(true);
    try {
      await signup(email, password, displayName, username);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Email already in use');
      else setError('Failed to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <h1 className="app-logo">GlassVerse</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group"><input type="text" className="glass-input" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required /></div>
          <div className="form-group"><input type="text" className="glass-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
          <div className="form-group"><input type="email" className="glass-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="form-group"><input type="password" className="glass-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div className="form-group"><input type="password" className="glass-input" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
          <button type="submit" className="glass-btn primary auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
