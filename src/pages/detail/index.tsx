import StatusBar from '@/components/base/statusBar';
import {useNavigate, useParams} from '@/entry/router';
import rpx from '@/utils/rpx';
import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Chip, Text} from 'react-native-paper';
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

export default function Detail() {
  const [html, setHtml] = useState<any>();
  const params = useParams<'detail'>();
  const webviewRef = useRef<WebView>(null);
  const navigate = useNavigate();

  const injectedJavaScript = `

  const uls = document.querySelectorAll('#play_tabs .main0 .movurl ul')
  
  const data = Array.from(uls).map(ul => {
    const als = ul.querySelectorAll('li a')
   return Array.from(als).map(a => ({href: a.href, title: a.textContent}))
  })

  window.ReactNativeWebView.postMessage(JSON.stringify(data));
`;

  const handleMessage = (event: WebViewMessageEvent) => {
    const receivedHtml = event.nativeEvent.data;
    setHtml(JSON.parse(receivedHtml));
  };
  const handleVideo = (video: any) => {
    navigate('player', video);
  };

  return (
    <SafeAreaView style={styles.appWrapper}>
      <StatusBar />
      <Text>{params.href}</Text>
      <View style={{display: 'none'}}>
        {params.href && (
          <WebView
            ref={webviewRef}
            style={{
              display: 'none',
            }}
            source={{uri: params.href}}
            originWhitelist={['*']}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
          />
        )}
      </View>
      <ScrollView>
        {html &&
          (html as any[]).map(
            (groupa: any[], idx1) =>
              groupa.length > 0 && (
                <View key={idx1}>
                  <Text>合集{idx1 + 1}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                    }}>
                    {groupa.map((item, idx2) => (
                      <View
                        key={`${idx1}-${idx2}`}
                        style={{
                          width: 100,
                        }}>
                        <Chip onPress={() => handleVideo(item)}>
                          {item.title}
                        </Chip>
                      </View>
                    ))}
                  </View>
                </View>
              ),
          )}
      </ScrollView>
    </SafeAreaView>
  );
}
