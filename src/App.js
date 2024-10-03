import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
// import Upload from './Pages/Upload';
function App() {

  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/upload" element={<Upload />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
