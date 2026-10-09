import React, { useState } from 'react';
import { catalogApi } from '../../api/catalogApi';
import { formatDate } from '../../utils/formatters';
import './SeasonAccordion.css';

export const SeasonAccordion = ({ imdbID, seasonNum }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [seasonData, setSeasonData] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleAccordion = async () => {
    if (!isOpen && !seasonData) {
      setLoading(true);
      try {
        const res = await catalogApi.getSeason(imdbID, seasonNum);
        if (res.success && res.data) {
          setSeasonData(res.data);
        }
      } catch (err) {
        console.error('Failed to load season details', err);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="season-accordion-item">
      <button className="season-accordion-header" onClick={toggleAccordion} aria-expanded={isOpen}>
        <span className="season-title">Season {seasonNum}</span>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="season-accordion-content">
          {loading ? (
            <div className="season-loading">Loading episode list...</div>
          ) : seasonData && seasonData.episodes ? (
            <div className="episodes-list">
              {seasonData.episodes.map((ep) => (
                <div key={ep.imdbID || ep.episode} className="episode-row">
                  <span className="ep-number">E{ep.episode}</span>
                  <div className="ep-details">
                    <p className="ep-title">{ep.title}</p>
                    <span className="ep-date">{formatDate(ep.released)}</span>
                  </div>
                  {ep.imdbRating && (
                    <div className="ep-rating">
                      <span className="star-icon">★</span>
                      <span>{ep.imdbRating}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="season-empty">Episode information not available for Season {seasonNum}.</div>
          )}
        </div>
      )}
    </div>
  );
};
