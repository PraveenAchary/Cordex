import { useState } from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom";
import CordexDocs from './CordexDocs';
import Homepage from './Homepage';

import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/docs" element={<CordexDocs/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App
