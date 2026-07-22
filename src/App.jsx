import { HashRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import NavigationBar from './components/Navbar';
import Footer from './components/Footer';
import MeteorShower from './components/MeteorShower';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import ExperienceDetail from './pages/ExperienceDetail';
import Resume from './pages/Resume';
import { useState, useEffect, useRef } from 'react';
import './App.css';

// Scroll management on route change:
//   - PUSH (clicking a link into a new page) → scroll to top
//   - POP (browser back/forward) → restore saved scroll for that pathname
//   - `state.restoreScroll` (explicit Back buttons) → behave like POP
//   - `state.scrollTo` (navbar cross-route section scrolling) → no-op here;
//     Home's own useEffect scrolls to that section.
//   - Browser refresh → always start at the top (saved entry wiped on the
//     first effect run when performance.navigation.type === 'reload').
// Saved positions are kept in sessionStorage keyed by pathname; the listener
// is re-attached per pathname so it always writes for the current route.
function ScrollManager() {
  const { pathname, state } = useLocation();
  const navigationType = useNavigationType();
  const didInit = useRef(false);

  // Take scroll restoration off the browser so we fully control it
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      sessionStorage.setItem(`scroll:${pathname}`, String(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    // On the first effect run after page load, if the nav was a reload
    // (browser refresh), drop any stale saved scroll so the restore path
    // below falls through to scrollTo(0, 0). React Router reports initial
    // mount as POP, which would otherwise jump to the pre-refresh Y.
    if (!didInit.current) {
      didInit.current = true;
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry?.type === 'reload') {
        sessionStorage.removeItem(`scroll:${pathname}`);
      }
    }

    if (state?.scrollTo) return;
    const shouldRestore = state?.restoreScroll || navigationType === 'POP';
    if (shouldRestore) {
      const saved = sessionStorage.getItem(`scroll:${pathname}`);
      window.scrollTo(0, saved ? parseInt(saved, 10) : 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, state, navigationType]);

  return null;
}

const DARK_MODE_STORAGE_KEY = 'jatinuppal:dark-mode';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem(DARK_MODE_STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(darkMode));
    } catch {}
  }, [darkMode]);

  return (
    <Router>
      <ScrollManager />
      <div className={darkMode ? 'app dark-mode' : 'app'}>
        {/* Global SVG gradient defs — referenced via CSS fill:url(#id).
            Used by the project-card upvote arrow to render with a metallic
            base-to-tip gradient instead of a solid color. Hidden 0×0. */}
        <svg
          width="0"
          height="0"
          style={{ position: 'absolute' }}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="upvote-gradient-light" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="upvote-gradient-dark" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="55%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#a7f3d0" />
            </linearGradient>
            <linearGradient id="back-link-gradient-light" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="back-link-gradient-dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#52525b" />
              <stop offset="50%" stopColor="#e4e4e7" />
              <stop offset="100%" stopColor="#52525b" />
            </linearGradient>
          </defs>
        </svg>
        <NavigationBar darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/resume" element={<Resume />} />
          </Routes>
        </main>
        <Footer />
        <MeteorShower darkMode={darkMode} />
      </div>
    </Router>
  );
}

export default App;