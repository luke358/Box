/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import rpx from '@/utils/rpx';
import {Dimensions, ScrollView, View} from 'react-native';
import {Text} from 'react-native-paper';

export interface PlayRateProps {}
export default function PlayRate(props: PlayRateProps) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
      }}>
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
        }}
        style={{
          width: rpx(300),
          maxHeight: Dimensions.get('window').height - rpx(100), // 调整这里的数值
          paddingVertical: rpx(20),
        }}>
        <Text style={{color: '#fff', marginVertical: rpx(25)}}>0.5X</Text>
        <Text style={{color: '#fff', marginVertical: rpx(25)}}>0.75X</Text>
        <Text style={{color: '#fff', marginVertical: rpx(25)}}>1.0X</Text>
        <Text style={{color: '#fff', marginVertical: rpx(25)}}>1.25X</Text>
        <Text style={{color: '#fff', marginVertical: rpx(25)}}>1.5X</Text>
        <Text style={{color: '#fff', marginVertical: rpx(25)}}>2.0X</Text>
        <Text style={{color: '#fff', marginVertical: rpx(25)}}>3.0X</Text>
        <Text style={{color: '#fff', marginVertical: rpx(25)}}>4.0X</Text>
        <Text style={{color: '#fff', marginVertical: rpx(25)}}>8.0X</Text>
      </ScrollView>
    </View>
  );
}
