import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MicroHabitCategory } from '../types/models';
import { useT } from '../i18n';

export interface MicroHabitCheckboxProps {
  id?: string;
  checked: boolean;
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  category?: MicroHabitCategory | string;
  color?: string; // Optional custom color hex or identifier
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  as?: 'button' | 'span';
}

interface ParticleConfig {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  isSparkle?: boolean;
  delay: number;
}

// One accent for every built-in category; custom categories keep their own colour.
const ACCENT_PARTICLE = { primary: 'var(--accent)', secondary: 'var(--accent)', glow: 'var(--accent-soft)' };
const CATEGORY_PARTICLE_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  Health: ACCENT_PARTICLE,
  Learning: ACCENT_PARTICLE,
  Discipline: ACCENT_PARTICLE,
  Mindset: ACCENT_PARTICLE,
  Clarity: ACCENT_PARTICLE,
  Craft: ACCENT_PARTICLE,
  Environment: ACCENT_PARTICLE,
  Wealth: ACCENT_PARTICLE,
};

export const MicroHabitCheckbox: React.FC<MicroHabitCheckboxProps> = ({
  id,
  checked,
  onToggle,
  size = 'md',
  category = 'Health',
  color: customColor,
  ariaLabel,
  className = '',
  disabled = false,
  as = 'button',
}) => {
  const t = useT();
  const [burstKey, setBurstKey] = useState<number | null>(null);
  const [particles, setParticles] = useState<ParticleConfig[]>([]);
  const prevCheckedRef = useRef(checked);

  const colors = customColor
    ? {
        primary: customColor,
        secondary: customColor,
        glow: customColor.startsWith('#') ? `${customColor}50` : 'var(--accent-soft)',
      }
    : CATEGORY_PARTICLE_COLORS[category] || CATEGORY_PARTICLE_COLORS['Health'];

  // Dimension settings based on size prop
  const sizeConfig = {
    sm: {
      button: 'w-4 h-4',
      svg: 16,
      strokeWidth: 2.8,
      burstRadius: 15,
      dotSize: 2.2,
      ringSize: 24,
    },
    md: {
      button: 'w-6 h-6',
      svg: 20,
      strokeWidth: 2.6,
      burstRadius: 22,
      dotSize: 3,
      ringSize: 36,
    },
    lg: {
      button: 'w-7 h-7',
      svg: 24,
      strokeWidth: 2.6,
      burstRadius: 28,
      dotSize: 3.5,
      ringSize: 42,
    },
  }[size];

  // Trigger burst and tactile feedback whenever checkbox is toggled to checked
  useEffect(() => {
    // Only burst on positive transition: unchecked -> checked
    if (!prevCheckedRef.current && checked) {
      const newKey = Date.now();
      const numParticles = size === 'sm' ? 6 : 8;
      const baseDistance = sizeConfig.burstRadius;

      const generated: ParticleConfig[] = Array.from({ length: numParticles }).map((_, i) => {
        const baseAngle = (i / numParticles) * Math.PI * 2;
        // Jitter angle slightly (+/- 12 deg) for organic natural bloom
        const jitter = ((Math.random() - 0.5) * 24 * Math.PI) / 180;
        const angle = baseAngle + jitter;
        // Jitter distance
        const distance = baseDistance * (0.85 + Math.random() * 0.35);
        const particleSize = sizeConfig.dotSize * (0.75 + Math.random() * 0.5);
        const isSparkle = i % 3 === 0; // every 3rd particle is a 4-point micro-sparkle

        return {
          id: i,
          angle,
          distance,
          size: particleSize,
          color: i % 2 === 0 ? colors.primary : colors.secondary,
          isSparkle,
          delay: (i * 0.02) + Math.random() * 0.03,
        };
      });

      setParticles(generated);
      setBurstKey(newKey);

      // Light tactile vibration if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([18, 30, 15]);
        } catch {
          // ignore if vibration is restricted by user agent
        }
      }

      // Cleanup burst after animation completes
      const timer = setTimeout(() => {
        setBurstKey(null);
      }, 600);
      return () => clearTimeout(timer);
    }
    prevCheckedRef.current = checked;
  }, [checked, colors, size, sizeConfig.burstRadius, sizeConfig.dotSize]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (as === 'button') {
      e.stopPropagation();
      onToggle?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (as === 'button' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      e.stopPropagation();
      onToggle?.();
    }
  };

  const commonMotionProps = {
    animate: checked
      ? {
          scale: [0.82, 1.2, 0.94, 1.04, 1],
          transition: { duration: 0.34, ease: 'easeOut' as const },
        }
      : {
          scale: 1,
          transition: { duration: 0.2 },
        },
    className: `relative z-10 ${sizeConfig.button} rounded-full flex items-center justify-center shrink-0 cursor-pointer border-[1.5px] transition-colors duration-200 outline-none ${
      as === 'button' ? 'focus-visible:ring-2 focus-visible:ring-[var(--border-strong)] focus-visible:ring-offset-2' : ''
    } ${
      checked
        ? customColor
          ? 'text-white'
          : 'bg-[var(--accent)] border-[var(--accent)] text-white'
        : 'border-[var(--border-strong)] bg-transparent hover:border-[var(--fg)]'
    }`,
    style: checked
      ? {
          backgroundColor: customColor || undefined,
          borderColor: customColor || undefined,
        }
      : undefined,
  };

  const checkmarkIcon = (
    <AnimatePresence mode="wait">
      {checked && (
        <motion.svg
          key="check-svg"
          width={sizeConfig.svg}
          height={sizeConfig.svg}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
          initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.12 } }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 26,
          }}
        >
          <motion.path
            d="M5 10.5 L8.5 14 L15 6"
            stroke="currentColor"
            strokeWidth={sizeConfig.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: 0.04 },
              opacity: { duration: 0.08 },
            }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* 1. Subtle Expanding Shockwave Halo Ring on Check */}
      <AnimatePresence>
        {burstKey !== null && (
          <motion.span
            key={`halo-${burstKey}`}
            className="absolute rounded-full pointer-events-none z-0"
            initial={{ scale: 0.7, opacity: 0.85 }}
            animate={{ scale: 1.75, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: sizeConfig.ringSize,
              height: sizeConfig.ringSize,
              border: `1.5px solid ${colors.primary}`,
              backgroundColor: colors.glow,
            }}
          />
        )}
      </AnimatePresence>

      {/* 2. Micro Particle Burst Elements */}
      <AnimatePresence>
        {burstKey !== null && (
          <div
            key={`particles-container-${burstKey}`}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-visible"
            aria-hidden="true"
          >
            {particles.map((p) => {
              const targetX = Math.cos(p.angle) * p.distance;
              const targetY = Math.sin(p.angle) * p.distance;

              return (
                <motion.span
                  key={`p-${p.id}`}
                  className="absolute pointer-events-none rounded-full"
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: targetX,
                    y: targetY,
                    scale: [0, 1.25, 0.4, 0],
                    opacity: [1, 1, 0.6, 0],
                  }}
                  transition={{
                    duration: 0.48,
                    delay: p.delay,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                                        borderRadius: p.isSparkle ? '1px' : '9999px',
                    transform: p.isSparkle ? 'rotate(45deg)' : undefined,
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* 3. Primary Tactile Checkbox Button or Span */}
      {as === 'button' ? (
        <motion.button
          id={id}
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={ariaLabel || (checked ? t('Completed micro-habit') : t('Incomplete micro-habit'))}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: 1.08 }}
          {...commonMotionProps}
        >
          {checkmarkIcon}
        </motion.button>
      ) : (
        <motion.span
          id={id}
          role="checkbox"
          aria-checked={checked}
          aria-label={ariaLabel || (checked ? t('Completed micro-habit') : t('Incomplete micro-habit'))}
          onClick={handleClick}
          {...commonMotionProps}
        >
          {checkmarkIcon}
        </motion.span>
      )}
    </div>
  );
};
