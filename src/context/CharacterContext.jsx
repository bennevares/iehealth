import { createContext, useContext, useState, useEffect } from 'react';

const CharacterContext = createContext();

export function CharacterProvider({ children }) {
    const [stats, setStats] = useState({
        strength: 1,
        endurance: 1,
        flexibility: 1,
        mobility: 1,
        size: 1
    });

    const [photos, setPhotos] = useState({
        front: null,
        side: null
    });

    // NEW: Advanced Physiology State
    const [biometrics, setBiometrics] = useState({
        age: 30,
        restingHR: 60,
        gender: 'male' // 'male' | 'female'
    });

    const [activity, setActivity] = useState({
        zone1: 0, // Minutes
        zone2: 0,
        zone3: 0,
        zone4: 0,
        zone5: 0
    });

    const [recovery, setRecovery] = useState({
        sleepHours: 8,
        mealScore: 10 // 1-10
    });

    const [history, setHistory] = useState([]);
    const [level, setLevel] = useState(1);
    const [title, setTitle] = useState('Novice');

    // Derived Metrics
    const [healthPct, setHealthPct] = useState(100);
    const [staminaPct, setStaminaPct] = useState(100);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('character_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            setStats(parsed.stats || { strength: 1, endurance: 1, flexibility: 1, mobility: 1, size: 1 });
            setHistory(parsed.history || []);
            setPhotos(parsed.photos || { front: null, side: null });
            setBiometrics(parsed.biometrics || { age: 30, restingHR: 60, gender: 'male' });
            setActivity(parsed.activity || { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 });
            setRecovery(parsed.recovery || { sleepHours: 8, mealScore: 10 });
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('character_data', JSON.stringify({ stats, history, photos, biometrics, activity, recovery }));
        calculateMetrics();
    }, [stats, history, photos, biometrics, activity, recovery]);

    const calculateMetrics = () => {
        // 1. Level Calculation (Stats + Activity XP)
        const statTotal = Object.values(stats).reduce((a, b) => a + b, 0);

        // Activity XP: Weighted minutes
        // Z1=0.5, Z2=1, Z3=2, Z4=3, Z5=4
        const activityXP = (activity.zone1 * 0.5) + (activity.zone2 * 1) + (activity.zone3 * 2) + (activity.zone4 * 3) + (activity.zone5 * 4);

        // Level Formula: (StatTotal * 2 + ActivityXP / 10) / 10
        // A bit arbitrary, but rewards both structure and activity.
        const rawLevel = Math.floor((statTotal * 2 + activityXP / 10) / 10);
        // Ensure minimum level 1
        const newLevel = Math.max(1, rawLevel);

        setLevel(newLevel);

        if (newLevel <= 10) setTitle('Novice');
        else if (newLevel <= 19) setTitle('Apprentice');
        else if (newLevel <= 45) setTitle('Intermediate');
        else if (newLevel <= 70) setTitle('Advanced');
        else setTitle('Masters');

        // 2. Health Calculation (Recovery)
        // Sleep: 8h = 100%, 4h = 0% (linear clamp)
        const sleepScore = Math.min(100, Math.max(0, (recovery.sleepHours - 4) * 25));
        // Meal: 10 = 100%
        const dietScore = recovery.mealScore * 10;

        setHealthPct(Math.floor((sleepScore + dietScore) / 2));

        // 3. Stamina Calculation (VO2 Max Est)
        // Formula: VO2Max = 15 * (HRmax / HRrest)
        // HRmax est = 220 - Age
        const maxHR = 220 - biometrics.age;
        const estVO2 = 15 * (maxHR / (biometrics.restingHR || 60));

        // Normalize VO2:
        // Average 30yo Male is ~40-45. Elite is 70+.
        // Let's map 30 -> 0%, 75 -> 100% stamina orb fullness.
        const normalizedVO2 = Math.min(100, Math.max(0, (estVO2 - 30) * (100 / 45)));
        setStaminaPct(Math.floor(normalizedVO2));
    };

    const updateBiometrics = (data) => setBiometrics(prev => ({ ...prev, ...data }));
    const updateActivity = (data) => setActivity(prev => ({ ...prev, ...data }));
    const updateRecovery = (data) => setRecovery(prev => ({ ...prev, ...data }));

    const addWeeklyEntry = (newStats) => {
        setHistory(prev => [...prev, { date: new Date().toISOString(), stats: newStats }]);
        setStats(newStats);
    };

    const registerMissedSession = () => {
        setStats(prev => ({
            strength: Math.max(1, prev.strength - 1),
            endurance: Math.max(1, prev.endurance - 1),
            size: Math.max(1, prev.size - 1),
            flexibility: Math.max(1, prev.flexibility - 0.5),
            mobility: Math.max(1, prev.mobility - 0.5),
        }));
        setHistory(prev => [...prev, { date: new Date().toISOString(), type: 'missed' }]);
    };

    const uploadPhoto = (type, dataUrl) => {
        setPhotos(prev => ({ ...prev, [type]: dataUrl }));
    };

    return (
        <CharacterContext.Provider value={{
            stats, level, title, history, photos,
            biometrics, activity, recovery, healthPct, staminaPct,
            addWeeklyEntry, registerMissedSession, uploadPhoto,
            updateBiometrics, updateActivity, updateRecovery
        }}>
            {children}
        </CharacterContext.Provider>
    );
}

export function useCharacter() {
    return useContext(CharacterContext);
}
