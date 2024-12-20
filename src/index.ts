import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs/promises';
import * as ini from 'ini';
import {
    SDKConfig,
    DeviceConfig,
    UserData,
    TemplateData,
    ScanLogData,
    DeviceInfo,
    DeviceResponse,
    DeviceScheduleConfig
} from './types';

class FingerspotDevice {
    private readonly client: AxiosInstance;
    private readonly deviceSN: string;

    constructor(config: DeviceConfig) {
        this.deviceSN = config.deviceSN;
        const baseURL = `http://${config.serverIP}:${config.serverPort}`;

        this.client = axios.create({
            baseURL,
            timeout: 10000
        });
    }

    /**
     * Get device information
     */
    async getDeviceInfo(): Promise<DeviceResponse<DeviceInfo>> {
        try {
            const response = await this.client.get<DeviceResponse<DeviceInfo>>('/dev_info', {
                params: { sn: this.deviceSN }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get device info: ${(error as Error).message}`);
        }
    }

    /**
     * Get all users from device
     */
    async getUsers(): Promise<DeviceResponse<UserData[]>> {
        try {
            const response = await this.client.get<DeviceResponse<UserData[]>>('/user', {
                params: { sn: this.deviceSN }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get users: ${(error as Error).message}`);
        }
    }

    /**
     * Get user information by PIN
     */
    async getUserByPin(pin: string): Promise<DeviceResponse<UserData>> {
        try {
            const response = await this.client.get<DeviceResponse<UserData>>('/user', {
                params: { 
                    sn: this.deviceSN,
                    pin
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get user: ${(error as Error).message}`);
        }
    }

    /**
     * Add new user to device
     */
    async addUser(userData: UserData): Promise<DeviceResponse<void>> {
        try {
            const response = await this.client.post<DeviceResponse<void>>('/user', {
                sn: this.deviceSN,
                ...userData
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to add user: ${(error as Error).message}`);
        }
    }

    /**
     * Update existing user
     */
    async updateUser(pin: string, userData: Partial<UserData>): Promise<DeviceResponse<void>> {
        try {
            const response = await this.client.put<DeviceResponse<void>>('/user', {
                sn: this.deviceSN,
                pin,
                ...userData
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update user: ${(error as Error).message}`);
        }
    }

    /**
     * Delete user from device
     */
    async deleteUser(pin: string): Promise<DeviceResponse<void>> {
        try {
            const response = await this.client.delete<DeviceResponse<void>>('/user', {
                params: {
                    sn: this.deviceSN,
                    pin
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete user: ${(error as Error).message}`);
        }
    }

    /**
     * Get user's fingerprint templates
     */
    async getUserTemplates(pin: string): Promise<DeviceResponse<TemplateData[]>> {
        try {
            const response = await this.client.get<DeviceResponse<TemplateData[]>>('/template', {
                params: {
                    sn: this.deviceSN,
                    pin
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get user templates: ${(error as Error).message}`);
        }
    }

    /**
     * Upload fingerprint template
     */
    async uploadTemplate(templateData: TemplateData): Promise<DeviceResponse<void>> {
        try {
            const response = await this.client.post<DeviceResponse<void>>('/template', {
                sn: this.deviceSN,
                ...templateData
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to upload template: ${(error as Error).message}`);
        }
    }

    /**
     * Delete fingerprint template
     */
    async deleteTemplate(pin: string, fingerIndex: number): Promise<DeviceResponse<void>> {
        try {
            const response = await this.client.delete<DeviceResponse<void>>('/template', {
                params: {
                    sn: this.deviceSN,
                    pin,
                    finger_idx: fingerIndex
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete template: ${(error as Error).message}`);
        }
    }

    /**
     * Get scan logs
     */
    async getScanLogs(startDate?: string, endDate?: string): Promise<DeviceResponse<ScanLogData[]>> {
        try {
            const params: Record<string, string> = { sn: this.deviceSN };
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const response = await this.client.get<DeviceResponse<ScanLogData[]>>('/scanlog', { params });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get scan logs: ${(error as Error).message}`);
        }
    }

    /**
     * Clear scan logs
     */
    async clearScanLogs(): Promise<DeviceResponse<void>> {
        try {
            const response = await this.client.delete<DeviceResponse<void>>('/scanlog', {
                params: { sn: this.deviceSN }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to clear scan logs: ${(error as Error).message}`);
        }
    }

    /**
     * Set device time
     */
    async setDeviceTime(timestamp: number): Promise<DeviceResponse<void>> {
        try {
            const response = await this.client.post<DeviceResponse<void>>('/dev_time', {
                sn: this.deviceSN,
                timestamp
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to set device time: ${(error as Error).message}`);
        }
    }

    /**
     * Get device time
     */
    async getDeviceTime(): Promise<DeviceResponse<{ timestamp: number }>> {
        try {
            const response = await this.client.get<DeviceResponse<{ timestamp: number }>>('/dev_time', {
                params: { sn: this.deviceSN }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get device time: ${(error as Error).message}`);
        }
    }

    /**
     * Restart device
     */
    async restartDevice(): Promise<DeviceResponse<void>> {
        try {
            const response = await this.client.post<DeviceResponse<void>>('/dev_reboot', {
                sn: this.deviceSN
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to restart device: ${(error as Error).message}`);
        }
    }
}

class FingerspotEasyLink {
    private devices: Map<string, FingerspotDevice>;
    private configPath: string;

    constructor(config: SDKConfig) {
        this.devices = new Map();
        this.configPath = config.configPath || 'device.ini';

        // Initialize devices
        config.devices.forEach(deviceConfig => {
            this.devices.set(deviceConfig.deviceSN, new FingerspotDevice(deviceConfig));
        });
    }

    /**
     * Get device instance by serial number
     */
    getDevice(serialNumber: string): FingerspotDevice {
        const device = this.devices.get(serialNumber);
        if (!device) {
            throw new Error(`Device with serial number ${serialNumber} not found`);
        }
        return device;
    }

    /**
     * Get all registered devices
     */
    getDevices(): string[] {
        return Array.from(this.devices.keys());
    }

    /**
     * Add new device
     */
    addDevice(config: DeviceConfig): void {
        this.devices.set(config.deviceSN, new FingerspotDevice(config));
    }

    /**
     * Remove device
     */
    removeDevice(serialNumber: string): boolean {
        return this.devices.delete(serialNumber);
    }

    /**
     * Read device configuration from INI file
     */
    async readDeviceConfig(): Promise<DeviceScheduleConfig> {
        try {
            const content = await fs.readFile(this.configPath, 'utf-8');
            const config = ini.parse(content);
            return {
                serialNumbers: config.Mesin?.sn ? config.Mesin.sn.split(';').filter(Boolean) : [],
                schedules: config.Jadwal?.jam ? config.Jadwal.jam.split(';').filter(Boolean) : []
            };
        } catch (error) {
            throw new Error(`Failed to read device configuration: ${(error as Error).message}`);
        }
    }

    /**
     * Update device configuration
     */
    async updateDeviceConfig(config: DeviceScheduleConfig): Promise<boolean> {
        try {
            const deviceConfig = {
                Mesin: {
                    sn: config.serialNumbers.join(';')
                },
                Jadwal: {
                    jam: config.schedules.join(';')
                }
            };
            await fs.writeFile(this.configPath, ini.stringify(deviceConfig));
            return true;
        } catch (error) {
            throw new Error(`Failed to update device configuration: ${(error as Error).message}`);
        }
    }
}

export default FingerspotEasyLink;
export { FingerspotDevice };
export * from './types';
