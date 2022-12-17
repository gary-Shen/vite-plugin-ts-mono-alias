import { useMemo, useState } from 'react';
import { a } from '@ts-mono-alias/package-a';
import { b } from '@ts-mono-alias/package-b';

function App() {
  const [count, setCount] = useState(0);

  const resultA = useMemo(() => a(), []);
  const resultB = useMemo(() => b(), []);

  return (
    <div className="App">
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
        <p>a: {resultA}</p>
        <p>b: {resultB}</p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </div>
  );
}

export default App;
