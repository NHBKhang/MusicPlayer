import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages';

const App = () => {

  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
            <Route exact path="/" element={<HomePage />} />
            {/* <Route path="/about" component={AboutPage} />
            <Route path="/contact" component={ContactPage} /> */}
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
