import rpx from '@/utils/rpx';
import React, {useEffect, useRef, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Avatar, Card, IconButton, Text, TextInput} from 'react-native-paper';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import Video from 'react-native-video';
import axios from 'axios';
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
  const [html, setHtml] = useState<any>();
  const [kw, setKw] = useState('斗破');
  const [text, setText] = React.useState('');
  const webviewRef = useRef<WebView>(null);
  const injectedJavaScript = `
  // const iframeSrc = document.querySelector('iframe').src;
  // const videoUrl = iframeSrc.match(/url=(.*)/)[1];
  // window.ReactNativeWebView.postMessage(videoUrl);
  const lis = document.querySelectorAll('li.item')
  const data = Array.from(lis).map(li => {
    const href = li.querySelector('a').href;
    const imgblock = li.querySelector('.imgblock');
    const computedStyle = getComputedStyle(imgblock);
    const backgroundImage = computedStyle.getPropertyValue('background-image');
    
    const urlStartIndex = backgroundImage.indexOf('url("') + 5;
    const urlEndIndex = backgroundImage.lastIndexOf('")');
    const pic = backgroundImage.slice(urlStartIndex, urlEndIndex);

    const title = li.querySelector('.itemtext').textContent
    return {
      href,pic,title
    }
  })
  alert(document.documentElement.innerHTML
    );
  window.ReactNativeWebView.postMessage(JSON.stringify(data));
`;
  const uri = 'https://www.yhdmz.org/vp/23131-1-0.html'; // 替换为你想要加载的网址

  const handleMessage = (event: WebViewMessageEvent) => {
    const receivedHtml = event.nativeEvent.data;
    console.log('handleMessage test');
    setHtml(JSON.parse(receivedHtml));
  };

  useEffect(() => {
    // const getHtmlContent = async () => {
    //   const handleMessage = (event: WebViewMessageEvent) => {
    //     const receivedHtml = event.nativeEvent.data;
    //     console.log('test');
    //     setHtml(receivedHtml);
    //   };
    //   console.log(uri);
    //   return (
    //     <WebView
    //       source={{uri}}
    //       injectedJavaScript={injectedJavaScript}
    //       onMessage={handleMessage}
    //     />
    //   );
    // };
    // getHtmlContent();
  }, []);

  const searchUrl = 'https://www.yhdmz.org/s_all?ex=1&kw=';

  function onSubmitEditing() {
    setKw(text);
    webviewRef.current?.reload();
  }
  return (
    <View style={styles.appWrapper}>
      <View>
        <TextInput
          value={text}
          onChangeText={_text => setText(_text)}
          onSubmitEditing={onSubmitEditing}
        />
      </View>
      {/* search */}
      <View style={{display: 'none'}}>
        <Text>{kw}</Text>
        {kw && (
          <WebView
            ref={webviewRef}
            style={{
              display: 'none',
            }}
            source={{uri: `${searchUrl}${kw}`}}
            originWhitelist={['*']}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
          />
        )}
      </View>
      {/* video */}
      {/* <View style={{display: 'none'}}>
        <WebView
          ref={webviewRef}
          style={{display: 'none'}}
          source={{uri}}
          originWhitelist={['*']}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
        />
      </View> */}
      <ScrollView>
        {/* <Text>{html}</Text> */}
        {/* {html && (
          <Video
            style={{width: 300, height: 400, backgroundColor: 'red'}}
            source={{uri: decodeURIComponent(html)}}
            controls={true}
            resizeMode="contain"
          />
        )} */}
        <View>
          {html &&
            (html as any[]).map(item => (
              <Card.Title
                key={item.href}
                title={item.title}
                left={props => (
                  <Avatar.Image {...props} source={{uri: item.pic}} />
                )}
              />
            ))}
        </View>
      </ScrollView>
    </View>
  );
}
