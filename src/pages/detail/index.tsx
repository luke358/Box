import StatusBar from '@/components/base/statusBar';
import {WebviewContext} from '@/entry';
import {useNavigate, useParams} from '@/entry/router';
import rpx from '@/utils/rpx';
import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, Chip, Text} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebViewMessageEvent} from 'react-native-webview';
import Loading from '@/components/base/loading';
import PluginManager from '@/core/plugins';
import {addCollect, getCollect, removeCollect} from '@/storage/collect';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  const webviewContext = useContext(WebviewContext);

  const [html, setHtml] = useState<IPlugin.IDetailCompleteResult | null>();
  const params = useParams<'detail'>();
  const [isLoading, setIsLoading] = useState(false);
  const [isCollect, setIsCollect] = useState(false);
  const navigate = useNavigate();

  const plugin = PluginManager.getCurrentPlugin();
  const injectedJavaScript = plugin?.instance.detailInjectCode || '';

  const handleVideo = (video: IPlugin.IDetailItem) => {
    navigate('player', {videoInfo: params, video});
  };

  const onLoadEnd = () => {
    setIsLoading(false);
    webviewContext?.webviewRef.current?.injectJavaScript(injectedJavaScript);
    webviewContext?.webviewRef.current?.stopLoading;
  };
  const onMessage = (event: WebViewMessageEvent) => {
    const result = event.nativeEvent.data;
    setHtml(plugin?.instance.detailComplete?.({result}));
  };

  const onLoadStart = () => {
    setIsLoading(true);
  };

  useEffect(() => {
    // 为什么放到 setTimeout ?
    // 因为不知道为什么上个页面的 useEffect 的返回值会把这个页面的数据覆盖
    getCollect(plugin!.name).then(collectList => {
      const index = collectList.findIndex(
        collect => collect.detailUrl === params.href,
      );
      setIsCollect(index !== -1);
    });
    setTimeout(() => {
      webviewContext?.webviewRef.current?.stopLoading;
      webviewContext!.methodsRef.current!.onLoadEnd = onLoadEnd;
      webviewContext!.methodsRef.current!.onMessage = onMessage;
      webviewContext!.methodsRef.current!.onLoadStart = onLoadStart;

      webviewContext?.setUrl(params.href);
      webviewContext?.webviewRef.current?.reload();
    });
    return () => {
      webviewContext!.methodsRef.current!.onLoadEnd = () => {};
      webviewContext!.methodsRef.current!.onMessage = () => {};
      webviewContext!.methodsRef.current!.onLoadStart = () => {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCollect = async () => {
    if (isCollect) {
      const res = await removeCollect(plugin!.name, params.href);
      if (res) {
        setIsCollect(false);
      }
    } else {
      const res = await addCollect(plugin!.name, {
        detailUrl: params.href,
        pic: params.pic,
        title: params.title,
      });
      if (res) {
        setIsCollect(true);
      }
    }
  };

  return (
    <SafeAreaView style={styles.appWrapper}>
      <StatusBar />
      <Button
        style={{marginTop: rpx(30)}}
        mode={isCollect ? 'outlined' : 'contained'}
        onPress={handleCollect}>
        {isCollect ? '已收藏' : '收藏'}{' '}
        <Icon size={16} name={isCollect ? 'star' : 'star-outline'} />
      </Button>
      <ScrollView>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {html &&
              html.map(
                (groupa, idx1) =>
                  groupa &&
                  groupa.data.length > 0 && (
                    <View key={idx1}>
                      <Text>{groupa.title}</Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                        }}>
                        {groupa.data.map((item, idx2) => (
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
