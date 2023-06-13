import rpx from '@/utils/rpx';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Text} from 'react-native-paper';
import {WebView, WebViewMessageEvent} from 'react-native-webview';

const styles = StyleSheet.create({
  appWrapper: {
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#f6f6f6',
  },
  view: {
    paddingHorizontal: rpx(30),
    paddingTop: rpx(20),
    // backgroundColor: 'white',
  },
  drawerStyle: {
    backgroundColor: '#f6f6f6',
    elevation: 15,
  },
});

export default function App() {
  const [html, setHtml] = useState('');
  const injectedJavaScript = `
  window.ReactNativeWebView.postMessage(document.documentElement.innerHTML);
  console.log('test')
`;
  const uri = 'https://www.yhdmz.org/vp/23131-1-0.html'; // 替换为你想要加载的网址

  const handleMessage = (event: WebViewMessageEvent) => {
    const receivedHtml = event.nativeEvent.data;
    console.log('test');
    setHtml(receivedHtml);
  };
  // useEffect(() => {
  //   const getHtmlContent = async () => {
  //     const handleMessage = (event: WebViewMessageEvent) => {
  //       const receivedHtml = event.nativeEvent.data;
  //       console.log('test');
  //       setHtml(receivedHtml);
  //     };
  //     console.log(uri);
  //     return (
  //       <WebView
  //         source={{uri}}
  //         injectedJavaScript={injectedJavaScript}
  //         onMessage={handleMessage}
  //       />
  //     );
  //   };
  //   getHtmlContent();
  // }, []);

  return (
    <View style={styles.appWrapper}>
      <WebView
        style={{height: 0}}
        source={{uri}}
        originWhitelist={['*']}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
      />
      <ScrollView>
        <Text>HTML Content:</Text>
        <Text>{html}</Text>
      </ScrollView>
    </View>
  );
}
