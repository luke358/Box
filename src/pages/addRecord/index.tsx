import rpx from '@/utils/rpx';
import React from 'react';
import {StatusBar, Text, useWindowDimensions, View} from 'react-native';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import Expense from './expense';
import Income from './income';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Transfer from './transfer';
import Debt from './debt';
import {useNavigation} from '@react-navigation/native';

const renderScene = SceneMap({
  expense: Expense,
  income: Income,
  debt: Debt,
  transfer: Transfer,
});

export default function AddRecord() {
  StatusBar.setBackgroundColor('#fff');
  const navigation = useNavigation();
  const [index, setIndex] = React.useState(0);

  const layout = useWindowDimensions();

  const routes = [
    {
      key: 'expense',
      title: '支出',
      component: Expense,
    },
    {
      key: 'income',
      title: '收入',
      component: Income,
    },
    {
      key: 'transfer',
      title: '转账',
      component: Transfer,
    },
    {
      key: 'debt',
      title: '债务',
      component: Debt,
    },
  ];
  return (
    <TabView
      style={{backgroundColor: '#fff'}}
      navigationState={{
        index,
        routes,
      }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={props => (
        <View>
          <Text
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: 0,
              zIndex: 9999,
              paddingLeft: rpx(28),
              lineHeight: rpx(75 + StatusBar.currentHeight!),
            }}>
            <Icon color={'#000'} name="arrow-left" size={rpx(50)} />
          </Text>
          <TabBar
            {...props}
            pressColor="#fff"
            indicatorStyle={{
              backgroundColor: '#47ab94',
              height: rpx(6),
              marginHorizontal: rpx(100),
              width: rpx(120),
            }}
            style={{
              backgroundColor: 'transparent',
              paddingHorizontal: rpx(100),
              elevation: 0,
              zIndex: 999,
            }}
            tabStyle={{minHeight: 30, width: rpx(120), height: rpx(100)}} // here
            renderLabel={({route, focused}) => (
              <Text
                style={{
                  color: focused ? 'black' : '#888',
                  fontSize: rpx(32),
                  padding: 0,
                  margin: 0,
                  // height: rpx(80),
                  // lineHeight: rpx(100),
                }}>
                {route.title}
              </Text>
            )}
          />
          {index < 2 && (
            <Text
              onPress={() => console.log('change')}
              style={{
                position: 'absolute',
                color: '#000',
                top: 0,
                right: rpx(30),
                zIndex: 9999,
                lineHeight: rpx(75 + StatusBar.currentHeight!),
              }}>
              日常账本
            </Text>
          )}
        </View>
      )}
      initialLayout={{width: layout.width}}
    />
  );
}
