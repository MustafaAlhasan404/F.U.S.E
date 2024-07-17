// App.tsx
import React from 'react';
import { ThemeProvider } from './ThemeContext';
import AppNavigator from './AppNavigator';
import { Provider } from 'react-redux';
import store from './Redux/store';

import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
