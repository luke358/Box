import {useNavigation, useRoute} from '@react-navigation/native';
import {useCallback} from 'react';
import Home from '../pages/home';
import Detail from '../pages/detail';
import Player from '../pages/player';
import Search from '../pages/search';
import Media from '../pages/media';
import {LogBox} from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

/** 路由key */
export const ROUTE_PATH = {
  /** 主页 */
  HOME: 'home',
  INFO: 'info',
  CHART: 'chart',
  MINE: 'mine',
  // 添加记账
  ADDRECORD: 'addRecord',
  // 详情页面
  DETAIL: 'detail',
  PLAYER: 'player',
  SEARCH: 'search',
  MEDIA: 'media',
} as const;

type Valueof<T> = T[keyof T];
type RoutePaths = Valueof<typeof ROUTE_PATH>;

type IRoutes = {
  path: RoutePaths;
  component: (...args: any[]) => JSX.Element;
};

export const routes: Array<IRoutes> = [
  {
    path: ROUTE_PATH.HOME,
    component: Home,
  },
  {
    path: ROUTE_PATH.DETAIL,
    component: Detail,
  },
  {
    path: ROUTE_PATH.PLAYER,
    component: Player,
  },
  {
    path: ROUTE_PATH.SEARCH,
    component: Search,
  },
  {
    path: ROUTE_PATH.MEDIA,
    component: Media,
  },
];

type RouterParamsBase = Record<RoutePaths, any>;
/** 路由参数 */
interface RouterParams extends RouterParamsBase {
  home: undefined;
  mine: undefined;
  chart: undefined;
  info: undefined;
  detail: {href: string; pic: string; title: string};
  player: {href: string; title: string};
  search: undefined;
}

/** 路由参数Hook */
export function useParams<T extends RoutePaths>(): RouterParams[T] {
  const route = useRoute<any>();

  const routeParams = route?.params as RouterParams[T];
  return routeParams;
}

/** 导航 */
export function useNavigate() {
  const navigation = useNavigation<any>();

  const navigate = useCallback(
    function <T extends RoutePaths>(route: T, params?: RouterParams[T]) {
      navigation.navigate(route, params);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return navigate;
}
