import React, { useState } from 'react';

const StarRating = ({ value, mobile, onChange, ticketuserId }) => {
  const maxStars = 5;
  const [hoveredStar, setHoveredStar] = useState(null);

  const handleStarClick = (clickedIndex) => {
    onChange(clickedIndex + 1);
  };

  const handleStarHover = (hoveredIndex) => {
    if(parseInt(localStorage.getItem('id')) === parseInt(ticketuserId))
    {setHoveredStar(hoveredIndex + 1);}
  };

  const handleStarLeave = () => {
    if(parseInt(localStorage.getItem('id')) === parseInt(ticketuserId))
    {setHoveredStar(null);}
  };

  const renderStars = () => {
    const currentRating = hoveredStar !== null ? hoveredStar : value;
  
    return (
      <div style={{ margin: 'auto' }}>
        {Array.from({ length: maxStars }, (_, index) => (
          <span
            key={index}
            onClick={() => handleStarClick(index)}
            onMouseEnter={() => handleStarHover(index)}
            onMouseLeave={handleStarLeave}
            style={{
              color: index < currentRating ? '#ffd700' : '#ccc',
              cursor: 'pointer'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const fontSize = mobile ? '5vw' : '30px';

  return (
    <div style={{ fontSize, display: 'flex', alignItems: 'center' }}>
      {renderStars()}
    </div>
  );
};

export default StarRating;
