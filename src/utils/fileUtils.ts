import {exists, mkdir} from 'react-native-fs';

export function addRandomHash(url: string) {
  if (url.indexOf('#') === -1) {
    return `${url}#${Date.now()}`;
  }
  return url;
}

export async function checkAndCreateDir(path: string) {
  const filePath = path;
  try {
    if (!(await exists(filePath))) {
      await mkdir(filePath);
    }
  } catch (e) {
    // errorLog('无法初始化目录', {path, e});
  }
}
