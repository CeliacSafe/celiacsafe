import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantEditPage from './pages/RestaurantEditPage';
import SubmissionsPage from './pages/SubmissionsPage';
import ImportPage from './pages/ImportPage';
import type { Session } from '@supabase/supabase-js';

function Shell({ session, onLogout }: { session: Session; onLogout: () => void }) {
  return (
    <div className="layout">
      <header className="nav">
        <strong style={{ color: '#a5d6a7' }}>CeliacSafe Admin</strong>
        <Link to="/">Dashboard</Link>
        <Link to="/restaurants">Restaurants</Link>
        <Link to="/submissions">Vorschläge</Link>
        <Link to="/import">CSV Import</Link>
        <button type="button" onClick={onLogout}>
          Abmelden ({session.user.email})
        </button>
      </header>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/restaurants/:id" element={<RestaurantEditPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/import" element={<ImportPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <div className="layout muted">Lade…</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/*"
        element={
          session ? (
            <Shell session={session} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
