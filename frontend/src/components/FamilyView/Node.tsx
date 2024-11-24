import React from 'react';

interface NodeProps {
  name: string;
  gender: 'male' | 'female' | 'non-binary';
  x: number;
  y: number;
  onClick: () => void;
}

const Node: React.FC<NodeProps> = ({ name, gender, x, y, onClick }) => {
  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick}>
      <rect
        width={60}
        height={40}
        x={-30}
        y={-20}
        fill={gender === 'male' ? '#87CEEB' : gender === 'female' ? '#FFC0CB' : '#D3D3D3'}
        rx={5}
      />
      <text dy={4} textAnchor="middle">
        {name}
      </text>
    </g>
  );
};

export default Node;
