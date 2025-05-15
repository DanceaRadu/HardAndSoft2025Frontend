export interface SensorData {
  battery_voltage: number;
  magnetic_field: boolean;
  vibration: boolean;
  alcohol: boolean
}

export interface RobotStatus {
  type: string;
  sensors: SensorData;
}
