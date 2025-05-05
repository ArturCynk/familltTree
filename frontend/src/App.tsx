import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListView from './components/ListView/ListView';
import Login from './components/LoginPage/LoginPage';
import Register from './components/RegisterPage/Register';
import ActivateAccount from './components/Activate/Activate';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import ChangePassword from './components/ChangePassword/ChangePassword';
import HomePage from './components/HomePage/HomePage';
import FamilyView from './components/FamilyView/FamilyView';
import UserSettings from './components/Settings/SettingsModal';
import CollaborativeTreeView from './components/CollaborativeTreeView/CollaborativeTreeView';
import TreeDetails from './components/TreeDetails/TreeDetails'; // Nowy komponent
import FamilyViewWebsocket from './components/websocket/FamilyView/FamilyView'

const App: React.FC = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/family-view" element={<FamilyView />} />
          <Route path="/tree/:id" element={<FamilyViewWebsocket />} /> {/* Nowa trasa */}
          <Route path="/list-view" element={<ListView />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/settings-page" element={<UserSettings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activate/:token" element={<ActivateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ChangePassword />} />
          <Route path="/collaborative-tree" element={<CollaborativeTreeView />} />
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
};

export default App;