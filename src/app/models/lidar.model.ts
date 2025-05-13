export interface LidarHeader {
  angle_increment: number;
  range_min: number;
  range_max: number;
}

export interface LidarData {
  type: string;
  header: LidarHeader;
  ranges: number[];
  intensities: number[];
}

export interface LidarPoint {
  x: number;
  y: number;
  intensity: number;
}
