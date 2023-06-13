import rpx from '@/utils/rpx';
import React, { useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Expense() {
  let arr = Array(20).fill(0);
  const rowCount = Math.floor(Dimensions.get('window').width / rpx(120))
  const rowWidth = rpx(120) * rowCount

  const [activeRow, setActiveRow] = useState<number | null>()
  const [activeSecondRow, setActiveSecondRow] = useState<number | null>()

  const _setActiveRow = (rowIndex: number) => {
    if (activeRow === rowIndex) return
    console.log(rowIndex)
    setActiveRow(rowIndex)
    setActiveSecondRow(null)
  }
  const renderRows = () => {
    let rows: any[] = []
    arr.forEach((item, index) => {
      const rowIndex = Math.floor(index / rowCount)
      if (rows[rowIndex]) {
        rows[rowIndex].push(item)
      } else {
        rows[rowIndex] = [item]
      }
    })
    return (
      rows.map((item, idx1) => <View key={idx1} >
        <View style={{ flexDirection: 'row' }}>
          {item.map((it: number, idx2: number) =>
            <TouchableRipple>
              <View
                onTouchEnd={() => _setActiveRow(idx1)}
                key={`${idx1}-${idx2}`}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: rpx(120),
                  height: rpx(150),
                }}>
                <>
                  <View
                    style={{
                      backgroundColor: '#eee',
                      borderRadius: rpx(40),
                      width: rpx(80),
                      height: rpx(80),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Icon name="home" size={rpx(50)} />
                  </View>
                  <Text style={{ fontSize: rpx(24) }}>还款</Text>
                </>
              </View>
            </TouchableRipple>
          )}
          <TouchableRipple>
            <View
              onTouchEnd={() => _setActiveRow(idx1)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: rpx(120),
                height: rpx(150),
              }}>
              <>
                <View
                  style={{
                    backgroundColor: '#eee',
                    borderRadius: rpx(40),
                    width: rpx(80),
                    height: rpx(80),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon name="plus" size={rpx(50)} />
                </View>
                <Text style={{ fontSize: rpx(24) }}>编辑</Text>
              </>
            </View>
          </TouchableRipple>
        </View>
        {(activeRow === idx1) ? <View style={{ backgroundColor: '#eee', width: rowWidth, flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array(10).fill(0).map((it: number, idx22: number) => <>
            <TouchableRipple>
              <View
                key={`${idx1}-second-${idx22}`}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: rpx(120),
                  height: rpx(150),
                }}>
                <View
                  style={{
                    borderRadius: rpx(40),
                    width: rpx(80),
                    height: rpx(80),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon name="home" size={rpx(50)} />
                </View>
                <Text style={{ fontSize: rpx(24) }}>还款</Text>
              </View>
            </TouchableRipple>
          </>)}
          <TouchableRipple>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: rpx(120),
                height: rpx(150),
              }}>
              <View
                style={{
                  borderRadius: rpx(40),
                  width: rpx(80),
                  height: rpx(80),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="plus" size={rpx(50)} />
              </View>
              <Text style={{ fontSize: rpx(24) }}>新增</Text>
            </View>
          </TouchableRipple>
        </View> : null}
      </View>)
    )
  }
  return (
    <View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: rowWidth }}>{renderRows()}</View>
      </View>
      <View>
        <Text>keyboard</Text>
      </View>
    </View>
  );
}
