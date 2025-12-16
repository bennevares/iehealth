import { useAuth } from '../contexts/AuthContext';
import { ConnectWhoopButton } from '../components/whoop/ConnectWhoopButton';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

export const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleBackToDashboard = () => {
        navigate('/');
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h1>Your Profile</h1>

                <div className="profile-info">
                    <div className="profile-avatar">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} />
                        ) : (
                            <div className="avatar-placeholder">
                                {user?.displayName?.[0] || user?.email?.[0] || '?'}
                            </div>
                        )}
                    </div>

                    <div className="profile-details">
                        <h2>{user?.displayName || 'User'}</h2>
                        <p className="email">{user?.email}</p>
                    </div>
                </div>

                <div className="profile-section">
                    <h3>Connected Devices</h3>
                    <ConnectWhoopButton />
                </div>

                <div className="profile-actions">
                    <button onClick={handleBackToDashboard} className="secondary-button">
                        Back to Dashboard
                    </button>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};
