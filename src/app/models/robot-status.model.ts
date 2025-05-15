export interface SensorData {
  hall: boolean;
  ultrasonic: number;
  battery_voltage: number;
  magnetic_field: boolean;
  vibration: boolean;
}

export interface RobotStatus {
  type: string;
  sensors: SensorData;
}
