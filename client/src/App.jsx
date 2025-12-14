// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/landingPage';
// Make sure your page default-exports a PascalCase component:
import ChooseTransaction from './pages/chooseTransactionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChooseTransaction />} />
        <Route path="/choose-transaction" element={<ChooseTransaction />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
