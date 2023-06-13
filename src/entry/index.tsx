import React from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import TabBar from '@/components/tabBar';
import {StatusBar} from 'react-native';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {routes} from './router';

const Stack = createStackNavigator<any>();

const App = () => {
  StatusBar.setBackgroundColor('#f6f6f6');
  StatusBar.setBarStyle('dark-content');
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PaperProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              }}>
              <Stack.Screen name={'dashboard'} component={TabBar} />
              {routes.map(route => (
                <Stack.Screen
                  key={route.path}
                  name={route.path}
                  component={route.component}
                />
              ))}
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default App;
