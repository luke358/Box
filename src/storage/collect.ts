import {getStorage, setStorage} from '@/utils/storage';

export interface ICollect {
  detailUrl: string;
  title: string;
  index?: string;
  currentTime?: number;
  videoUrl?: string;
  pic: string;
}

export async function getCollect(pluginName: string) {
  return (await getStorage<ICollect[]>(`${pluginName}-collect`)) ?? [];
}

export async function getCollectByDetailUrl(
  pluginName: string,
  detailUrl: string,
) {
  // const coll;
}

export async function addCollect(pluginName: string, collect: ICollect) {
  let collectList = await getCollect(`${pluginName}-collect`);
  collectList = [collect].concat(
    collectList.filter(_ => _.detailUrl !== collect.detailUrl),
  );
  return await setStorage(`${pluginName}-collect`, collectList);
}

export async function removeCollect(pluginName: string, detailUrl: string) {
  let collectList = await getCollect(`${pluginName}-collect`);
  collectList = collectList.filter(_ => _.detailUrl !== detailUrl);
  return await setStorage(`${pluginName}-collect`, collectList);
}

export async function removeAllCollect(pluginName: string) {
  await setStorage(`${pluginName}-collect`, []);
}
