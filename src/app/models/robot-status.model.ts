export interface SensorData {
  hall: boolean;
  ultrasonic: number;
}

export interface RobotStatus {
  type: string;
  sensors: SensorData;
}


export interface LidarPoint {
  x: number;
  y: number;
}

export interface LidarData {
  type: string;
  points: LidarPoint[];
}
