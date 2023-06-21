/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import rpx from '@/utils/rpx';
import {Dimensions, View} from 'react-native';

export interface VolumeProps {
  brightness: number;
}
export default function Brightness(props: VolumeProps) {
  const {brightness} = props;
  return (
    <View
      style={{
        position: 'absolute',
        height: Dimensions.get('window').height,
        left: rpx(60),
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
            height: `${Math.floor(brightness * 100)}%`,
          }}
        />
      </View>
    </View>
  );
}
