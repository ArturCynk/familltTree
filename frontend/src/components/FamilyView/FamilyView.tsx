import React from 'react';
import LeftHeader from '../LeftHeader/LeftHeader';
import App from './App/App';
import './FamilyView.css';

const FamilyView: React.FC = () => {
  return (
    <>
      <div className="relative">
        <LeftHeader />
        <div className="flex flex-col h-screen w-screen m-0 p-0">
          <div className="flex-1 relative w-full h-full overflow-hidden">
            <App />
          </div>
        </div>
      </div>
    </>
  );
};

export default FamilyView;
