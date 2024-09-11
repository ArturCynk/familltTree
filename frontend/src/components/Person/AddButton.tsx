import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useSpring, animated } from '@react-spring/web';

interface AddButtonProps {
  onClick: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick }) => {
  const [isHover, setIsHover] = useState(false);

  // Animacja przycisku
  const springProps = useSpring({
    transform: isHover ? 'scale(1.1)' : 'scale(1)',
    boxShadow: isHover ? '0 8px 15px rgba(0, 0, 0, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.2)',
    config: { tension: 300, friction: 15 }
  });

  return (
    <animated.div
      className="flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-teal-500 text-white cursor-pointer"
      style={{
        width: '60px',
        height: '60px',
        position: 'absolute',
        bottom: '0',
        right: '0',
        margin: '10px', // Add margin to prevent it from sticking to the edges
        ...springProps
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <FontAwesomeIcon icon={faPlus} size="lg" />
    </animated.div>
  );
};

export default AddButton;
