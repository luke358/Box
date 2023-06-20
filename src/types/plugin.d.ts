declare namespace IPlugin {
  interface ISearchCompleteResultItem {
    href: string;
    pic: string;
    title: string;
  }

  interface IDetailItem {
    href: string;
    title: string;
  }

  interface IDetailCompleteResultItem {
    title: string;
    data: IDetailItem[];
  }
  type IDetailCompleteResult = IDetailCompleteResultItem[];
  type IDetailCompleteFunc = ({
    result,
  }: {
    result: string;
  }) => IDetailCompleteResult | null;

  interface IVideoCompleteResult {
    videoUrl: string;
  }

  type IVideoCompleteFunc = ({
    result,
  }: {
    result: string;
  }) => IVideoCompleteResult | null;

  interface ISearchCompleteResult {
    data: ISearchCompleteResultItem[];
    isEnd: boolean;
  }
  type ISearchCompleteFunc = ({
    result,
  }: {
    result: string;
  }) => ISearchCompleteResult | null;

  interface IUserEnv {
    key: string;
    name: string;
  }
  interface IPluginDefine {
    platform: string;
    /** 匹配的版本号 */
    appVersion?: string;
    /** 插件版本 */
    version?: string;
    /** 远程更新的url */
    srcUrl?: string;
    /** 主键，会被存储到mediameta中 */
    // primaryKey?: string[];
    /** 插件缓存控制 */
    // cacheControl?: 'cache' | 'no-cache' | 'no-store';
    /** 用户自定义输入 */
    userEnv?: IUserEnv[];
    /** 搜索 webview url */
    searchUrl?: string;
    searchInjectCode?: string;
    searchComplete?: ISearchCompleteFunc;
    detailInjectCode: string;
    detailComplete: IDetailCompleteFunc;
    videoInjectCode: string;
    videoComplete: IVideoCompleteFunc;
  }

  export interface IPluginInstance extends IPluginDefine {
    /** 内部属性 */
    /** 插件路径 */
    _path: string;
  }
  type R = Required<IPluginInstance>;

  type IPluginInstanceMethods = {
    [K in keyof R as R[K] extends (...args: any) => any ? K : never]: R[K];
  };
}
