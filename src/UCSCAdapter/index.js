import {
  ConfigurationSchema,
  readConfObject,
} from "@jbrowse/core/configuration";
import { ObservableCreate } from "@jbrowse/core/util/rxjs";
import { BaseFeatureDataAdapter } from "@jbrowse/core/data_adapters/BaseAdapter";
import SimpleFeature from "@jbrowse/core/util/simpleFeature";
import stringify from "json-stable-stringify";

export const configSchema = ConfigurationSchema(
  "UCSCAdapter",
  {
    base: {
      type: "fileLocation",
      description: "base URL for the UCSC API",
      defaultValue: {
        uri: "https://api.genome.ucsc.edu",
      },
    },
    track: {
      type: "string",
      description: "the track to select data from",
      defaultValue: "",
    },
  },
  { explicitlyTyped: true },
);

export class AdapterClass extends BaseFeatureDataAdapter {
  constructor(config) {
    super(config);
    this.config = config;
  }

  getFeatures(region) {
    const { assemblyName, start, end, refName } = region;
    return ObservableCreate(async observer => {
      const { uri } = readConfObject(this.config, "base");
      const track = readConfObject(this.config, "track");
      try {
        const result = await fetch(
          `${uri}/getData/track?` +
            `genome=${assemblyName};track=${track};` +
            `chrom=${refName};start=${start};end=${end}`,
        );
        if (!result.ok) {
          throw new Error(
            `Failed to fetch ${result.status} ${result.statusText}`,
          );
        }
        const data = await result.json();
        data[track].forEach(feature => {
          const data = {
            ...feature,
            start: feature.chromStart || feature.tStart || feature.genoStart,
            end: feature.chromEnd || feature.tEnd || feature.genoEnd,
            refName: feature.chrom || feature.genoName || feature.tName,
            uniqueId: stringify(feature),
          };
          if (data.blockCount) {
            data.chromStarts = data.chromStarts.split(",").map(i => +i);
            data.blockSizes = data.blockSizes.split(",").map(i => +i);
            data.subfeatures = [];
            for (let i = 0; i < +data.blockCount; i++) {
              data.subfeatures.push({
                start: data.start + data.chromStarts[i],
                end: data.start + data.chromStarts[i] + data.blockSizes[i],
              });
            }
          }
          observer.next(new SimpleFeature(data));
        });
        observer.complete();
      } catch (e) {
        observer.error(e);
      }
    });
  }

  async getRefNames() {
    const arr = [];
    for (let i = 0; i < 23; i++) {
      arr.push(`chr${i}`);
    }
    return arr;
  }

  freeResources() {}
}
