import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Resources from './pages/Resources';
import WellnessTracker from './pages/WellnessTracker';

function App(){
  return(
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/tracker" element={<WellnessTracker />} />
      </Routes>
    </>
  );
}

export default App;