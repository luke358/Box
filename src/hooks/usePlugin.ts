import PluginManager from '@/core/plugins';

export default function usePlugin() {
  const plugin = PluginManager.getCurrentPlugin();
  return plugin;
}
