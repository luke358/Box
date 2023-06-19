import {Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const maxWindowEdge = Math.max(windowHeight, windowWidth);

export default function (rpx: number) {
  return (rpx / 750) * windowWidth;
}

export function vh(pct: number) {
  return (pct / 100) * Dimensions.get('window').height;
}

export function vmax(pct: number) {
  return (pct / 100) * maxWindowEdge;
}
