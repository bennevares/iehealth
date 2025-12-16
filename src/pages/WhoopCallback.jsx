import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleOAuthCallback } from '../services/whoopService';
import './WhoopCallback.css';

export const WhoopCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState(null);

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setStatus('error');
                setError('Authorization was denied or cancelled');
                setTimeout(() => navigate('/profile'), 3000);
                return;
            }

            if (!code) {
                setStatus('error');
                setError('No authorization code received');
                setTimeout(() => navigate('/profile'), 3000);
                return;
            }

            if (!user) {
                setStatus('error');
                setError('User not authenticated');
                setTimeout(() => navigate('/login'), 3000);
                return;
            }

            try {
                await handleOAuthCallback(code, user.uid);
                setStatus('success');
                setTimeout(() => navigate('/profile'), 2000);
            } catch (err) {
                setStatus('error');
                setError(err.message || 'Failed to connect Whoop account');
                setTimeout(() => navigate('/profile'), 3000);
            }
        };

        processCallback();
    }, [searchParams, user, navigate]);

    return (
        <div className="whoop-callback-container">
            <div className="callback-card">
                {status === 'processing' && (
                    <>
                        <div className="spinner"></div>
                        <h2>Connecting Whoop Account...</h2>
                        <p>Please wait while we complete the connection.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="success-icon">✓</div>
                        <h2>Successfully Connected!</h2>
                        <p>Your Whoop account has been linked. Redirecting to your profile...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="error-icon">✗</div>
                        <h2>Connection Failed</h2>
                        <p>{error}</p>
                        <p className="redirect-text">Redirecting...</p>
                    </>
                )}
            </div>
        </div>
    );
};
