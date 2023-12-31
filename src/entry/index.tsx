import React, {RefObject, createContext, useRef, useState} from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {routes} from './router';
import bootstrap from './bootstrap';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {View} from 'react-native';
import {WebViewNavigationEvent} from 'react-native-webview/lib/WebViewTypes';
import Panels from '@/components/panels';
import toastConfig from '@/components/base/toast';
import Toast from 'react-native-toast-message';

bootstrap();

const Stack = createStackNavigator<any>();

interface WebviewMethods {
  onLoadEnd?: () => void;
  onMessage?: (e: WebViewMessageEvent) => void;
  onLoadStart?: (e?: WebViewNavigationEvent) => void;
}
export const WebviewContext = createContext<{
  webviewRef: RefObject<WebView>;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  methodsRef: RefObject<WebviewMethods>;
} | null>(null);

const App = () => {
  const webviewRef = useRef<WebView>(null);
  const methodsRef = useRef<WebviewMethods>({});
  const [url, setUrl] = useState('https://example.com');

  const onLoadEnd = () => {
    methodsRef.current?.onLoadEnd?.();
  };
  const onMessage = (e: WebViewMessageEvent) => {
    methodsRef.current?.onMessage?.(e);
  };
  const onLoadStart = (e: WebViewNavigationEvent) => {
    methodsRef.current?.onLoadStart?.(e);
  };
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PaperProvider>
        <SafeAreaProvider>
          <WebviewContext.Provider value={{webviewRef, setUrl, methodsRef}}>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="home"
                screenOptions={{
                  headerShown: false,
                  cardStyleInterpolator:
                    CardStyleInterpolators.forHorizontalIOS,
                }}>
                {/* <Stack.Screen name={'dashboard'} component={TabBar} /> */}
                {routes.map(route => (
                  <Stack.Screen
                    key={route.path}
                    name={route.path}
                    component={route.component}
                  />
                ))}
              </Stack.Navigator>

              <Panels />
              <Toast config={toastConfig} />

              <View style={{height: 0}}>
                <WebView
                  ref={webviewRef}
                  source={{uri: url}}
                  userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
                  originWhitelist={['*']}
                  onMessage={onMessage}
                  onError={e => console.log(e)}
                  onLoadEnd={onLoadEnd}
                  onLoadStart={onLoadStart}
                />
              </View>
            </NavigationContainer>
          </WebviewContext.Provider>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default App;
