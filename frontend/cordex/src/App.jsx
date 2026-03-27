import { useState } from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom";
import CordexDocs from './CordexDocs';
import Homepage from './Homepage';

import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/docs" element={<CordexDocs/>}/>
      </Routes>
    </BrowserRoutes>
  );
}

export default App
