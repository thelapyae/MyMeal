import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      setTimeout(onFinish, 400);
    }, 800);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={{ ...styles.container, background: 'var(--bg)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h1
            style={{ ...styles.title, color: 'var(--text)' }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            MyMeal
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 300,
    letterSpacing: '0.15em',
  },
};
