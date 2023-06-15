import StatusBar from '@/components/base/statusBar';
import {useNavigate} from '@/entry/router';
import rpx from '@/utils/rpx';
import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import code from '@/plugins/injectJavaScript';
import {
  Avatar,
  Card,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import Video from 'react-native-video';

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
  return (
    //
    // <Video
    //   style={{width: 300, height: 400, backgroundColor: '#ccc'}}
    //   source={{
    //     uri: 'https://110.42.2.98:33555/t-me-tucheng5566/7b8cf23e446ce53103a24f8dd1da1d69.m3u8',
    //     type: 'hls',
    //   }}
    //   onError={e => console.log(e)}
    //   controls={true}
    //   resizeMode="contain"
    // />
    <WebView
      style={{marginTop: 50}}
      originWhitelist={['*']}
      source={{uri: 'http://192.168.11.65:5502/index.html'}}
      // 其他属性...
      onMessage={event => {
        console.log(event.nativeEvent.data); // 输出WebView的日志消息
      }}
      mediaPlaybackRequiresUserAction={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      mixedContentMode="always"
      androidLayerType="hardware"
      allowsInlineMediaPlayback={true}
      userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
      injectedJavaScriptBeforeContentLoaded={`
        // window.addEventListener("DOMContentLoaded", (event) => {
        //   const iframe = document.querySelectorAll('iframe')[2];
        //   const iframeWindow = iframe.contentWindow;
        //   setTimeout(() => {
        //     alert(iframeWindow.performance.getEntriesByType('resource'))
        //   }, 3000)
        //   iframeWindow.XMLHttpRequest.prototype.send = function() {
        //     // 在发送 XHR 请求前进行拦截和处理
        //     console.log('拦截到 XHR 请求');
        //     window.ReactNativeWebView.postMessage(xhr.responseURL);
        //     alert('test')
        //     // 调用原始的 send 方法继续发送 XHR 请求
        //     XMLHttpRequest.prototype.send.apply(this, arguments);
        //   };
        //   alert(iframeWindow.XMLHttpRequest.prototype);
        // });
      `}
    />
  );
}

export function CApp() {
  const navigate = useNavigate();
  const [html, setHtml] = useState<any>();
  const [kw, setKw] = useState('斗破');
  const [text, setText] = React.useState('');
  const webviewRef = useRef<WebView>(null);
  const injectedJavaScript = code.gimy;

  const uri = 'https://www.yhdmz.org/vp/23131-1-0.html'; // 替换为你想要加载的网址

  const handleMessage = (event: WebViewMessageEvent) => {
    const receivedHtml = event.nativeEvent.data;
    console.log('handleMessage test', receivedHtml);
    // setHtml(JSON.parse(receivedHtml));
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
            // ref={webviewRef}
            // style={{
            //   display: 'none',
            // }}
            // source={{uri: `${searchUrl}${kw}`}}
            source={{uri: 'https://gimy.app/eps/241836-6-31.html'}}
            // source={{uri}}
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
