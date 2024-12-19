import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './ProgressContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';
import DatasetInfo from './components/DatasetInfo';
import Training from './components/Training';
import Analys from './components/Analys';
import Test from './components/Test'

function App() {
  return (
    <ProgressProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/result" element={<Result />} />
            <Route path='/dataset-info' element={<DatasetInfo />} />
            <Route path='/training' element={<Training />} />
            <Route path='/analys' element={<Analys />} />
            <Route path='/test' element={<Test />} />
          </Route>
        </Routes>
      </Router>
    </ProgressProvider>
  );
}

export default App;
