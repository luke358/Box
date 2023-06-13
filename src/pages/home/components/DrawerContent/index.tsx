import rpx from '@/utils/rpx';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface DrawerContentProps {}
export default function DrawerContent(
  _props: DrawerContentProps & DrawerContentComponentProps,
) {
  const tempList = React.useState([]);
  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.wrapper}>
        {tempList?.length ? (
          <View style={styles.emptyWrapper}>
            <Icon name="book-plus-outline" size={rpx(180)} />
            <Text style={styles.emptyText}>账单模版为空</Text>
            <Text style={styles.emptyHint}>点击右上角模版记账开始添加</Text>
          </View>
        ) : (
          ''
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    flexDirection: 'column',
    display: 'flex',
    elevation: 4,
  },
  emptyWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: rpx(-50),
    flex: 1,
  },
  emptyText: {
    color: '#47ab94',
    marginTop: rpx(30),
    fontSize: rpx(26),
  },
  emptyHint: {
    fontSize: rpx(24),
    marginTop: rpx(10),
  },
});
