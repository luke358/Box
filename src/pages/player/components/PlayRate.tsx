/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import rpx from '@/utils/rpx';
import {ScrollView} from 'react-native';
import {Text, TouchableRipple} from 'react-native-paper';
import useColors from '@/hooks/useColors';

export interface PlayRateProps {
  onDismiss: () => void;
  onOk: (rate: number) => void;
  rate: number;
}
export default function PlayRate(props: PlayRateProps) {
  const {onDismiss, onOk, rate: currentRate} = props;
  const colors = useColors();
  const rateList = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0, 8.0];
  return (
    <TouchableRipple
      onPress={onDismiss}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        zIndex: 33,
      }}>
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
        }}
        style={{
          width: rpx(300),
        }}>
        {rateList.map(rate => (
          <Text
            onPress={e => {
              e.preventDefault();
              onOk(+rate);
              onDismiss();
            }}
            key={rate}
            style={{
              color: currentRate === +rate ? colors.primary : '#fff',
              marginVertical: rpx(15),
              paddingVertical: rpx(10),
              width: rpx(150),
              textAlign: 'center',
            }}>
            {rate.toString()}X
          </Text>
        ))}
      </ScrollView>
    </TouchableRipple>
  );
}
