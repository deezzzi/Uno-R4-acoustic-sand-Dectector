"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';

// Define types for data
interface SensorData {
  sandLevel: number;
  samplingRate?: number;
  sampleInterval?: number;
}
 
interface HistoricalData {
  time: string;
  sandLevel: number; 
}

type StatusType = 'normal' | 'warning' | 'critical';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.106';

const PipelineMonitor: React.FC = () => {
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [status, setStatus] = useState<StatusType>('normal');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
 
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use the local proxy endpoint instead of calling API_URL directly.
      const response = await fetch('/api');
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data: SensorData = await response.json();
  
      // if (!data.sandLevel) throw new Error('0ops! Invalid data format');  

      if (data.sandLevel === undefined || data.sandLevel === null) {
        throw new Error('0ops! Invalid data format');
      }
  
      setCurrentData(data);
      setHistoricalData((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          sandLevel: parseFloat(data.sandLevel.toFixed(2)),
        },
      ].slice(-30)); // Keep last 30 readings
  
      if (data.sandLevel > 1000) {
        setStatus('critical');
      } else if (data.sandLevel > 500) {
        setStatus('warning');
      } else {
        setStatus('normal');
      }
  
      setError(null);
    } catch (err) {
      setError(`Failed to fetch data from sensor: ${
        err instanceof Error ? err.message : 'Unknown error'
      }`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-6 flex flex-col">
      <div className="mx-auto max-w-7xl space-y-8 flex-grow">
        {/* Header Section */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight"> 
            Gas Pipeline Acoustic Sand Monitoring Device
          </h1>
          <p className="mt-2 text-gray-500">Real-time sand detection system</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-4 w-4" />    
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-500">Loading data...</div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Sand Level Card */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Current Sand Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tight text-gray-900">
                {currentData?.sandLevel?.toFixed(2) || '---'}
              </div>
              <Badge 
                className={`mt-2 transition-colors ${getStatusColor(status)}`}
              >
                {status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <span className="text-sm font-medium">Sampling Rate:</span>
                  <span className="font-mono">{currentData?.samplingRate?.toFixed(1) || '---'} Hz</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <span className="text-sm font-medium">Sample Interval:</span>
                  <span className="font-mono">{currentData?.sampleInterval || '---'} ms</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <span className="text-sm font-medium">Connection:</span>
                  <Badge 
                    variant={error ? 'destructive' : 'default'}
                    className="transition-colors"
                  >
                    {error ? 'DISCONNECTED' : 'CONNECTED'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Status Card */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Alert Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                {status === 'normal' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                )}
                <span className="text-lg font-medium">
                  {status === 'normal'
                    ? 'System operating normally'
                    : `${status.charAt(0).toUpperCase() + status.slice(1)} - Check pipeline`}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Card */}
        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Sand Level Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sandLevel"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Section */}
      <footer className="mt-12 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600">System Info</h3>
              <ul className="mt-4 space-y-2">
                <li className="text-sm text-gray-500">Version: 1.0.0</li>
                <li className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</li>
                <li className="text-sm text-gray-500">Status: {error ? 'System Error' : 'Operational'}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-sm text-blue-500 hover:text-blue-600 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-blue-500 hover:text-blue-600 transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-blue-500 hover:text-blue-600 transition-colors">
                    System Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Contact</h3>
              <ul className="mt-4 space-y-2">
                <li className="text-sm text-gray-500">Emergency: +1 (555) 123-4567</li>
                <li className="text-sm text-gray-500">Support: support@example.com</li>
                <li className="text-sm text-gray-500">Technical: tech@example.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Gas Pipeline Monitoring System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PipelineMonitor;
