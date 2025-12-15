import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacter } from '../../context/CharacterContext';
import './StatInput.css';

const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 100, damping: 15, staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
};

export function StatInput() {
    const {
        stats, biometrics, activity, recovery,
        addWeeklyEntry, registerMissedSession, uploadPhoto,
        updateBiometrics, updateActivity, updateRecovery
    } = useCharacter();

    const [activeTab, setActiveTab] = useState('ritual'); // ritual, bio, activity, recovery
    const [formStats, setFormStats] = useState({ ...stats });

    // Handlers
    const handleStatChange = (e) => {
        const { name, value } = e.target;
        setFormStats(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handlePhotoUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => uploadPhoto(type, reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleBioChange = (e) => updateBiometrics({ [e.target.name]: parseFloat(e.target.value) || 0 });
    const handleActivityChange = (e) => updateActivity({ [e.target.name]: parseFloat(e.target.value) || 0 });
    const handleRecoveryChange = (e) => updateRecovery({ [e.target.name]: parseFloat(e.target.value) || 0 });

    const handleSubmit = (e) => {
        e.preventDefault();
        addWeeklyEntry(formStats);
        alert("Ritual complete. Stats updated.");
    };

    const handleMissed = () => {
        if (confirm("Missed this week? Progress will regress.")) {
            registerMissedSession();
        }
    };

    return (
        <motion.div
            className="stat-panel"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="tab-header">
                <button className={activeTab === 'ritual' ? 'active' : ''} onClick={() => setActiveTab('ritual')}>Ritual</button>
                <button className={activeTab === 'bio' ? 'active' : ''} onClick={() => setActiveTab('bio')}>Bio</button>
                <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}>Activity</button>
                <button className={activeTab === 'recovery' ? 'active' : ''} onClick={() => setActiveTab('recovery')}>Recovery</button>
            </div>

            <div className="tab-content">
                <AnimatePresence mode='wait'>
                    {activeTab === 'ritual' && (
                        <motion.div key="ritual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.h2 variants={itemVariants}>Weekly Ritual</motion.h2>
                            {/* Photo Uploads */}
                            <div className="photo-upload-section">
                                <h3>Identity Vessel</h3>
                                <div className="upload-row"><label>Front</label><input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'front')} /></div>
                                <div className="upload-row"><label>Side</label><input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'side')} /></div>
                            </div>

                            {/* Stats */}
                            <form onSubmit={handleSubmit} className="stat-form">
                                {Object.keys(formStats).map(stat => (
                                    <div key={stat} className="stat-row">
                                        <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
                                        <input type="range" name={stat} min="1" max="100" value={formStats[stat]} onChange={handleStatChange} />
                                        <span className="stat-value">{formStats[stat]}</span>
                                    </div>
                                ))}
                                <div className="actions">
                                    <button type="submit" className="btn-confirm">Offer Strength</button>
                                    <button type="button" onClick={handleMissed} className="btn-miss">Missed</button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'bio' && (
                        <motion.div key="bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="stat-form">
                            <h2>Biometrics</h2>
                            <div className="stat-row"><label>Age</label><input type="number" name="age" value={biometrics.age} onChange={handleBioChange} /></div>
                            <div className="stat-row"><label>Resting HR</label><input type="number" name="restingHR" value={biometrics.restingHR} onChange={handleBioChange} /></div>
                            <p className="tab-hint">Used for Stamina (VO2 Max) calculations.</p>
                        </motion.div>
                    )}

                    {activeTab === 'activity' && (
                        <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="stat-form">
                            <h2>Activity Zones (Mins)</h2>
                            <div className="stat-row"><label>Zone 1 (Easy)</label><input type="number" name="zone1" value={activity.zone1} onChange={handleActivityChange} /></div>
                            <div className="stat-row"><label>Zone 2 (Fat Burn)</label><input type="number" name="zone2" value={activity.zone2} onChange={handleActivityChange} /></div>
                            <div className="stat-row"><label>Zone 3 (Aerobic)</label><input type="number" name="zone3" value={activity.zone3} onChange={handleActivityChange} /></div>
                            <div className="stat-row"><label>Zone 4 (Threshold)</label><input type="number" name="zone4" value={activity.zone4} onChange={handleActivityChange} /></div>
                            <div className="stat-row"><label>Zone 5 (Max)</label><input type="number" name="zone5" value={activity.zone5} onChange={handleActivityChange} /></div>
                            <p className="tab-hint">High intensity zones grant more XP.</p>
                        </motion.div>
                    )}

                    {activeTab === 'recovery' && (
                        <motion.div key="recovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="stat-form">
                            <h2>Rest & Nutrition</h2>
                            <div className="stat-row"><label>Sleep (Hours)</label><input type="number" name="sleepHours" value={recovery.sleepHours} onChange={handleRecoveryChange} /></div>
                            <div className="stat-row">
                                <label>Meal Quality (1-10)</label>
                                <input type="range" name="mealScore" min="1" max="10" value={recovery.mealScore} onChange={handleRecoveryChange} />
                                <span className="stat-value">{recovery.mealScore}</span>
                            </div>
                            <p className="tab-hint">Affects your generic Life/Health orb.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
