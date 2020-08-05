import UCSCAdapterF from './UCSCAdapter'
export default class UCSCPlugin {
  name = 'UCSCPlugin'
  install(pluginManager: any) {
    UCSCAdapterF(pluginManager)
  }
}
