import { useEffect, useState } from 'react';

// Cycles through words with a flip-up animation.
export default function RotatingWord({ words, interval = 2600 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
    if (words.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words, interval]);

  return (
    <span className="rotating-word" aria-live="polite">
      <span key={`${words[i]}-${i}`} className="rotating-word__item">{words[i]}</span>
    </span>
  );
}
