import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setStorage(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value, null, ''));
    return true;
  } catch (e: any) {
    // errorLog(`存储失败${key}`, e?.message);
    return false;
  }
}

export async function getStorage<T>(key: string): Promise<T | null> {
  try {
    const result = await AsyncStorage.getItem(key);
    if (result) {
      return JSON.parse(result);
    }
  } catch {}
  return null;
}

export async function getMultiStorage(keys: string[]) {
  if (keys.length === 0) {
    return [];
  }
  const result = await AsyncStorage.multiGet(keys);

  return result.map(_ => {
    try {
      if (_[1]) {
        return JSON.parse(_[1]);
      }
      return null;
    } catch {
      return null;
    }
  });
}

export async function removeStorage(key: string) {
  return AsyncStorage.removeItem(key);
}
