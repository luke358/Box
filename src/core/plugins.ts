import pathConst from '@/constants/pathConst';
import CookieManager from '@react-native-cookies/cookies';
import axios from 'axios';
import CryptoJs from 'crypto-js';
import {nanoid} from 'nanoid';
import {writeFile, unlink, readDir, readFile} from 'react-native-fs';
import {compare} from 'compare-versions';
import {ToastAndroid} from 'react-native';

const sha256 = CryptoJs.SHA256;

export enum PluginStateCode {
  /** 版本不匹配 */
  VersionNotMatch = 'VERSION NOT MATCH',
  /** 无法解析 */
  CannotParse = 'CANNOT PARSE',
}

const packages: Record<string, any> = {
  'crypto-js': CryptoJs,
  axios: axios,
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
        searchComplete: () => null,
        detailComplete: () => null,
        videoComplete: () => null,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
async function setup() {
  const _plugins: Array<Plugin> = [];
  try {
    // 加载插件
    const pluginsPaths = await readDir(pathConst.pluginPath);
    for (let i = 0; i < pluginsPaths.length; ++i) {
      const _pluginUrl = pluginsPaths[i];
      // trace('初始化插件', _pluginUrl);
      if (
        _pluginUrl.isFile() &&
        (_pluginUrl.name?.endsWith?.('.js') ||
          _pluginUrl.path?.endsWith?.('.js'))
      ) {
        const funcCode = await readFile(_pluginUrl.path, 'utf8');
        const plugin = new Plugin(funcCode, _pluginUrl.path);
        const _pluginIndex = _plugins.findIndex(p => p.hash === plugin.hash);
        if (_pluginIndex !== -1) {
          // 重复插件，直接忽略
          continue;
        }
        plugin.hash !== '' && _plugins.push(plugin);
      }
    }

    plugins = _plugins;
    // pluginStateMapper.notify();
    /** 初始化meta信息 */
    // PluginMeta.setupMeta(plugins.map(_ => _.name));
  } catch (e: any) {
    ToastAndroid.show(`插件初始化失败:${e?.message ?? e}`, ToastAndroid.LONG);
    // errorLog('插件初始化失败', e?.message);
    throw e;
  }
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

async function installPluginFromUrl(url: string) {
  try {
    const funcCode = (await axios.get(url)).data;
    if (funcCode) {
      const plugin = new Plugin(funcCode, '');
      const _pluginIndex = plugins.findIndex(p => p.hash === plugin.hash);
      if (_pluginIndex !== -1) {
        // 静默忽略
        return;
      }
      const oldVersionPlugin = plugins.find(p => p.name === plugin.name);
      if (oldVersionPlugin) {
        if (
          compare(
            oldVersionPlugin.instance.version ?? '',
            plugin.instance.version ?? '',
            '>',
          )
        ) {
          throw new Error('已安装更新版本的插件');
        }
      }

      if (plugin.hash !== '') {
        const fn = nanoid();
        const _pluginPath = `${pathConst.pluginPath}${fn}.js`;
        await writeFile(_pluginPath, funcCode, 'utf8');
        plugin.path = _pluginPath;
        plugins = plugins.concat(plugin);
        if (oldVersionPlugin) {
          plugins = plugins.filter(_ => _.hash !== oldVersionPlugin.hash);
          try {
            await unlink(oldVersionPlugin.path);
          } catch {}
        }
        // pluginStateMapper.notify();
        return;
      }
      throw new Error('插件无法解析!');
    }
  } catch (e: any) {
    // devLog('error', 'URL安装插件失败', e, e?.message);
    // errorLog('URL安装插件失败', e);
    throw new Error(e?.message ?? '');
  }
}
const PluginManager = {
  setup,
  setCurrentPlugin,
  getCurrentPlugin,
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
