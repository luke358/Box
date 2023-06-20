import StatusBar from '@/components/base/statusBar';
import {useNavigate} from '@/entry/router';
import rpx from '@/utils/rpx';
import React, {useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {Avatar, FAB, List} from 'react-native-paper';
import PluginManager, {Plugin} from '@/core/plugins';
import usePanel from '@/components/panels/usePanel';
import {installPluginFromUrl} from '@/utils/plugins';
import Toast from '@/utils/toast';
import Loading from '@/components/base/loading';

const ITEM_HEIGHT = rpx(96);

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
  sortItem: {
    height: ITEM_HEIGHT,
    width: rpx(500),
    paddingLeft: rpx(24),
    justifyContent: 'center',
  },
});

export default function App() {
  const navigate = useNavigate();

  const plugins = PluginManager.usePlugins();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {showPanel} = usePanel();
  const fabActions = [
    {
      icon: 'link-variant-plus',
      label: '从网络安装插件',
      async onPress() {
        showPanel('SimpleInput', {
          placeholder: '输入插件URL',
          maxLength: 120,
          async onOk(text, closePanel) {
            setLoading(true);
            closePanel();
            const result = await installPluginFromUrl(text.trim());
            if (result.code === 'success') {
              Toast.success('插件安装成功');
            } else {
              Toast.warn(`部分插件安装失败: ${result.message ?? ''}`);
            }
            setLoading(false);
          },
        });
      },
    },
  ];

  const onStateChange = ({open: o}: {open: boolean}) => setOpen(o);

  const onPress = (item: Plugin) => {
    PluginManager.setCurrentPlugin(item);
    navigate('search');
  };

  return (
    <SafeAreaView style={styles.appWrapper}>
      <StatusBar />
      {loading && <Loading />}
      <FlatList
        data={plugins}
        renderItem={({item}) => (
          <List.Item
            onPress={() => onPress(item)}
            title={item.name}
            left={props => (
              <Avatar.Image
                {...props}
                size={40}
                source={{
                  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAFVBMVEXLAADaSEjnh4f////yv7/87+/gZmY8ie6OAAAALElEQVR4AWOgEWBUggMBsACTMRwoUCbg4uKKKsDAwDLyBBCBzMDABgpk2gAAdjAkZFFl2WsAAAAASUVORK5CYII=',
                }}
              />
            )}
          />
        )}
      />
      <FAB.Group
        open={open}
        visible
        icon={open ? 'close' : 'plus'}
        actions={fabActions}
        onStateChange={onStateChange}
      />
    </SafeAreaView>
  );
}
