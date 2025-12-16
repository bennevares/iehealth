import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Whoop API Configuration
const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v1';
const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

// Check if we should use mock data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Mock data for development/testing
const MOCK_RECOVERY_DATA = {
    recovery_score: 67,
    resting_heart_rate: 52,
    hrv: 75,
    sleep_performance: 85,
    timestamp: new Date().toISOString(),
};

const MOCK_CYCLE_DATA = {
    strain: 12.5,
    kilojoules: 8500,
    average_heart_rate: 110,
    max_heart_rate: 165,
};

/**
 * Calculate health points from recovery score (0-100)
 * Direct correlation as requested by user
 */
export const calculateHealthFromRecovery = (recoveryScore) => {
    return Math.round(recoveryScore);
};

/**
 * Initiate Whoop OAuth flow
 */
export const initiateWhoopAuth = () => {
    const clientId = import.meta.env.VITE_WHOOP_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_WHOOP_REDIRECT_URI || `${window.location.origin}/auth/whoop/callback`;

    // Generate a random state parameter for security (minimum 8 characters)
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Store state in sessionStorage to verify on callback
    sessionStorage.setItem('whoop_oauth_state', state);

    const authUrl = `${WHOOP_AUTH_URL}?` + new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'read:recovery read:cycles read:sleep read:workout read:profile',
        state: state,
    });

    window.location.href = authUrl;
};

/**
 * Handle OAuth callback and exchange code for tokens
 */
export const handleOAuthCallback = async (code, userId) => {
    if (USE_MOCK_DATA) {
        console.log('Mock mode: Simulating Whoop connection');
        return { success: true, mock: true };
    }

    try {
        const clientId = import.meta.env.VITE_WHOOP_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_WHOOP_CLIENT_SECRET;
        const redirectUri = import.meta.env.VITE_WHOOP_REDIRECT_URI || `${window.location.origin}/auth/whoop/callback`;

        const response = await fetch(WHOOP_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for tokens');
        }

        const tokens = await response.json();

        // Store tokens in Firestore
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            whoopConnected: true,
            whoopAccessToken: tokens.access_token,
            whoopRefreshToken: tokens.refresh_token,
            whoopTokenExpiry: Date.now() + (tokens.expires_in * 1000),
            whoopLastSync: new Date().toISOString(),
        });

        return { success: true, tokens };
    } catch (error) {
        console.error('Error handling OAuth callback:', error);
        throw error;
    }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const userData = userSnap.data();
        const refreshToken = userData.whoopRefreshToken;

        const response = await fetch(WHOOP_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: import.meta.env.VITE_WHOOP_CLIENT_ID,
                client_secret: import.meta.env.VITE_WHOOP_CLIENT_SECRET,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const tokens = await response.json();

        // Update tokens in Firestore
        await updateDoc(userRef, {
            whoopAccessToken: tokens.access_token,
            whoopRefreshToken: tokens.refresh_token,
            whoopTokenExpiry: Date.now() + (tokens.expires_in * 1000),
        });

        return tokens.access_token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};

/**
 * Get valid access token (refresh if needed)
 */
const getValidAccessToken = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error('User not found');
    }

    const userData = userSnap.data();
    const tokenExpiry = userData.whoopTokenExpiry || 0;

    // Check if token is expired or about to expire (within 5 minutes)
    if (Date.now() >= tokenExpiry - 300000) {
        return await refreshAccessToken(userId);
    }

    return userData.whoopAccessToken;
};

/**
 * Get recovery data from Whoop API
 */
export const getRecoveryData = async (userId) => {
    if (USE_MOCK_DATA) {
        console.log('Using mock recovery data');
        return MOCK_RECOVERY_DATA;
    }

    try {
        const accessToken = await getValidAccessToken(userId);

        const response = await fetch(`${WHOOP_API_BASE}/recovery`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recovery data');
        }

        const data = await response.json();

        // Update last sync time
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            whoopLastSync: new Date().toISOString(),
        });

        return data;
    } catch (error) {
        console.error('Error fetching recovery data:', error);
        throw error;
    }
};

/**
 * Get cycle (strain) data from Whoop API
 */
export const getCycleData = async (userId) => {
    if (USE_MOCK_DATA) {
        console.log('Using mock cycle data');
        return MOCK_CYCLE_DATA;
    }

    try {
        const accessToken = await getValidAccessToken(userId);

        const response = await fetch(`${WHOOP_API_BASE}/cycle`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cycle data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching cycle data:', error);
        throw error;
    }
};

/**
 * Get user profile from Whoop API
 */
export const getUserProfile = async (userId) => {
    if (USE_MOCK_DATA) {
        console.log('Using mock user profile');
        return {
            user_id: 'mock_user_123',
            email: 'mock@example.com',
            first_name: 'Test',
            last_name: 'User',
        };
    }

    try {
        const accessToken = await getValidAccessToken(userId);

        const response = await fetch(`${WHOOP_API_BASE}/user/profile/basic`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

/**
 * Disconnect Whoop account
 */
export const disconnectWhoop = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            whoopConnected: false,
            whoopAccessToken: null,
            whoopRefreshToken: null,
            whoopTokenExpiry: null,
            whoopLastSync: null,
        });
    } catch (error) {
        console.error('Error disconnecting Whoop:', error);
        throw error;
    }
};
