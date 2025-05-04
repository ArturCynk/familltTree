import React from 'react';
import { ToastContainer} from 'react-toastify';
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
import Appewfd from './components/appewfd';

const App: React.FC = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/family-view" element={<FamilyView />} />
         {/*<Route path="/ancestry-view" element={<AncestryView />} />
          <Route path="/fan-view" element={<FanView />} /> */}
          <Route path="/list-view" element={<ListView />} />
          <Route path="/" element={<HomePage />} />
          {/* Dodaj inne trasy w zależności od potrzeb */}
          <Route path="/settings-page" element={<UserSettings />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activate/:token" element={<ActivateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ChangePassword />} />
          <Route path="/collaborative-tree" element={<CollaborativeTreeView />} />
          <Route path="/app" element={<Appewfd />} />
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
};

export default App;