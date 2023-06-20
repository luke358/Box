import {useNavigate} from '@/entry/router';
import rpx from '@/utils/rpx';
import React, {useContext, useState} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import {
  Appbar,
  Avatar,
  Card,
  Searchbar,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebViewMessageEvent} from 'react-native-webview';
import {WebviewContext} from '@/entry';
import Loading from '@/components/base/loading';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import PluginManager from '@/core/plugins';
import useColors from '@/hooks/useColors';
import useTextColor from '@/hooks/useTextColor';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function App() {
  const webviewContext = useContext(WebviewContext);

  const colors = useColors();
  const textColor = useTextColor();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [html, setHtml] = useState<any>();
  const [kw, setKw] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = React.useState('');

  const plugin = PluginManager.getCurrentPlugin();
  const injectedJavaScript = plugin?.instance.searchInjectCode || '';
  const searchUrl = plugin?.instance.searchUrl || '';

  const onLoadEnd = () => {
    setIsLoading(false);
    console.log('test', injectedJavaScript, plugin?.instance);
    webviewContext?.webviewRef.current?.injectJavaScript(injectedJavaScript);
    webviewContext?.webviewRef.current?.stopLoading;
  };
  const onMessage = (event: WebViewMessageEvent) => {
    const result = event.nativeEvent.data;
    console.log('onMessage', result);
    // { data: [], isEnd: false }
    setHtml(plugin?.instance?.searchComplete?.({result}) || JSON.parse(result));
  };

  const onLoadStart = () => {
    setIsLoading(true);
  };

  function onSubmitEditing() {
    setKw(text);
    console.log('sub');
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
    return () => {
      webviewContext!.methodsRef.current!.onLoadEnd = () => {};
      webviewContext!.methodsRef.current!.onMessage = () => {};
      webviewContext!.methodsRef.current!.onLoadStart = () => {};
    };
  });

  return (
    <SafeAreaView style={styles.appWrapper} edges={['bottom', 'top']}>
      <Appbar style={[styles.appbar, {backgroundColor: colors.primary}]}>
        <Appbar.BackAction
          color={textColor}
          onPress={() => {
            // !!这个组件有bug，输入法拉起的时候返回会默认打开panel
            Keyboard.dismiss();
            navigation.goBack();
          }}
        />
        <Searchbar
          autoFocus
          inputStyle={styles.input}
          style={styles.searchBar}
          onFocus={() => {
            // setPageStatus(PageStatus.EDITING);
          }}
          placeholder="输入要搜索的视频"
          onSubmitEditing={onSubmitEditing}
          onChangeText={_text => setText(_text)}
          value={text}
        />
        <Icon
          style={{marginHorizontal: rpx(20)}}
          size={30}
          color={textColor}
          name="clipboard-text-clock-outline"
        />
      </Appbar>

      <ScrollView>
        {kw && <Text>当前搜索: {kw}</Text>}
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

const styles = StyleSheet.create({
  appWrapper: {
    width: '100%',
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  appbar: {
    shadowColor: 'transparent',
  },
  searchBar: {
    minWidth: rpx(375),
    flex: 1,
    borderRadius: rpx(64),
    height: '68%',
    overflow: 'hidden',
    color: '#666666',
  },
  input: {
    padding: 0,
    paddingBottom: rpx(22),
    color: '#666666',
    fontSize: rpx(26),
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
