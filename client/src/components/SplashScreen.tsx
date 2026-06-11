import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const emojis = ['🐔', '🐟', '🐐', '🐷', '🐙'];

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onFinish, 500);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={styles.container}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <div style={styles.titleContainer}>
            <motion.h1
              style={styles.title}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              MyMeal
            </motion.h1>
            <motion.p
              style={styles.subtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              What did you eat today?
            </motion.p>
          </div>
          <div style={styles.emojiGrid}>
            {emojis.map((emoji, i) => (
              <motion.div
                key={emoji}
                style={{
                  ...styles.emoji,
                  ...getPosition(i),
                }}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  y: [0, -10, 0],
                }}
                transition={{
                  delay: 0.8 + i * 0.15,
                  duration: 0.6,
                  y: {
                    delay: 0.8 + i * 0.15,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  },
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
          <motion.p
            style={styles.tapHint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            onClick={() => {
              setShow(false);
              setTimeout(onFinish, 500);
            }}
          >
            tap to start
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getPosition(i: number) {
  const positions = [
    { top: '10%', left: '15%' },
    { top: '5%', right: '20%' },
    { top: '35%', left: '50%', transform: 'translateX(-50%)' },
    { bottom: '25%', left: '10%' },
    { bottom: '20%', right: '15%' },
  ];
  return positions[i];
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  titleContainer: {
    textAlign: 'center',
    marginBottom: '20vh',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    letterSpacing: '0.05em',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    margin: '8px 0 0',
  },
  emojiGrid: {
    position: 'relative',
    width: '100%',
    height: '40vh',
  },
  emoji: {
    position: 'absolute',
    fontSize: '3.5rem',
    cursor: 'pointer',
  },
  tapHint: {
    position: 'absolute',
    bottom: '8vh',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.85rem',
    letterSpacing: '0.1em',
    animation: 'pulse 2s infinite',
    cursor: 'pointer',
  },
};
