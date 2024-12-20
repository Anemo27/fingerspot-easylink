# Fingerspot EasyLink SDK

A TypeScript/JavaScript library for communicating with multiple Fingerspot biometric devices over HTTP.

## Installation

```bash
npm install fingerspot-easylink
```

## Usage

### TypeScript

```typescript
import FingerspotEasyLink, { DeviceConfig, UserData, DeviceResponse } from 'fingerspot-easylink';

// Configure multiple devices
const devices: DeviceConfig[] = [
    {
        serverIP: '192.168.1.100',
        serverPort: '8080',
        deviceSN: 'DEVICE001'
    },
    {
        serverIP: '192.168.1.101',
        serverPort: '8080',
        deviceSN: 'DEVICE002'
    }
];

// Initialize SDK with multiple devices
const sdk = new FingerspotEasyLink({
    devices,
    configPath: 'device.ini'  // Optional
});

// Example: Working with multiple devices
async function manageDevices(): Promise<void> {
    try {
        // Get list of all registered devices
        const deviceList = sdk.getDevices();
        console.log('Registered devices:', deviceList);

        // Work with specific device
        const device1 = sdk.getDevice('DEVICE001');
        const device2 = sdk.getDevice('DEVICE002');

        // Get users from both devices
        const [users1, users2] = await Promise.all([
            device1.getUsers(),
            device2.getUsers()
        ]);

        console.log('Device 1 users:', users1.data);
        console.log('Device 2 users:', users2.data);

        // Add new device at runtime
        sdk.addDevice({
            serverIP: '192.168.1.102',
            serverPort: '8080',
            deviceSN: 'DEVICE003'
        });

        // Remove device
        sdk.removeDevice('DEVICE003');

    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### JavaScript

```javascript
const FingerspotEasyLink = require('fingerspot-easylink');

const sdk = new FingerspotEasyLink({
    devices: [
        {
            serverIP: '192.168.1.100',
            serverPort: '8080',
            deviceSN: 'DEVICE001'
        },
        {
            serverIP: '192.168.1.101',
            serverPort: '8080',
            deviceSN: 'DEVICE002'
        }
    ]
});

async function manageDevices() {
    try {
        const device = sdk.getDevice('DEVICE001');
        const users = await device.getUsers();
        console.log('Users:', users.data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

## Features

### Multi-Device Management
- Support for multiple devices simultaneously
- Dynamic device addition/removal
- Individual device operations
- Shared configuration management

### Device Operations (Per Device)
- Get device information
- Set/Get device time
- Restart device
- User management
- Template management
- Scan log management

## API Reference

### Types

```typescript
interface DeviceConfig {
    serverIP: string;
    serverPort: string;
    deviceSN: string;
}

interface SDKConfig {
    devices: DeviceConfig[];
    configPath?: string;
}
```

### Multi-Device Management

```typescript
// Get all registered devices
const deviceList = sdk.getDevices();

// Get specific device
const device = sdk.getDevice('DEVICE001');

// Add new device
sdk.addDevice({
    serverIP: '192.168.1.100',
    serverPort: '8080',
    deviceSN: 'DEVICE001'
});

// Remove device
sdk.removeDevice('DEVICE001');
```

### Device Operations

```typescript
// Get device instance
const device = sdk.getDevice('DEVICE001');

// Get device information
const info = await device.getDeviceInfo();

// Get device time
const time = await device.getDeviceTime();

// Set device time
await device.setDeviceTime(Date.now());

// Restart device
await device.restartDevice();
```

### User Management (Per Device)

```typescript
const device = sdk.getDevice('DEVICE001');

// Get all users
const users = await device.getUsers();

// Get specific user
const user = await device.getUserByPin('1234');

// Add new user
await device.addUser({
    pin: '1234',
    name: 'John Doe',
    password: '123456',
    privilege: 0
});

// Update user
await device.updateUser('1234', {
    name: 'John Smith',
    password: 'newpass'
});

// Delete user
await device.deleteUser('1234');
```

### Template Management (Per Device)

```typescript
const device = sdk.getDevice('DEVICE001');

// Get user templates
const templates = await device.getUserTemplates('1234');

// Upload template
await device.uploadTemplate({
    pin: '1234',
    finger_idx: 0,
    template: 'TEMPLATE_DATA'
});

// Delete template
await device.deleteTemplate('1234', 0);
```

### Scan Log Management (Per Device)

```typescript
const device = sdk.getDevice('DEVICE001');

// Get scan logs
const logs = await device.getScanLogs(
    '2023-09-01', // start date (optional)
    '2023-09-30'  // end date (optional)
);

// Clear scan logs
await device.clearScanLogs();
```

## Error Handling

The library uses Promise-based error handling with type-safe responses:

```typescript
try {
    const device = sdk.getDevice('DEVICE001');
    const response = await device.getUsers();
    if (response.code === 0) {
        // Success
        console.log(response.data);
    } else {
        // API error
        console.error(response.message);
    }
} catch (error) {
    // Network or other error
    console.error('Operation failed:', error.message);
}
```

## License

MIT
