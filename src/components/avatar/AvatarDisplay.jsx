import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacter } from '../../context/CharacterContext';
import './AvatarDisplay.css';

export function AvatarDisplay() {
    const { stats, photos, title, level } = useCharacter();

    // Visual Logic
    const hasPhoto = !!photos.front;

    // Scaling
    const scale = 0.8 + (stats.size / 100);
    const widthRatio = 0.8 + (stats.strength / 150);

    // Definition (Endurance) -> Contrast/Texture opacity
    // At 100 endurance, high definition.
    const definition = stats.endurance / 100;

    // Strength -> Muscle overlay opacity
    const muscleMass = stats.strength / 100;

    return (
        <div className="avatar-container">
            <h2 className="avatar-title">{title} <span className="avatar-level">Lvl {level}</span></h2>
            <div className="avatar-stage">

                {/* Aura */}
                <motion.div
                    className="avatar-aura"
                    animate={{
                        width: 250 + stats.mobility,
                        height: 250 + stats.mobility,
                        opacity: stats.mobility / 100,
                    }}
                ></motion.div>

                <div className="avatar-composition">
                    {/* Base Layer: Silhouette OR Photo */}
                    <motion.div
                        className={`avatar-base ${hasPhoto ? 'is-photo' : 'is-silhouette'}`}
                        style={{
                            backgroundImage: hasPhoto ? `url(${photos.front})` : 'none',
                            transform: `scale(${scale}, ${scale}) scaleX(${widthRatio})`,
                        }}
                    >
                        {!hasPhoto && (
                            <div className="default-silhouette"></div>
                        )}
                    </motion.div>

                    {/* Overlay: Muscle Mass (For photos, maybe a subtle "Bulk" shadow map if possible, 
               but for now relying on scaleX above. 
               Let's add a 'Vignette' or 'Hardening' effect based on Strength) */}
                    <motion.div
                        className="overlay-muscle"
                        style={{ opacity: muscleMass * 0.5 }}
                    ></motion.div>

                    {/* Overlay: Definition (Striations/Grain) */}
                    <motion.div
                        className="overlay-definition"
                        style={{ opacity: definition }}
                    ></motion.div>

                </div>
            </div>

            <div className="stat-readout">
                <div className="readout-item">Size: {stats.size}</div>
                <div className="readout-item">STR: {stats.strength}</div>
                <div className="readout-item">END: {stats.endurance}</div>
            </div>
        </div>
    );
}
