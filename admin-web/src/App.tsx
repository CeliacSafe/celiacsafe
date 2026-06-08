import { useEffect, useState, useCallback } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { hasVerifiedMfa, isMfaSatisfied } from './lib/mfaAuth';
import { isDevAuthBypassEnabled } from './lib/devAuthBypass';
import { ensureDevAutoLogin } from './lib/devAutoLogin';
import { supabase } from './lib/supabase';
import { fetchProfileRole, isAdminRole, isStaffRole, type AppRole } from './lib/staffAuth';
import { useIdleLogout } from './hooks/useIdleLogout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantEditPage from './pages/RestaurantEditPage';
import SubmissionsPage from './pages/SubmissionsPage';
import ImportPage from './pages/ImportPage';
import SecurityPage from './pages/SecurityPage';
import AuditPage from './pages/AuditPage';
import type { Session } from '@supabase/supabase-js';

function AccessDenied({ role }: { role: AppRole | null }) {
  return (
    <div className="layout">
      <div className="card">
        <h1>Kein Zugriff</h1>
        <p className="muted">
          Dein Konto ({role ?? 'kein Profil'}) hat keine Berechtigung für das Admin-Interface.
          Bitte wende dich an einen Administrator.
        </p>
      </div>
    </div>
  );
}

function MfaRequired() {
  return <Navigate to="/login" replace />;
}

function MfaEnrollmentRequired() {
  return <Navigate to="/security" replace />;
}

function Shell({
  session,
  role,
  mfaEnrolled,
  onMfaEnrolled,
  onLogout,
}: {
  session: Session;
  role: AppRole;
  mfaEnrolled: boolean;
  onMfaEnrolled: () => void;
  onLogout: () => void;
}) {
  useIdleLogout(onLogout, !isDevAuthBypassEnabled());

  if (!mfaEnrolled && !isDevAuthBypassEnabled()) {
    return (
      <div className="layout">
        <header className="nav">
          <strong style={{ color: '#a5d6a7' }}>CeliacSafe Admin</strong>
          <span className="muted">Zwei-Faktor-Authentifizierung erforderlich</span>
          <button type="button" onClick={onLogout}>
            Abmelden ({session.user.email})
          </button>
        </header>
        <Routes>
          <Route path="/security" element={<SecurityPage onEnrolled={onMfaEnrolled} />} />
          <Route path="*" element={<Navigate to="/security" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="layout">
      {isDevAuthBypassEnabled() ? (
        <p className="dev-banner">Localhost-Dev: Login &amp; 2FA deaktiviert</p>
      ) : null}
      <header className="nav">
        <strong style={{ color: '#a5d6a7' }}>CeliacSafe Admin</strong>
        <Link to="/">Dashboard</Link>
        <Link to="/restaurants">Restaurants</Link>
        <Link to="/submissions">Vorschläge</Link>
        <Link to="/import">CSV Import</Link>
        <Link to="/security">Sicherheit</Link>
        {isAdminRole(role) ? <Link to="/audit">Audit</Link> : null}
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
        <Route path="/security" element={<SecurityPage />} />
        <Route
          path="/audit"
          element={isAdminRole(role) ? <AuditPage /> : <Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [mfaOk, setMfaOk] = useState(true);
  const [mfaEnrolled, setMfaEnrolled] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setRole(null);
    setMfaOk(true);
    setMfaEnrolled(true);
    navigate('/login');
  }, [navigate]);

  const syncAuthState = async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession) {
      setRole(null);
      setMfaOk(true);
      setMfaEnrolled(true);
      return;
    }

    setMfaOk(await isMfaSatisfied());
    setMfaEnrolled(await hasVerifiedMfa());
    setRole(await fetchProfileRole(nextSession.user.id));
  };

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      if (isDevAuthBypassEnabled()) {
        await ensureDevAutoLogin();
      }
      const { data } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }
      await syncAuthState(data.session);
      setLoading(false);
    };

    loadSession().catch(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      syncAuthState(next).catch(() => {
        if (!cancelled) {
          setRole(null);
          setMfaOk(false);
        }
      });
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isStaff = isStaffRole(role);
  const onSecurityPage = location.pathname === '/security';

  useEffect(() => {
    if (!session || !isStaff) {
      return;
    }
    void hasVerifiedMfa().then(setMfaEnrolled);
  }, [session, isStaff, location.pathname]);

  if (loading) {
    return <div className="layout muted">Lade…</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={session && mfaOk && isStaff ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          !session ? (
            <Navigate to="/login" replace />
          ) : !mfaOk ? (
            <MfaRequired />
          ) : !isStaff ? (
            <AccessDenied role={role} />
          ) : !mfaEnrolled && !onSecurityPage && !isDevAuthBypassEnabled() ? (
            <MfaEnrollmentRequired />
          ) : (
            <Shell
              session={session}
              role={role ?? 'viewer'}
              mfaEnrolled={mfaEnrolled}
              onMfaEnrolled={() => setMfaEnrolled(true)}
              onLogout={handleLogout}
            />
          )
        }
      />
    </Routes>
  );
}
