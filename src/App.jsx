import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Lobby from './pages/Lobby/Lobby';
import Customization from './pages/Customization/Customization';
import CompressionTest from './pages/CompressionTest';
import SubmissionSuccess from './pages/SubmissionSuccess';
import Referral from './pages/Referral';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/customize/:productId" element={<Customization />} />
        <Route path="/compression-test" element={<CompressionTest />} />
        <Route path="/submission-success" element={<SubmissionSuccess />} />
        <Route path="/referral" element={<Referral />} />
      </Routes>
    </div>
  );
}

export default App;
