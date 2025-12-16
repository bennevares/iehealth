import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { initiateWhoopAuth, disconnectWhoop } from '../../services/whoopService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './ConnectWhoopButton.css';

export const ConnectWhoopButton = () => {
    const { user } = useAuth();
    const [whoopConnected, setWhoopConnected] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkWhoopConnection();
        }
    }, [user]);

    const checkWhoopConnection = async () => {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                setWhoopConnected(userData.whoopConnected || false);
                setLastSync(userData.whoopLastSync);
            }
        } catch (error) {
            console.error('Error checking Whoop connection:', error);
        }
    };

    const handleConnect = () => {
        setLoading(true);
        initiateWhoopAuth();
    };

    const handleDisconnect = async () => {
        if (window.confirm('Are you sure you want to disconnect your Whoop account?')) {
            setLoading(true);
            try {
                await disconnectWhoop(user.uid);
                setWhoopConnected(false);
                setLastSync(null);
            } catch (error) {
                console.error('Error disconnecting Whoop:', error);
                alert('Failed to disconnect Whoop account');
            } finally {
                setLoading(false);
            }
        }
    };

    const formatLastSync = (timestamp) => {
        if (!timestamp) return 'Never';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
        return `${Math.floor(diffMins / 1440)} days ago`;
    };

    return (
        <div className="whoop-connection">
            {whoopConnected ? (
                <div className="whoop-connected">
                    <div className="whoop-status">
                        <span className="status-indicator connected"></span>
                        <span className="status-text">Whoop Connected</span>
                    </div>
                    {lastSync && (
                        <div className="last-sync">
                            Last synced: {formatLastSync(lastSync)}
                        </div>
                    )}
                    <button
                        onClick={handleDisconnect}
                        disabled={loading}
                        className="disconnect-button"
                    >
                        {loading ? 'Disconnecting...' : 'Disconnect Whoop'}
                    </button>
                </div>
            ) : (
                <div className="whoop-disconnected">
                    <div className="whoop-status">
                        <span className="status-indicator disconnected"></span>
                        <span className="status-text">Whoop Not Connected</span>
                    </div>
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="connect-button"
                    >
                        {loading ? 'Connecting...' : 'Connect Whoop Account'}
                    </button>
                    <p className="whoop-info">
                        Connect your Whoop account to sync recovery data and track your health stats automatically.
                    </p>
                </div>
            )}
        </div>
    );
};
