import {StatusBar} from 'react-native';

async function _bootstrap() {
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setTranslucent(true);
}

export default async function () {
  try {
    await _bootstrap();
  } catch (e) {
    // errorLog('初始化出错', e);
    console.log(e);
  }
  // 隐藏开屏动画
  console.log('HIDE');
  // RNBootSplash.hide({fade: true});
}
