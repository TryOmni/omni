// App.js
import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');

// App.js
useEffect(() => {
  fetch('http://127.0.0.1:5500/')
    .then(response => response.json())
    .then(data => setMessage(data.message))
    .catch(error => console.error('Error:', error));
}, []);


  return (
    <div>
      <h1>{message || 'Loading...'}</h1>
    </div>
  );
}

export default App;
