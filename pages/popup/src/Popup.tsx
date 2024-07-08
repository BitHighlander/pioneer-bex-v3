import '@src/Popup.css';
import { useEffect } from 'react';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import { useOnStartApp } from './onStart';
import { usePioneer } from '@coinmasters/pioneer-react';
import { Classic } from '@coinmasters/pioneer-lib';

const Popup = () => {
  const onStartApp = useOnStartApp();
  const theme = useStorageSuspense(exampleThemeStorage);

  useEffect(() => {
    onStartApp();
  }, []);

  return (
    <div className="wrapper">
      <div className="container">
        <div className="content App" style={{ backgroundColor: theme === 'light' ? '#eee' : '#222' }}>
          <header className="App-header" style={{ color: theme === 'light' ? '#222' : '#eee' }}>
            <Classic usePioneer={usePioneer}></Classic>
          </header>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
