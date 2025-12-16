import { useCharacter } from '../../context/CharacterContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DiabloLayout.css';

export function DiabloLayout({ children }) {
  const { healthPct, staminaPct, recovery, biometrics } = useCharacter();
  const { user } = useAuth();
  const navigate = useNavigate();

  const healthTitle = "Health (Recovery): " + healthPct + "%\\nSleep: " + recovery.sleepHours + "h\\nDiet: " + recovery.mealScore + "/10";
  const staminaTitle = "Stamina (VO2 Max): " + staminaPct + "%\\nResting HR: " + biometrics.restingHR + " bpm";

  return (
    <div className="diablo-layout">
      <header className="diablo-header">
        <div className="ornament-left"></div>
        <h1 className="diablo-title">Character Profile</h1>
        <div className="user-menu">
          {user && (
            <button
              className="profile-button"
              onClick={() => navigate('/profile')}
              title="View Profile"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
              ) : (
                <span className="user-initial">{user.displayName?.[0] || user.email?.[0] || '?'}</span>
              )}
            </button>
          )}
        </div>
        <div className="ornament-right"></div>
      </header>

      <main className="diablo-main-content">
        <div className="parchment-bg">
          {children}
        </div>
      </main>

      <footer className="diablo-footer">
        <div className="orb-wrapper" title={healthTitle}>
          <div className="orb-container health-orb">
            <div className="orb-fill" style={{ height: healthPct + '%' }}></div>
          </div>
          <span className="orb-label">Health</span>
        </div>

        <div className="action-bar-placeholder">
          {/* Navigation or Status Text */}
          <span>Weekly Check-in Required</span>
        </div>

        <div className="orb-wrapper" title={staminaTitle}>
          <div className="orb-container resource-orb">
            <div className="orb-fill" style={{ height: staminaPct + '%' }}></div>
          </div>
          <span className="orb-label">Stamina</span>
        </div>
      </footer>
    </div>
  );
}
