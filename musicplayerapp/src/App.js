import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { routes } from './configs/API';
// import { useEffect } from 'react';

const App = () => {

  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
            {Object.values(routes).map((route, index) => (
              <Route key={index} path={route.url} element={<route.component />} />
            ))}
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
