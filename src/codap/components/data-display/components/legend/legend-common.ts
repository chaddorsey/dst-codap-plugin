export interface IBaseLegendProps {
  layerIndex: number
  setDesiredExtent: (layerIndex: number, extent: number) => void
  partitionMethod?: 'quantile' | 'quantize'
}
