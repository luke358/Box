import StatusBar from '@/components/base/statusBar';
import {WebviweContext} from '@/entry';
import {useNavigate, useParams} from '@/entry/router';
import rpx from '@/utils/rpx';
import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Chip, Text} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebViewMessageEvent} from 'react-native-webview';
import code from '@/plugins/injectJavaScript';
import Loading from '@/components/base/loading';

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
  const webviewContext = useContext(WebviweContext);

  const [html, setHtml] = useState<any>();
  const params = useParams<'detail'>();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const injectedJavaScript = code.yhdm.detailCode;

  const handleVideo = (video: any) => {
    navigate('player', video);
  };

  const onLoadEnd = () => {
    setIsLoading(false);
    webviewContext?.webviewRef.current?.injectJavaScript(injectedJavaScript);
    webviewContext?.webviewRef.current?.stopLoading;
  };
  const onMessage = (event: WebViewMessageEvent) => {
    const receivedHtml = event.nativeEvent.data;
    console.log('onMessage', receivedHtml);
    setHtml(JSON.parse(receivedHtml));
  };

  const onLoadStart = () => {
    setIsLoading(true);
  };

  useEffect(() => {
    webviewContext?.webviewRef.current?.stopLoading;
    webviewContext!.methodsRef.current!.onLoadEnd = onLoadEnd;
    webviewContext!.methodsRef.current!.onMessage = onMessage;
    webviewContext!.methodsRef.current!.onLoadStart = onLoadStart;

    webviewContext?.setUrl(params.href);
    webviewContext?.webviewRef.current?.reload();
    () => {
      webviewContext!.methodsRef.current!.onLoadEnd = () => {};
      webviewContext!.methodsRef.current!.onMessage = () => {};
      webviewContext!.methodsRef.current!.onLoadStart = () => {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.appWrapper}>
      <StatusBar />
      <Text>{params.href}</Text>
      <ScrollView>
        {isLoading ? (
          <Loading />
        ) : (
          <>
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
