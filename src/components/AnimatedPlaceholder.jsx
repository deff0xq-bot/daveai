import React, { useState, useEffect } from 'react';

export default function AnimatedPlaceholder() {
  const phrases = [
    "Let's build a dashboard...",
    "Create a landing page...",
    "Design a mobile app...",
    "Build an e-commerce site...",
    "Make a portfolio website...",
    "Develop a chat application..."
  ];
  
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (text.length < currentPhrase.length) {
          setText(currentPhrase.slice(0, text.length + 1));
          setTypingSpeed(100);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (text.length > 0) {
          setText(currentPhrase.slice(0, text.length - 1));
          setTypingSpeed(50);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIndex, typingSpeed, phrases]);

  return (
    <span className="text-white">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
}