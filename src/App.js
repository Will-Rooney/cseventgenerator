import React from 'react';
import './App.css'
import InstanceList from './InstanceList';

const App = () => {
  return (
    <div className="App">
      <h1>Cisco Dynamic RevProxy Event Generator (Simulator)</h1>
      <InstanceList/>
    </div>);
};

export default App;
