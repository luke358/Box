import rpx from '@/utils/rpx';
import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import {Appbar, Card} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import PluginManager from '@/core/plugins';
import {useNavigation} from '@react-navigation/native';
import {fontSizeConst} from '@/constants/uiConst';
import {FlashList} from '@shopify/flash-list';
import useTextColor from '@/hooks/useTextColor';
import useColors from '@/hooks/useColors';
import StatusBar from '@/components/base/statusBar';

export default function App() {
  const navigation = useNavigation();

  const colors = useColors();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const plugin = PluginManager.getCurrentPlugin();
  const textColor = useTextColor();
  return (
    <SafeAreaView style={styles.appWrapper} edges={['bottom', 'top']}>
      <StatusBar />
      <Appbar.Header
        statusBarHeight={0}
        style={{backgroundColor: colors.primary}}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content
          titleStyle={{fontSize: fontSizeConst.title, color: '#fff'}}
          title="媒体记录"
        />
      </Appbar.Header>

      <ScrollView>
        <FlashList
          estimatedItemSize={300}
          numColumns={3}
          data={[1, 2, 3, 4, 5, 6, 7]}
          renderItem={({index, item}) => {
            return (
              <View style={styles.flashItem}>
                <Card style={styles.flashItemCard}>
                  <Card.Cover
                    style={{height: rpx(300)}}
                    source={{
                      uri: 'http://css.yhdmtu.me/acg/2021/07/08/20210708063100739.jpg',
                    }}
                  />
                  <Card.Title
                    titleStyle={{
                      color: textColor,
                      fontSize: fontSizeConst.title,
                    }}
                    subtitleStyle={{
                      color: textColor,
                      fontSize: fontSizeConst.subTitle,
                    }}
                    style={styles.cardTitle}
                    title="斗破苍穹年饭"
                    subtitle="看到10集"
                  />
                </Card>
              </View>
            );
          }}
        />
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
  flashItem: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    marginTop: rpx(25),
  },
  flashItemCard: {
    width: '90%',
  },
  cardTitle: {
    position: 'absolute',
    bottom: 0,
  },
});
