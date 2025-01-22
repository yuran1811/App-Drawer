import { useEffect } from 'react';

import { ToolContainer } from './components/ToolContainer';

import { initApp } from './classes/Brusha';

export default function App() {
  useEffect(() => {
    initApp();
  }, []);

  return (
    <>
      <div className="canvas">
        <canvas id="draw" />
      </div>
      <ToolContainer />
    </>
  );
}
