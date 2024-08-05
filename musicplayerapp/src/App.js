import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { routes } from './configs/API';
import { SongControls } from './components';
import { AudioProvider } from './configs/AudioContext';

const App = () => {

  return (
    <AudioProvider>
      <div className="App">
        <Router>
          <SongControls />
          <Routes>
            {Object.values(routes).map((route, index) => (
              <Route key={index} path={route.url} element={<route.component />} />
            ))}
          </Routes>
        </Router>
      </div>
    </AudioProvider>
  );
}

export default App;
