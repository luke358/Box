import CookieManager from '@react-native-cookies/cookies';
import CryptoJs from 'crypto-js';

const sha256 = CryptoJs.SHA256;

export enum PluginStateCode {
  /** 版本不匹配 */
  VersionNotMatch = 'VERSION NOT MATCH',
  /** 无法解析 */
  CannotParse = 'CANNOT PARSE',
}

const packages: Record<string, any> = {
  'crypto-js': CryptoJs,

  '@react-native-cookies/cookies': CookieManager,
};
const _require = (packageName: string) => {
  let pkg = packages[packageName];
  pkg.default = pkg;
  return pkg;
};

const _consoleBind = function (
  method: 'log' | 'error' | 'info' | 'warn',
  ...args: any
) {
  const fn = console[method];
  if (fn) {
    fn(...args);
    // devLog(method, ...args);
  }
};

const _console = {
  log: _consoleBind.bind(null, 'log'),
  warn: _consoleBind.bind(null, 'warn'),
  info: _consoleBind.bind(null, 'info'),
  error: _consoleBind.bind(null, 'error'),
};
export class Plugin {
  /** 插件名 */
  public name: string;
  /** 插件的hash，作为唯一id */
  public hash: string;
  /** 插件状态：激活、关闭、错误 */
  public state: 'enabled' | 'disabled' | 'error';
  /** 插件支持的搜索类型 */
  public supportedSearchType?: string;
  /** 插件状态信息 */
  public stateCode?: PluginStateCode;
  /** 插件的实例 */
  public instance: IPlugin.IPluginInstance;
  /** 插件路径 */
  public path: string;
  /** 用户输入 */
  public userEnv?: Record<string, string>;

  /** 插件方法 */
  public methods: PluginMethods;

  constructor(
    funcCode: string | (() => IPlugin.IPluginInstance),
    pluginPath: string,
  ) {
    this.state = 'enabled';
    let _instance: IPlugin.IPluginInstance;
    this.path = pluginPath;

    try {
      if (typeof funcCode === 'string') {
        const _module: any = {exports: {}};
        // eslint-disable-next-line no-new-func
        _instance = Function(`
            'use strict';
            return function(require, module, exports, console) {
                ${funcCode}
            }
          `)()(_require, _module, _module.exports, _console);
        if (_module.exports.default) {
          _instance = _module.exports.default as IPlugin.IPluginInstance;
        } else {
          _instance = _module.exports as IPlugin.IPluginInstance;
        }
      } else {
        _instance = funcCode();
      }
    } catch (e: any) {
      this.state = 'error';

      _instance = e?.instance ?? {
        _path: '',
        platform: '',
        appVersion: '',
        searchComplete: () => {
          return null;
        },
      };
    }

    this.instance = _instance;

    this.name = _instance.platform;

    if (this.instance.platform === '') {
      this.hash = '';
    } else {
      if (typeof funcCode === 'string') {
        this.hash = sha256(funcCode).toString();
      } else {
        this.hash = sha256(funcCode.toString()).toString();
      }
    }

    this.methods = new PluginMethods(this);
  }
}
class PluginMethods implements IPlugin.IPluginInstanceMethods {
  private plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }
  searchComplete({
    result,
  }: {
    result: string;
  }): IPlugin.ISearchCompleteResult | null {
    console.log('test');
    return this.plugin?.instance.searchComplete?.({result}) || null;
  }

  // type IDetailCompleteFunc = ({result}: {result: string}) => IDetailItem[];

  detailComplete({result}: {result: string}): IPlugin.IDetailItem[] | null {
    return this.plugin?.instance.detailComplete?.({result}) || null;
  }

  videoComplete({
    result,
  }: {
    result: string;
  }): IPlugin.IVideoCompleteResult | null {
    return this.plugin?.instance.videoComplete?.({result}) || null;
  }
}

let funcCode = `
module.exports = {
  platform: '樱花动漫',
  searchInjectCode: \`
        const lis = document.querySelectorAll('li.item')
        const data = Array.from(lis).map(li => {
          const href = li.querySelector('a').href;
          const imgblock = li.querySelector('.imgblock');
          const computedStyle = getComputedStyle(imgblock);
          const backgroundImage = computedStyle.getPropertyValue('background-image');
          
          const urlStartIndex = backgroundImage.indexOf('url("') + 5;
          const urlEndIndex = backgroundImage.lastIndexOf('")');
          const pic = backgroundImage.slice(urlStartIndex, urlEndIndex);
      
          const title = li.querySelector('.itemtext').textContent
          return {
            href,pic,title
          }
        });
        // alert(document.documentElement.innerHTML);
        window.ReactNativeWebView.postMessage(JSON.stringify({data, isEnd: true}));
  \`,
    searchUrl: 'https://www.yhdmz.org/s_all?ex=1&kw={{kw}}', 
    searchComplete: ({result}) => JSON.parse(result),
    detailInjectCode: \`
      const uls = document.querySelectorAll('#play_tabs .main0 .movurl ul')
    
      const data = Array.from(uls).map(ul => {
        const als = ul.querySelectorAll('li a')
      return {
        title: 'xxx',
        data: Array.from(als).map(a => ({href: a.href, title: a.textContent}))
      }
      })
    
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
      \`,
    detailComplete: ({result}) => JSON.parse(result),
    videoInjectCode: \`
      const iframeSrc = document.querySelector('iframe').src;
      const videoUrl = iframeSrc.match(/url=(.*)/)[1];
      window.ReactNativeWebView.postMessage(JSON.stringify({videoUrl}));
    \`,
    videoComplete: ({result}) => JSON.parse(result),
}
`;

let plugins: Array<Plugin> = [];
let currentPlugin: Plugin | null = null;
export function setup() {
  const _plugins: Array<Plugin> = [];

  const plugin = new Plugin(funcCode, 'xxx');

  console.log(plugin);
  _plugins.push(plugin);
  plugins = _plugins;
}

function setCurrentPlugin(plugin: Plugin) {
  currentPlugin = plugins.find(p => p.hash === plugin.hash) || null;
}
function getCurrentPlugin() {
  return currentPlugin;
}

function getEnablePlugins() {
  return plugins.filter(_ => _.state === 'enabled' && _.instance.searchUrl);
}

function installPluginFromUrl() {}
const PluginManager = {
  setup,
  setCurrentPlugin,
  getCurrentPlugin,
  currentPlugin,
  getEnablePlugins,
  // installPlugin,
  installPluginFromUrl,
  // updatePlugin,
  // uninstallPlugin,
  // getByMedia,
  // getByHash,
  // getByName,
  // getValidPlugins,
  // getSearchablePlugins,
  // getSortedSearchablePlugins,
  // usePlugins: pluginStateMapper.useMappedState,
  // useSortedPlugins,
  // uninstallAllPlugins,
};

export default PluginManager;
