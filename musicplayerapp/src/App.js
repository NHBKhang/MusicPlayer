import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { routes } from './configs/Routes';
import { SongControls } from './components';
import { useUser } from './configs/UserContext';

const App = () => {
  const { user } = useUser();

  return (
    <div className="App">
      <Router>
        <Routes>
          {Object.values(routes).map((route, index) =>
            (user || !route.required) && (
              <Route
                key={index}
                path={route.url}
                element={<>
                  <route.component />
                  {route.controlShow && <SongControls />}
                </>
                }
              />
            )
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
