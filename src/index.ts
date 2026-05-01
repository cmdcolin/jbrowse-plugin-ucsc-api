import Plugin from "@jbrowse/core/Plugin"
import AdapterType from "@jbrowse/core/pluggableElementTypes/AdapterType"

import { AdapterClass, configSchema } from "./UCSCAdapter"
import { version } from "../package.json"

export default class UCSCPlugin extends Plugin {
  name = "UCSCPlugin"
  version = version
  install(pluginManager: any) {
    pluginManager.addAdapterType(
      () =>
        new AdapterType({
          name: "UCSCAdapter",
          configSchema,
          AdapterClass,
        }),
    )
  }
}
