import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import LandingPage from './pages/landingPage';
import ChooseTransactionPage from './pages/chooseTransactionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChooseTransactionPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
