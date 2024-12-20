export interface DeviceConfig {
    serverIP: string;
    serverPort: string;
    deviceSN: string;
}

export interface SDKConfig {
    devices: DeviceConfig[];
    configPath?: string;
}

export interface DeviceResponse<T> {
    code: number;
    message: string;
    data?: T;
}

export interface UserData {
    pin: string;
    name: string;
    password?: string;
    privilege?: number;
    cardNumber?: string;
}

export interface TemplateData {
    pin: string;
    finger_idx: number;
    template: string;
    alg_ver?: number;
}

export interface ScanLogData {
    pin: string;
    verifyMode: number;
    ioMode: number;
    timestamp: string;
}

export interface DeviceInfo {
    serialNumber: string;
    model: string;
    firmware: string;
    platform: string;
    mac: string;
    deviceName: string;
}

export interface DeviceScheduleConfig {
    serialNumbers: string[];
    schedules: string[];
}
