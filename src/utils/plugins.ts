import PluginManager from '@/core/plugins';
import {addRandomHash} from './fileUtils';
import axios from 'axios';

interface IInstallResult {
  code: 'success' | 'fail';
  message?: string;
}
export async function installPluginFromUrl(
  text: string,
): Promise<IInstallResult> {
  try {
    let urls: string[] = [];
    const iptUrl = addRandomHash(text.trim());
    if (text.endsWith('.json')) {
      const jsonFile = (await axios.get(iptUrl)).data;
      /**
       * {
       *     plugins: [{
       *          version: xxx,
       *          url: xxx
       *      }]
       * }
       */
      urls = (jsonFile?.plugins ?? []).map((_: any) => addRandomHash(_.url));
    } else {
      urls = [iptUrl];
    }
    const failedPlugins: Array<string> = [];
    await Promise.all(
      urls.map(url =>
        PluginManager.installPluginFromUrl(url).catch(e => {
          failedPlugins.push(e?.message ?? '');
        }),
      ),
    );
    if (failedPlugins.length) {
      throw new Error(failedPlugins.join('\n'));
    }
    return {
      code: 'success',
    };
  } catch (e: any) {
    return {
      code: 'fail',
      message: e?.message,
    };
  }
}
