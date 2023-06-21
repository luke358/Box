/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import SystemSetting from 'react-native-system-setting';

import {useParams} from '@/entry/router';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  ScaledSize,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Video, {VideoProperties} from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import {WebViewMessageEvent} from 'react-native-webview';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {OnLoadData} from 'react-native-video';
import {OnProgressData} from 'react-native-video';
import Slider from '@react-native-community/slider';
import Loading from '@/components/base/loading';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  Gesture,
  GestureDetector,
  PanGesture,
} from 'react-native-gesture-handler';
import {runOnJS, useSharedValue} from 'react-native-reanimated';
import rpx from '@/utils/rpx';
import {Text} from 'react-native-paper';
import {formatTime} from '@/utils/video';
import {WebviewContext} from '@/entry';
import PluginManager from '@/core/plugins';
import {addCollect, getCollectByDetailUrl} from '@/storage/collect';
import Toast from '@/utils/toast';
import useLatest from '@/hooks/useLatest';
import Volume from './components/Volume';
import Brightness from './components/Brightness';

export type VideoProps = VideoProperties & {
  onCustomPanGesture?: PanGesture;
  doubleTapInterval?: number;
};

export default function Player(props: VideoProps) {
  const {onCustomPanGesture, doubleTapInterval = 500} = props;

  const timerRef = useRef<number>();

  const webviewContext = useContext(WebviewContext);

  const [screenSize, setScreenSize] = useState(Dimensions.get('window'));

  const [html, setHtml] = useState<IPlugin.IVideoCompleteResult | null>();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const currentTimeLatestRef = useLatest(currentTime);

  const params = useParams<'player'>();

  const videoPlayerRef = useRef<Video>(null);

  const isSeeking = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>();
  const [isLoadEnd, setIdLoadEnd] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>();
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [isChangeVolume, setIsChangeVolume] = useState(false);
  const [isChangeBrightness, setIsChangeBrightness] = useState(false);

  const isPressingRef = useSharedValue(false);
  const isPressRateRef = useSharedValue(false);
  const isPressHorizonRef = useSharedValue(false);
  const isPressVerticalRef = useSharedValue(false);
  // 0 左， 1 右， 2 顶部三分之一处防止拉取状态栏时影响到亮度和声音
  const isPressVerticalPart = useSharedValue<0 | 1 | 2 | null>(null);

  const [isShowControl, setIsShowControl] = useState<boolean>(true);

  const toggleIsShowControl = () => {
    if (isShowControl) {
      clearControlTimeout;
    } else {
      setControlTimeout();
    }
    setIsShowControl(!isShowControl);
  };
  const controlRef = useRef<number>();
  const hideControl = () => setIsShowControl(false);
  const showControl = () => setIsShowControl(true);
  const setControlTimeout = () => {
    clearControlTimeout();
    controlRef.current = setTimeout(() => {
      hideControl();
    }, 3000);
  };

  const clearControlTimeout = () => {
    controlRef.current && clearTimeout(controlRef.current);
  };

  const resetControlTimeout = () => {
    clearControlTimeout();

    setControlTimeout();
  };

  const navigation = useNavigation();

  const plugin = PluginManager.getCurrentPlugin();
  const injectedJavaScript = plugin?.instance.videoInjectCode || '';

  const onVideoLoadStart = () => {
    setMsg('加载视频中');
    setIsLoading(true);
  };

  const onVideoLoad = async (loadData: OnLoadData) => {
    setDuration(loadData.duration);
    setIsLoading(false);
    setControlTimeout();

    const collect = await getCollectByDetailUrl(
      plugin!.name,
      params.videoInfo.href,
    );
    // 相同 url 命中历史记录
    if (
      collect &&
      collect?.videoUrl === params.video.href &&
      collect?.currentTime &&
      collect?.index
    ) {
      Toast.success('定位到上次进度');
      seekTo(collect.currentTime);
      setCurrentTime(collect.currentTime);
    }
    // 收藏记录定时器，只有收藏的才做记录
    if (collect) {
      timerRef.current = setInterval(() => {
        _addCollect();
      }, 10000);
    }
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

  const touchDown = () => {
    isPressingRef.value = true;
    setTimeout(() => {
      if (!isPressHorizonRef.value && !isPressVerticalRef.value) {
        if (isPressingRef.value) {
          isPressRateRef.value = true;
          setPlaybackRate(2);
        }
      }
    }, 1000);
  };
  const touchUp = () => {
    isPressingRef.value = false;
    isPressRateRef.value = false;
    isPressHorizonRef.value = false;
    isPressVerticalRef.value = false;
    setPlaybackRate(1);

    setTimeout(() => {
      setIsChangeBrightness(false);
      setIsChangeVolume(false);
    });
  };
  const handleBrightness = async (translationY: number) => {
    const delta = -translationY * 0.0001; // 调整亮度的步进值
    // 修改亮度
    SystemSetting.getAppBrightness().then(currentBrightness => {
      const newBrightness = currentBrightness + delta;
      const clampedBrightness = Math.min(Math.max(newBrightness, 0), 1);
      SystemSetting.setAppBrightness(clampedBrightness);
      setBrightness(() => clampedBrightness);
      setIsChangeBrightness(true);
    });
  };
  const handleVolume = (translationY: number) => {
    const delta = -translationY * 0.0005; // 调整亮度的步进值
    SystemSetting.getVolume().then(currentVolume => {
      console.log(currentVolume);
      const newVolume = currentVolume + delta;
      const clampedBrightness = Math.min(Math.max(newVolume, 0), 1);

      // console.log(newVolume, currentVolume);
      console.log(clampedBrightness);
      SystemSetting.setVolume(clampedBrightness);
      setVolume(() => clampedBrightness);
      setIsChangeVolume(true);
    });
  };

  const defaultPanGesture = Gesture.Pan()
    .onStart(({x, y}) => {
      if (y < screenSize.height / 6) {
        isPressVerticalPart.value = 2;
      } else {
        isPressVerticalPart.value = Number(x < screenSize.width / 2) as 0 | 1;
      }
    })
    .onUpdate(({translationY, translationX, x, y}) => {
      // 判断手势方向
      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (!isPressVerticalRef.value && !isPressRateRef.value) {
          // 水平手势
          // 每 10 个逻辑像素为一个刻度
          const progress = Math.floor(
            Math.min(
              Math.max(translationX / 10 + currentTime, 0),
              duration || 3600,
            ),
          );
          isPressHorizonRef.value = true;
        }
      } else {
        if (!isPressHorizonRef.value && !isPressRateRef.value) {
          // 左边
          if (isPressVerticalPart.value === 0) {
            runOnJS(handleBrightness)(translationY);
          } else if (isPressVerticalPart.value === 1) {
            runOnJS(handleVolume)(translationY);
          }
          isPressVerticalRef.value = true;
        }
      }
    })
    .onTouchesDown(() => {
      runOnJS(touchDown)();
    })
    .onTouchesUp(() => {
      runOnJS(touchUp)();
    });

  const onPanGesture = onCustomPanGesture
    ? onCustomPanGesture
    : defaultPanGesture;

  const singleTapHandler = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      if (!isShowControl) {
        runOnJS(setControlTimeout)();
      }
      runOnJS(toggleIsShowControl)();
    }
  });

  const doubleTapHandle = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(doubleTapInterval)
    .onEnd(({x, y, numberOfPointers}, success) => {
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
    const result = event.nativeEvent.data;
    setHtml(plugin?.instance.videoComplete({result}) || JSON.parse(result));
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

  const _addCollect = async () => {
    const res = await addCollect(plugin!.name, {
      videoUrl: params?.video?.href,
      index: params?.video?.title,
      detailUrl: params?.videoInfo.href,
      title: params?.videoInfo?.title,
      pic: params?.videoInfo?.pic,
      currentTime: currentTimeLatestRef.current,
    });
    console.log(res, '保存进度', {
      videoUrl: params?.video?.href,
      index: params?.video?.title,
      detailUrl: params?.videoInfo.href,
      title: params?.videoInfo?.title,
      pic: params?.videoInfo?.pic,
      currentTime: currentTimeLatestRef.current,
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        _addCollect();
      }
    };
  }, []);

  useEffect(() => {
    webviewContext?.webviewRef.current?.stopLoading;
    webviewContext!.methodsRef.current!.onMessage = onMessage;
    webviewContext!.methodsRef.current!.onLoadStart = onLoadStart;
    webviewContext!.methodsRef.current!.onLoadEnd = onLoadEnd;

    SystemSetting.getBrightness().then(b => {
      setBrightness(b);
    });

    SystemSetting.getVolume().then(initVolume => {
      setVolume(initVolume);
    });

    webviewContext?.setUrl(params?.video.href);
    webviewContext?.webviewRef.current?.reload();

    return () => {
      webviewContext!.methodsRef.current!.onMessage = () => {};
      webviewContext!.methodsRef.current!.onLoadStart = () => {};
      webviewContext!.methodsRef.current!.onLoadEnd = () => {};

      // app 同步为系统亮度
      SystemSetting.setAppBrightness(-1);
    };
  }, []);

  useEffect(() => {
    // 在组件挂载时锁定屏幕方向为横屏
    StatusBar.setHidden(true, 'fade');

    const handleDimensionsChange = ({window}: {window: ScaledSize}) => {
      setScreenSize(window);
    };
    Orientation.lockToLandscape();
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    // 订阅屏幕尺寸变化
    Dimensions.addEventListener('change', handleDimensionsChange);

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
    <>
      <GestureDetector gesture={gesture}>
        {/* video loading */}
        <View style={styles.appWrapper}>
          {isLoading && <Loading text={msg} />}
          {html && (
            <>
              <Video
                ref={videoPlayerRef}
                rate={playbackRate}
                source={{uri: decodeURIComponent(html.videoUrl)}}
                style={{
                  width: Dimensions.get('window').width,
                  height: isLoading ? 0 : Dimensions.get('window').height,
                }}
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
            </>
          )}
        </View>
      </GestureDetector>
      <>
        {/* brightness */}
        {isChangeBrightness && <Brightness brightness={brightness} />}

        {/* volume */}
        {isChangeVolume && <Volume volume={volume} />}

        {/* controls */}
        {isShowControl && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              height: Dimensions.get('window').height,
              width: Dimensions.get('window').width,
              alignItems: 'center',
              paddingHorizontal: rpx(30),
            }}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                height: rpx(100),
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                paddingHorizontal: rpx(20),
              }}>
              <Icon
                name="arrow-left"
                color="#fff"
                size={rpx(50)}
                onPress={handleBackPress}
              />
              <Text style={{color: '#fff'}}>
                斗破苍穹年饭-第8集 {screenSize.width}
              </Text>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                height: rpx(130),
                width: '100%',
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
                  alignItems: 'center',
                  height: rpx(120),
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Icon
                    onPress={e => {
                      resetControlTimeout();
                      setPaused(!paused);
                    }}
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
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
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
                  {/* 从 detail 跳过来的时候可以带过来 */}
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
          </View>
        )}
      </>
    </>
  );
}

const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
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
