import React, { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  ticketuserId: number;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, ticketuserId }) => {
  const maxStars = 5;
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleStarClick = (clickedIndex: number) => {
    onChange(clickedIndex + 1);
  };

  const handleStarHover = (hoveredIndex: number) => {
    if (parseInt(localStorage.getItem('id') || '') === ticketuserId) {
      setHoveredStar(hoveredIndex + 1);
    }
  };

  const handleStarLeave = () => {
    if (parseInt(localStorage.getItem('id') || '') === ticketuserId) {
      setHoveredStar(null);
    }
  };

  const renderStars = () => {
    const currentRating = hoveredStar !== null ? hoveredStar : value;

    return (
      <div className="flex items-center">
        {Array.from({ length: maxStars }, (_, index) => (
          <span
            key={index}
            onClick={() => handleStarClick(index)}
            onMouseEnter={() => handleStarHover(index)}
            onMouseLeave={handleStarLeave}
            className={`text-3xl cursor-pointer ${
              index < currentRating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center">
      {renderStars()}
    </div>
  );
};

export default StarRating;
