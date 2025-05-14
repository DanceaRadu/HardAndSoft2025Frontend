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
  robot_x?: number;
  robot_y?: number;
  orientation?: number;
}

export interface LidarPoint {
  x: number;
  y: number;
  intensity: number;
}
