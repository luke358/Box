import {StatusBar} from 'react-native';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import 'react-native-get-random-values';

import pathConst from '@/constants/pathConst';
import {checkAndCreateDir} from '@/utils/fileUtils';
import PluginManager from '@/core/plugins';
/** 初始化 */
async function setupFolder() {
  await Promise.all([
    // checkAndCreateDir(pathConst.dataPath),
    // checkAndCreateDir(pathConst.logPath),
    // checkAndCreateDir(pathConst.cachePath),
    checkAndCreateDir(pathConst.pluginPath),
    // checkAndCreateDir(pathConst.lrcCachePath),
    // checkAndCreateDir(pathConst.downloadPath).then(() => {
    //     checkAndCreateDir(pathConst.downloadMusicPath);
    // }),
  ]);
}
async function _bootstrap() {
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setTranslucent(true);

  // 1. 初始化权限
  // 1. 检查权限
  const [readStoragePermission, writeStoragePermission] = await Promise.all([
    check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE),
    check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE),
  ]);
  if (
    !(
      readStoragePermission === 'granted' &&
      writeStoragePermission === 'granted'
    )
  ) {
    await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
  }

  // 2. 初始化数据
  // 文件夹
  await setupFolder();
  await PluginManager.setup();
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
