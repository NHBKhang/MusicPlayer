import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { routes } from './configs/Routes';
import { SongControls } from './components';
import { useUser } from './configs/UserContext';

const App = () => {
  const { user, checkPremiumActive } = useUser();
  const checkPremium = checkPremiumActive();

  return (
    <div className="App">
      <Router>
        <Routes>
          {Object.values(routes).map((route, index) => {
            // Check if user exists or if the route does not require a user
            const isUserRequired = user || !route.require;

            // Check if the user has premium access or if the route does not require premium
            const hasPremiumAccess = checkPremium || !route.premium;

            if (isUserRequired && hasPremiumAccess) {
              return (
                <Route
                  key={index}
                  path={route.url}
                  element={
                    <>
                      <route.component />
                      {route.controlShow && <SongControls />}
                    </>
                  }
                />
              );
            }

            return null;
          })}
        </Routes>
      </Router>
    </div>
  );
}

export default App;