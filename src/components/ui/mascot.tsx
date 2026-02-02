"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type MascotProps = {
    focusedField: 'identifier' | 'password' | null;
    inputValueLength?: number;
};

export const Mascot = ({ focusedField, inputValueLength = 0 }: MascotProps) => {
    const [lookX, setLookX] = useState(0);
    const [lookY, setLookY] = useState(0);

    // Calculate eye movement based on input length or mouse position
    useEffect(() => {
        if (focusedField === 'identifier') {
            // Map input length to eye position (clamped)
            const x = Math.min(Math.max((inputValueLength * 2) - 15, -15), 15);
            setLookX(x);
            setLookY(10); // Look down slightly
        } else if (focusedField === null) {
            setLookX(0);
            setLookY(0);
        }
        // If password, eyes are covered, so position matters less
    }, [focusedField, inputValueLength]);

    return (
        <div className="w-32 h-32 relative mx-auto mb-4">
            <svg
                viewBox="0 0 120 120"
                className="w-full h-full drop-shadow-xl"
            >
                {/* Body/Head Background */}
                <motion.circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="#3b82f6" // Global primary color reference usually blue
                    className="fill-primary"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                />

                {/* Ears */}
                <motion.circle cx="20" cy="30" r="15" className="fill-primary" />
                <motion.circle cx="100" cy="30" r="15" className="fill-primary" />
                <circle cx="20" cy="30" r="6" fill="rgba(0,0,0,0.1)" />
                <circle cx="100" cy="30" r="6" fill="rgba(0,0,0,0.1)" />

                {/* Face Patch (lighter area) */}
                <ellipse cx="60" cy="65" rx="35" ry="30" fill="white" fillOpacity="0.2" />

                {/* Eyes Container */}
                <g transform="translate(0, 0)">
                    {/* Left Eye */}
                    <circle cx="40" cy="55" r="12" fill="white" />
                    <motion.circle
                        cx="40"
                        cy="55"
                        r="5"
                        fill="#1e293b"
                        animate={{
                            cx: 40 + (focusedField === 'password' ? 0 : lookX / 3),
                            cy: 55 + (focusedField === 'password' ? -5 : lookY / 3),
                        }}
                    />

                    {/* Right Eye */}
                    <circle cx="80" cy="55" r="12" fill="white" />
                    <motion.circle
                        cx="80"
                        cy="55"
                        r="5"
                        fill="#1e293b"
                        animate={{
                            cx: 80 + (focusedField === 'password' ? 0 : lookX / 3),
                            cy: 55 + (focusedField === 'password' ? -5 : lookY / 3),
                        }}
                    />
                </g>

                {/* Snout/Nose */}
                <ellipse cx="60" cy="75" rx="8" ry="5" fill="#1e293b" />

                {/* Hands (for hiding eyes) */}
                {/* Left Hand */}
                <motion.g
                    initial={{ y: 100, x: -10, rotate: -20, opacity: 0 }}
                    animate={{
                        y: focusedField === 'password' ? 55 : 100, // Moved down to eye level
                        x: focusedField === 'password' ? 35 : 10,  // Moved inward to cover eye
                        rotate: focusedField === 'password' ? 0 : -20,
                        opacity: focusedField === 'password' ? 1 : 0
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    <circle r="12" className="fill-primary" stroke="white" strokeWidth="2" />
                </motion.g>

                {/* Right Hand */}
                <motion.g
                    initial={{ y: 100, x: 130, rotate: 20, opacity: 0 }}
                    animate={{
                        y: focusedField === 'password' ? 55 : 100, // Moved down to eye level
                        x: focusedField === 'password' ? 85 : 110, // Moved inward to cover eye
                        rotate: focusedField === 'password' ? 0 : 20,
                        opacity: focusedField === 'password' ? 1 : 0
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    <circle r="12" className="fill-primary" stroke="white" strokeWidth="2" />
                </motion.g>
            </svg>
        </div>
    );
};
