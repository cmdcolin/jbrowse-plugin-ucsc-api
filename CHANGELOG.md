# v1.0.4

- Fix the build: `json-stable-stringify` was never a dependency
- Split bigGenePred transcripts such as hg38 `knownGene` into CDS and UTRs, and
  label genes by gene name
- Show the error UCSC returns, such as a protected-data refusal, instead of the
  bare HTTP status
- Add a `genome` option for assemblies whose name is not the UCSC genome, and
  list that genome's chromosomes instead of chr0-chr22
- Add a `maxItems` option; a region holding more features asks to zoom in
- Cancel fetches JBrowse no longer needs
- Keep features that start at position 0
- Colour features from itemRgb and bigInteract color columns
- Label RepeatMasker features by repeat name
- Demo config shows the GeneHancer, COSMIC and DECIPHER tracks
- Publish from CI with npm trusted publishing

# v1.0.3

- Parse the start/end from tStart/tEnd or genoStart/genoEnd for more track type support
- Add support for subfeatures using the blockStart/blockEnd notion
- Add support for knownGene track

# v1.0.2

- Update distconfig

# v1.0.1

- Remove cors-anywhere proxy usage in default config
- Add error handling for !result.ok
- Avoid double slash

# v1.0.0

- Initial release of UCSC API data adapter
- Uses new tsdx based plugin build system
- Based on the tutorial plugin from BCC2020
