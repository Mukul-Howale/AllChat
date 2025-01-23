import { useEffect, useState } from 'react';
import { logEvent } from '@/utils/logging';

export default function DeviceTest() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string>('');
  const [isMobileDetected, setIsMobileDetected] = useState<boolean>(false);

  useEffect(() => {
    // Check if detected as mobile
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setIsMobileDetected(mobileCheck);

    async function getDevices() {
      try {
        // First request permission to access devices with non-mobile constraints
        await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        }).catch(err => {
          // Even if this fails, we still want to list available devices
          logEvent('Permission request failed', { error: err.message });
        });

        // Then enumerate devices
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices(deviceList);
        logEvent('Found devices', { count: deviceList.length });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);
        logEvent('Failed to enumerate devices', { error: message });
      }
    }

    getDevices();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Media Device Diagnostic</h1>
      
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        Browser detected as: {isMobileDetected ? 'Mobile' : 'Desktop'}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Devices:</h2>
        {devices.length === 0 ? (
          <p className="text-gray-600">No devices found</p>
        ) : (
          <ul className="space-y-2">
            {devices.map((device, index) => (
              <li key={index} className="p-3 bg-gray-50 rounded">
                <div><span className="font-medium">Type:</span> {device.kind}</div>
                <div><span className="font-medium">Label:</span> {device.label || 'Unnamed device'}</div>
                <div><span className="font-medium">ID:</span> {device.deviceId}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
