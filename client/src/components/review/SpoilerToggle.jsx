import React, { useState } from 'react';
import './SpoilerToggle.css';

export const SpoilerToggle = ({ children }) => {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return <div className="spoiler-revealed">{children}</div>;
  }

  return (
    <div className="spoiler-container">
      <div className="spoiler-warning-box">
        <span className="spoiler-tag">⚠️ SPOILER WARNING</span>
        <p className="spoiler-text">This review contains plot spoilers for this title.</p>
        <button className="reveal-btn" onClick={() => setRevealed(true)}>
          Show Spoiler Content
        </button>
      </div>
    </div>
  );
};
