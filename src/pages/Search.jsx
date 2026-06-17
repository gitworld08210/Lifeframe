import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, firebaseReady } from '../firebase';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim() || !firebaseReady) return;

    setLoading(true);
    setSearched(true);

    try {
      const usersRef = collection(db, 'users');
      const searchLower = searchTerm.toLowerCase().trim();

      // Search by username
      const usernameQuery = query(
        usersRef,
        where('username', '>=', searchLower),
        where('username', '<=', searchLower + '\uf8ff'),
        limit(20)
      );

      // Search by displayName
      const nameQuery = query(
        usersRef,
        where('displayName', '>=', searchTerm.trim()),
        where('displayName', '<=', searchTerm.trim() + '\uf8ff'),
        limit(20)
      );

      const [usernameSnap, nameSnap] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(nameQuery),
      ]);

      const usersMap = new Map();
      usernameSnap.docs.forEach((doc) => usersMap.set(doc.id, doc.data()));
      nameSnap.docs.forEach((doc) => usersMap.set(doc.id, doc.data()));

      setResults(Array.from(usersMap.values()));
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  if (!firebaseReady) {
    return (
      <div className="page-section">
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          Search is unavailable. Firebase is not configured.
        </p>
      </div>
    );
  }

  return (
    <div className="page-section">
      <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Search users by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="glass-btn primary" disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </div>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner"></div>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
          No users found.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {results.map((user) => (
          <div
            key={user.uid}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/profile/${user.uid}`)}
          >
            <div className="avatar-sm">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {user.displayName}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                @{user.username}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
