/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {useParams} from '@/entry/router';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Video, {VideoProperties} from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {OnLoadData} from 'react-native-video';
import {OnProgressData} from 'react-native-video';
import Slider from '@react-native-community/slider';
import Loading from '@/components/base/loading';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import code from '@/plugins/injectJavaScript';

import {
  Gesture,
  GestureDetector,
  PanGesture,
} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import rpx from '@/utils/rpx';
import {Text} from 'react-native-paper';
import {formatTime} from '@/utils/video';
import {WebviweContext} from '@/entry';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: height,
    height: width,
  },
  webviewWrapper: {
    display: 'none',
  },
  buttonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});

export type VideoProps = VideoProperties & {
  onCustomPanGesture?: PanGesture;
  doubleTapInterval?: number;
};

export default function Player(props: VideoProps) {
  const {onCustomPanGesture, doubleTapInterval = 500} = props;

  const webviewContext = useContext(WebviweContext);

  const [html, setHtml] = useState<any>();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const params = useParams<'player'>();

  const webviewRef = useRef<WebView>(null);
  const videoPlayerRef = useRef<Video>(null);

  const isSeeking = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>();
  const [isLoadEnd, setIdLoadEnd] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>();

  const navigation = useNavigation();

  const injectedJavaScript = code.yhdm.videoCode;

  const onVideoLoadStart = () => {
    setMsg('加载视频中');
    setIsLoading(true);
  };

  const onVideoLoad = (loadData: OnLoadData) => {
    setDuration(loadData.duration);
    setIsLoading(false);
  };

  const onVideoEnd = () => {
    setIdLoadEnd(true);
    setPaused(true);
  };

  const onProgress = (progress: OnProgressData) => {
    setCurrentTime(progress.currentTime);
  };

  const seekTo = (time: number = 0) => {
    setCurrentTime(time);
    videoPlayerRef.current?.seek(time);
  };

  const seekByStep = (isBack = false) => {
    seekTo(currentTime - (isBack ? 10 : -10));
  };

  const handleBackPress = () => {
    // 返回上一页时恢复屏幕方向为竖屏
    Orientation.lockToPortrait();

    // 导航返回
    navigation.goBack();
    return true;
  };

  const defalutPanGesture = Gesture.Pan()
    .onStart(({velocityY, velocityX}) => {
      // panIsVertical.value = Math.abs(velocityY) > Math.abs(velocityX);
    })
    .onUpdate(({translationY}) => {
      // controlViewOpacity.value = withTiming(0, {duration: 100});
      // if (isFullScreen.value) {
      //   if (translationY > 0 && Math.abs(translationY) < 100) {
      //     videoScale.value = clamp(0.9, 1 - Math.abs(translationY) * 0.008, 1);
      //     videoTransY.value = translationY;
      //   }
      // } else {
      //   if (translationY < 0 && Math.abs(translationY) < 40) {
      //     videoScale.value = Math.abs(translationY) * 0.012 + 1;
      //   }
      // }
    })
    .onEnd(({translationY}, success) => {
      // if (!panIsVertical.value && !success) {
      //   return;
      // }
      // if (isFullScreen.value) {
      //   if (translationY >= 100) {
      //     runOnJS(exitFullScreen)();
      //   }
      // } else {
      //   if (-translationY >= 40) {
      //     runOnJS(enterFullScreen)();
      //   }
      // }
      // videoTransY.value = 0;
      // videoScale.value = withTiming(1);
    });

  const onPanGesture = onCustomPanGesture
    ? onCustomPanGesture
    : defalutPanGesture;

  const singleTapHandler = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      // if (controlViewOpacity.value === 0) {
      //   controlViewOpacity.value = withTiming(1, controlAnimteConfig);
      //   setControlTimeout();
      // } else {
      //   controlViewOpacity.value = withTiming(0, controlAnimteConfig);
      // }
    }
  });

  const doubleTapHandle = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(doubleTapInterval)
    .onEnd(({x, y, numberOfPointers}, success) => {
      console.log(x, y, numberOfPointers, success);
      if (success) {
        if (numberOfPointers !== 1) {
          return;
        }
        // 双击暂停
        runOnJS(setPaused)(!paused);
      }
    });

  const taps = Gesture.Exclusive(doubleTapHandle, singleTapHandler);
  const gesture = Gesture.Race(onPanGesture, taps);

  const onSlidingStart = () => {};

  const onSlidingComplete = (val: number) => {
    isSeeking.current = true;
    seekTo(val);
  };

  const onMessage = (event: WebViewMessageEvent) => {
    const receivedHtml = event.nativeEvent.data;
    setHtml(receivedHtml);
  };

  const onLoadStart = () => {
    setIsLoading(true);
    setMsg('解析 webview 中');
  };

  const onLoadEnd = () => {
    setIsLoading(false);
    webviewContext?.webviewRef.current?.injectJavaScript(injectedJavaScript);
    webviewContext?.webviewRef.current?.stopLoading;
  };

  useEffect(() => {
    webviewContext?.webviewRef.current?.stopLoading;
    webviewContext!.methodsRef.current!.onMessage = onMessage;
    webviewContext!.methodsRef.current!.onLoadStart = onLoadStart;
    webviewContext!.methodsRef.current!.onLoadEnd = onLoadEnd;

    webviewContext?.setUrl(params.href);
    webviewContext?.webviewRef.current?.reload();
    () => {
      webviewContext!.methodsRef.current!.onMessage = () => {};
      webviewContext!.methodsRef.current!.onLoadStart = () => {};
    };
  }, []);

  useEffect(() => {
    // 在组件挂载时锁定屏幕方向为横屏
    StatusBar.setHidden(true, 'fade');

    Orientation.lockToLandscape();
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    // 在组件卸载时解除屏幕方向的锁定
    return () => {
      Orientation.lockToPortrait();
      backHandler.remove();
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // 在页面聚焦时锁定屏幕方向为横屏
      Orientation.lockToLandscape();

      // 在页面失去焦点时解除屏幕方向的锁定
      return () => {
        Orientation.lockToPortrait();
      };
    }, []),
  );

  return (
    <GestureDetector gesture={gesture}>
      {/* video loading */}
      <View style={styles.appWrapper}>
        {isLoading && <Loading text={msg} />}
        {html && (
          <>
            <Video
              ref={videoPlayerRef}
              source={{uri: decodeURIComponent(html)}}
              style={[
                styles.video,
                {
                  width: Dimensions.get('window').width,
                  height: isLoading ? 0 : Dimensions.get('window').height,
                },
              ]}
              resizeMode="contain"
              fullscreenAutorotate={true}
              // controls={true}
              playInBackground={false}
              onLoadStart={onVideoLoadStart}
              onLoad={onVideoLoad}
              onEnd={onVideoEnd}
              onProgress={onProgress}
              paused={paused}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                height: rpx(130),
                width: Dimensions.get('window').width,
                alignItems: 'center',
                paddingHorizontal: rpx(30),
                marginBottom: rpx(0),
              }}>
              {duration && duration > 0 && (
                <View style={{flexDirection: 'row'}}>
                  <Text style={{color: '#fff', width: rpx(120)}}>
                    {formatTime(currentTime)}
                  </Text>
                  <Slider
                    style={{flex: 1}}
                    minimumValue={0}
                    value={currentTime}
                    onSlidingStart={onSlidingStart}
                    onSlidingComplete={onSlidingComplete}
                    maximumValue={duration}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="#000000"
                  />
                  <Text style={{color: '#fff', width: rpx(120)}}>
                    {formatTime(duration)}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  height: rpx(120),
                  width: '100%',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Icon
                    onPress={() => setPaused(!paused)}
                    style={{
                      marginLeft: rpx(10),
                      paddingVertical: rpx(12),
                      color: '#fff',
                    }}
                    name={
                      paused ? 'play-circle-outline' : 'pause-circle-outline'
                    }
                    size={rpx(70)}
                  />
                  <Icon
                    style={{
                      marginLeft: rpx(10),
                      paddingVertical: rpx(12),
                      color: '#fff',
                    }}
                    name="arrow-right-bold-circle-outline"
                    size={rpx(70)}
                  />
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      width: rpx(100),
                      textAlign: 'center',
                      color: '#fff',
                    }}>
                    倍速
                  </Text>
                  <Text
                    style={{
                      width: rpx(100),
                      textAlign: 'center',
                      color: '#fff',
                    }}>
                    画面
                  </Text>
                  <Text
                    style={{
                      width: rpx(100),
                      textAlign: 'center',
                      color: '#fff',
                    }}>
                    选集
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </GestureDetector>
  );
}
