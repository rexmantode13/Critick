import React from 'react';
import { getInitials } from '../../utils/formatters';
import './CastMonogram.css';

export const CastMonogram = ({ actorName }) => {
  const initials = getInitials(actorName);

  return (
    <div className="cast-card">
      <div className="monogram-avatar" title={actorName}>
        <span>{initials}</span>
      </div>
      <div className="actor-info">
        <p className="actor-name line-clamp-1">{actorName}</p>
      </div>
    </div>
  );
};
