export interface SensorData {
  hall: boolean;
  ultrasonic: number;
}

export interface RobotStatus {
  type: string;
  sensors: SensorData;
}
