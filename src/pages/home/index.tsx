import StatusBar from '@/components/base/statusBar';
import {useNavigate} from '@/entry/router';
import rpx from '@/utils/rpx';
import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {
  Avatar,
  Card,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
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
  const navigate = useNavigate();
  const [html, setHtml] = useState<any>();
  const [kw, setKw] = useState('斗破');
  const [text, setText] = React.useState('');
  const webviewRef = useRef<WebView>(null);
  const injectedJavaScript = `
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
  // alert(document.documentElement.innerHTML);
  window.ReactNativeWebView.postMessage(JSON.stringify(data));
`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const uri = 'https://www.yhdmz.org/vp/23131-1-0.html'; // 替换为你想要加载的网址

  const handleMessage = (event: WebViewMessageEvent) => {
    const receivedHtml = event.nativeEvent.data;
    console.log('handleMessage test');
    setHtml(JSON.parse(receivedHtml));
  };

  const searchUrl = 'https://www.yhdmz.org/s_all?ex=1&kw=';

  function onSubmitEditing() {
    setKw(text);
    webviewRef.current?.clearCache?.(true);
    webviewRef.current?.reload();
  }

  function handleDetail(item: any) {
    navigate('detail', item);
  }
  return (
    <SafeAreaView style={styles.appWrapper}>
      <StatusBar />
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
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
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
              <TouchableRipple
                key={item.href}
                onPress={() => handleDetail(item)}>
                <Card.Title
                  title={item.title}
                  left={props => (
                    <Avatar.Image {...props} source={{uri: item.pic}} />
                  )}
                />
              </TouchableRipple>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
