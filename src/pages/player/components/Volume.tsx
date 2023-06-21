/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import rpx from '@/utils/rpx';
import {Dimensions, View} from 'react-native';

export interface VolumeProps {
  volume: number;
}
export default function Volume(props: VolumeProps) {
  const {volume} = props;
  return (
    <View
      style={{
        position: 'absolute',
        height: Dimensions.get('window').height,
        right: rpx(60),
        justifyContent: 'center',
      }}>
      <View
        style={{
          backgroundColor: '#555',
          height: '60%',
          width: rpx(30),
          justifyContent: 'flex-end',
        }}>
        <View
          style={{
            backgroundColor: '#eee',
            width: '100%',
            height: `${Math.floor(volume * 100)}%`,
          }}
        />
      </View>
    </View>
  );
}
