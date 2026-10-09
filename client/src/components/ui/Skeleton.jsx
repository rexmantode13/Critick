import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width, height, borderRadius = 'var(--radius-md)', className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius,
      }}
      aria-hidden="true"
    />
  );
};
