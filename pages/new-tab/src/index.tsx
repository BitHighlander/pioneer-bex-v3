import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import '@src/index.css';
import { PioneerProvider as PP } from '@coinmasters/pioneer-react';
import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import NewTab from '@src/NewTab';
import { theme } from '@src/styles/theme';
const ForceDarkMode = ({ children }: { children: React.ReactNode }) => {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode('dark');
  }, [setColorMode]);

  return <>{children}</>;
};

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(
    <ChakraProvider theme={theme}>
      <ForceDarkMode>
        <PP>
          <NewTab />
        </PP>
      </ForceDarkMode>
    </ChakraProvider>,
  );
}

init();
