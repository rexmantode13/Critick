import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="notfound-page">
      <span className="notfound-code">404</span>
      <h1>Page Not Found</h1>
      <p>
        The page you're looking for doesn't exist, or has been moved.
        Let's get you back on track.
      </p>
      <Link to="/">
        <Button variant="primary" size="large">
          Back to Home
        </Button>
      </Link>
    </div>
  );
};
