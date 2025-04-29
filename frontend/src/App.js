import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './ProgressContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Upload from './components/Upload';

import DatasetInfo from './components/DatasetInfo';
import Training from './components/Training';
import Analys from './components/Analys';
import Test from './components/Test';
import Document from './components/Document'

function App() {
  return (
    <ProgressProvider>
      <Router>
        <Routes>
          <Route index element={<Home />} />
          <Route path='/document' element={<Document />} />
          <Route path="/" element={<Layout />}>

            <Route path="/upload" element={<Upload />} />
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
