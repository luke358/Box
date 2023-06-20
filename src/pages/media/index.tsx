/* eslint-disable react-native/no-inline-styles */
import rpx from '@/utils/rpx';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {Appbar, Card, TouchableRipple} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import PluginManager from '@/core/plugins';
import {useNavigation} from '@react-navigation/native';
import {fontSizeConst} from '@/constants/uiConst';
import {FlashList} from '@shopify/flash-list';
import useTextColor from '@/hooks/useTextColor';
import useColors from '@/hooks/useColors';
import StatusBar from '@/components/base/statusBar';
import {ICollect, getCollect} from '@/storage/collect';
import {useNavigate} from '@/entry/router';

export default function App() {
  const navigation = useNavigation();
  const [collect, setCollect] = useState<ICollect[]>([]);
  const colors = useColors();

  const plugin = PluginManager.getCurrentPlugin();
  const textColor = useTextColor();

  const navigate = useNavigate();
  useEffect(() => {
    getCollect(plugin!.name).then(_ => {
      setCollect(_);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPress = (item: ICollect) => {
    navigate('detail', {
      href: item.detailUrl,
      pic: item.pic,
      title: item.title,
    });
  };
  return (
    <SafeAreaView style={styles.appWrapper} edges={['bottom', 'top']}>
      <StatusBar />
      <Appbar.Header
        statusBarHeight={0}
        style={{backgroundColor: colors.primary}}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content
          titleStyle={{fontSize: fontSizeConst.title, color: '#fff'}}
          title={'媒体记录-' + plugin?.name}
        />
      </Appbar.Header>
      <View style={{flex: 1}}>
        <FlashList
          estimatedItemSize={200}
          numColumns={3}
          data={collect}
          renderItem={({item}) => {
            return (
              <TouchableRipple
                style={styles.flashItem}
                onPress={() => onPress(item)}>
                <Card style={styles.flashItemCard}>
                  <Card.Cover
                    style={{height: rpx(300)}}
                    source={{
                      uri: item.pic,
                    }}
                  />
                  <Card.Title
                    titleStyle={styles.cardTitle}
                    subtitleStyle={{
                      color: textColor,
                      fontSize: rpx(22),
                      marginLeft: rpx(-20),
                      marginBottom: rpx(-50),
                    }}
                    style={styles.cardTitleWrap}
                    title={item.title}
                    subtitle={item.index ? `看到${item.index}` : '未观看'}
                  />
                </Card>
              </TouchableRipple>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appWrapper: {
    width: '100%',
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  flashItem: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    marginTop: rpx(25),
  },
  flashItemCard: {
    width: '90%',
  },
  cardTitleWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cardTitle: {
    color: '#fff',
    fontSize: rpx(26),
    height: rpx(26),
    width: '100%',
    marginLeft: rpx(-20),
    marginBottom: rpx(-20),
    includeFontPadding: false,
  },
});
