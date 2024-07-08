import '@src/NewTab.css';
import '@src/NewTab.scss';
import { useEffect } from 'react';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import { ComponentPropsWithoutRef } from 'react';
import { useOnStartApp } from './onStart';
import { usePioneer } from '@coinmasters/pioneer-react';
import { Portfolio } from '@coinmasters/pioneer-lib';

const NewTab = () => {
  const onStartApp = useOnStartApp();
  // const { state } = usePioneer();
  // const { app } = state;
  const theme = useStorageSuspense(exampleThemeStorage);

  useEffect(() => {
    onStartApp();
  }, []);

  return (
    <div className="App" style={{ backgroundColor: theme === 'light' ? '#eee' : '#222' }}>
      <header className="App-header" style={{ color: theme === 'light' ? '#222' : '#eee' }}>
        {/*<Pioneer usePioneer={usePioneer}></Pioneer>*/}
        <Portfolio usePioneer={usePioneer}></Portfolio>
      </header>
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorageSuspense(exampleThemeStorage);
  return (
    <button
      className={
        props.className +
        ' ' +
        'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div> Loading ... </div>), <div> Error Occur </div>);
