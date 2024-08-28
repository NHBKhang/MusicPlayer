import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { routes } from './configs/API';
import { SongControls } from './components';
import { useUser } from './configs/UserContext';

const App = () => {
  const { user } = useUser();

  return (
    <div className="App">
      <Router>
        <SongControls />
        <Routes>
          {Object.values(routes).map((route, index) => (
            (user || !route.required) && <Route key={index} path={route.url} element={<route.component />} />
          ))}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
