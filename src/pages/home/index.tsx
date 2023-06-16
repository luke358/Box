import StatusBar from '@/components/base/statusBar';
import {useNavigate} from '@/entry/router';
import rpx from '@/utils/rpx';
import React, {useContext, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {PLUGINS} from '@/plugins/injectJavaScript';

import {
  Avatar,
  Card,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebViewMessageEvent} from 'react-native-webview';
import {WebviweContext, pluginName} from '@/entry';
import Loading from '@/components/base/loading';
import {useFocusEffect} from '@react-navigation/native';

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
  const webviewContext = useContext(WebviweContext);

  const navigate = useNavigate();
  const [html, setHtml] = useState<any>();
  const [kw, setKw] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = React.useState('');
  const injectedJavaScript = PLUGINS[pluginName].searchCode;
  const searchUrl = PLUGINS[pluginName].searchUrl;

  const onLoadEnd = () => {
    setIsLoading(false);
    webviewContext?.webviewRef.current?.injectJavaScript(injectedJavaScript);
    webviewContext?.webviewRef.current?.stopLoading;
  };
  const onMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    console.log('onMessage', data);
    // { data: [], isEnd: false }
    setHtml(JSON.parse(data));
  };

  const onLoadStart = () => {
    setIsLoading(true);
  };

  function onSubmitEditing() {
    setKw(text);
    webviewContext?.setUrl(searchUrl.replace('{{kw}}', text));
    webviewContext?.webviewRef.current?.reload();
  }

  function handleDetail(item: any) {
    navigate('detail', item);
  }

  useFocusEffect(() => {
    webviewContext?.webviewRef.current?.stopLoading;
    webviewContext!.methodsRef.current!.onLoadEnd = onLoadEnd;
    webviewContext!.methodsRef.current!.onMessage = onMessage;
    webviewContext!.methodsRef.current!.onLoadStart = onLoadStart;
    () => {
      webviewContext!.methodsRef.current!.onLoadEnd = () => {};
      webviewContext!.methodsRef.current!.onMessage = () => {};
      webviewContext!.methodsRef.current!.onLoadStart = () => {};
    };
  });

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
      <ScrollView>
        {kw && <Text>当前搜索字段: {kw}</Text>}
        <View>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {html &&
                html.data &&
                (html.data as any[]).map(item => (
                  <TouchableRipple
                    key={item.href}
                    onPress={() => handleDetail(item)}>
                    <Card.Title
                      title={item.title}
                      left={props =>
                        item.pic && (
                          <Avatar.Image {...props} source={{uri: item.pic}} />
                        )
                      }
                    />
                  </TouchableRipple>
                ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
