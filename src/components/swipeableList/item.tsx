import useLatest from '@/hooks/useLatest';
import rpx from '@/utils/rpx';
import React from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import {RadioButton, Text, TouchableRipple} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCROLL_THRESHOLD = SCREEN_WIDTH / 15;
const FORCE_TO_OPEN_THRESHOLD = SCREEN_WIDTH / 2.1;
const LEFT_BUTTONS_THRESHOLD = SCREEN_WIDTH / 4;

interface ItemProps {
  swipingCheck: (swiping: boolean) => void;
  isEdit?: boolean;
  message?: string;
  id: any;
  cleanFromScreen: (id: any) => void;
  leftButtonPressed: (type: 'copy' | 'edit') => void;
  deleteButtonPressed: () => void;
  editButtonPressed: () => void;
  onStartEdit?: (isDone: boolean) => void;
}

export default function Item(props: ItemProps) {
  const positionRef = React.useRef<Animated.ValueXY>(
    new Animated.ValueXY({x: 0, y: 0}),
  );

  const [leftContent, setLeftContent] = React.useState({
    text: '取消',
    bgColor: '#999',
  });

  const latestLeftContent = useLatest(leftContent);

  const scrollStopped = React.useRef(false);
  const timer = React.useRef<number>(0);

  const enableScrollView = (isEnabled: boolean) => {
    if (scrollStopped.current !== isEnabled) {
      props.swipingCheck(isEnabled);
      scrollStopped.current = isEnabled;
    }
  };

  const resetPosition = () => {
    setLeftContent({
      text: '取消',
      bgColor: '#999',
    });
    enableScrollView(false);
    Animated.timing(positionRef.current, {
      toValue: {x: 0, y: 0},
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const completeSwipe = (dimension: 'left' | 'right', callback: () => void) => {
    callback();
  };

  const userSwipedRight = (gesture: PanResponderGestureState) => {
    resetPosition();
    if (gesture.dx >= FORCE_TO_OPEN_THRESHOLD) {
      // 复制
      completeSwipe('right', () => props.leftButtonPressed('copy'));
    } else if (gesture.dx >= LEFT_BUTTONS_THRESHOLD) {
      // 编辑
      completeSwipe('right', () => props.leftButtonPressed('edit'));
    }
  };
  const getLeftButtonProps = () => {
    const opacity = positionRef.current.x.interpolate({
      inputRange: [30, 75, 320],
      outputRange: [0, 1, 1],
    });
    const width = positionRef.current.x.interpolate({
      inputRange: [20, 70],
      outputRange: [20, 70],
    });
    return {
      opacity,
      width,
    };
  };
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderMove: (event, gesture) => {
        if (gesture.dx >= SCROLL_THRESHOLD) {
          enableScrollView(true);
          const x = gesture.dx - SCROLL_THRESHOLD;
          positionRef.current.setValue({x, y: 0});
        }
        // 右侧手势，暂时用不到
        // else if (gesture.dx <= -SCROLL_THRESHOLD) {
        // enableScrollView(true);
        // const x = gesture.dx + SCROLL_THRESHOLD;
        // position.setValue({x, y: 0});
        // }
        if (gesture.dx > FORCE_TO_OPEN_THRESHOLD) {
          latestLeftContent.current.text !== '复制' && Vibration.vibrate(1);
          setLeftContent({text: '复制', bgColor: '#e35d88'});
        } else if (gesture.dx > LEFT_BUTTONS_THRESHOLD) {
          latestLeftContent.current.text !== '编辑' &&
            latestLeftContent.current.text !== '复制' &&
            Vibration.vibrate(1);
          setLeftContent(() => ({text: '编辑', bgColor: '#47ab94'}));
        } else {
          latestLeftContent.current.text !== '取消' &&
            latestLeftContent.current.text !== '编辑' &&
            Vibration.vibrate(1);
          setLeftContent({text: '取消', bgColor: '#999'});
        }
      },
      onPanResponderRelease: (event, gesture) => {
        positionRef.current.flattenOffset();
        if (gesture.dx > 0) {
          userSwipedRight(gesture);
        } else if (gesture.dx < 0) {
          // this.userSwipedLeft(gesture);
        } else {
          resetPosition();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(positionRef.current, {
          toValue: {x: 0, y: 0},
          useNativeDriver: false,
        }).start();
      },
    }),
  );

  const {containerStyle, leftButtonContainer, textContainer} = styles;
  return (
    <View style={containerStyle}>
      <Animated.View
        style={[
          leftButtonContainer,
          {backgroundColor: leftContent.bgColor},
          getLeftButtonProps(),
        ]}>
        <View style={{height: rpx(90)}}>
          <Text style={{color: 'white', lineHeight: rpx(90)}}>
            {leftContent.text}
          </Text>
        </View>
      </Animated.View>
      <Animated.View
        {...panResponder.current.panHandlers}
        style={[textContainer, positionRef.current.getLayout()]}>
        <TouchableRipple
          onTouchStart={() => {
            timer.current = setTimeout(() => {
              if (!scrollStopped.current) {
                console.log('开启选择模式');
                props.onStartEdit && props.onStartEdit(true);
              }
            }, 600);
          }}
          onTouchEnd={() => {
            clearTimeout(timer.current);
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              height: rpx(115),
              justifyContent: 'space-between',
              paddingVertical: rpx(15),
              paddingRight: rpx(25),
              paddingLeft: rpx(15),
            }}>
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <View style={{width: rpx(80)}}>
                {props?.isEdit ? (
                  <RadioButton
                    value="first"
                    status="checked"
                    color="#47ab94"
                    // onPress={() => setChecked('first')}
                  />
                ) : (
                  <Icon
                    style={{marginLeft: rpx(10), paddingVertical: rpx(12)}}
                    name="cellphone"
                    size={rpx(55)}
                  />
                )}
              </View>
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                }}>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                  <Text>购物消费</Text>
                  <Text>-</Text>
                  <Text>零食</Text>
                </View>
                <Text variant="bodySmall" style={{color: '9c9c9c'}}>
                  备注
                </Text>
              </View>
            </View>
            <Text style={{color: '#47ab94'}}>+100.00</Text>
          </View>
        </TouchableRipple>
      </Animated.View>
      {/* <Animated.View style={[rightButtonContainer, this.getRightButtonProps()]} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    flexDirection: 'row',
  },
  textContainer: {
    width: '100%',
    backgroundColor: '#fff',
  },
  rightButtonContainer: {
    position: 'absolute',
    left: SCREEN_WIDTH / 1.24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    borderRadius: 7,
    paddingHorizontal: 18,
    paddingVertical: 23,
    elevation: 3,
    backgroundColor: '#D50000',
    zIndex: 1,
  },
  leftButtonContainer: {
    alignItems: 'flex-end',
    paddingRight: rpx(30),
    paddingVertical: rpx(15),
    flex: 1,
    position: 'absolute',
  },
});
