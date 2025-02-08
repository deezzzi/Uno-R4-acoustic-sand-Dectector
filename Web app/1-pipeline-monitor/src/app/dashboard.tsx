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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.226.10';

const PipelineMonitor: React.FC = () => {
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [status, setStatus] = useState<StatusType>('normal');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const data: SensorData = await response.json();

      if (!data.sandLevel) throw new Error('Invalid data format');

      setCurrentData(data);
      setHistoricalData(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          sandLevel: parseFloat(data.sandLevel.toFixed(2)),
        }
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
      setError(`Failed to fetch data from sensor: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2"> Gas Pipeline Acoustic Sand Monitoring Device</h1>
        <p className="text-gray-500">Real-time sand detection system</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />    
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {isLoading && <div className="text-center">Loading...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Current Sand Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">
              {currentData?.sandLevel?.toFixed(2) || '---'}
            </div>
            <Badge className={getStatusColor(status)}>
              {status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Sampling Rate:</span>
                <span>{currentData?.samplingRate?.toFixed(1) || '---'} Hz</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sample Interval:</span>
                <span>{currentData?.sampleInterval || '---'} ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Connection:</span>
                <Badge variant={error ? 'destructive' : 'default'}>
                  {error ? 'DISCONNECTED' : 'CONNECTED'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status === 'normal' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-lg">
                {status === 'normal'
                  ? 'System operating normally'
                  : `${status.charAt(0).toUpperCase() + status.slice(1)} - Check pipeline`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sand Level Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sandLevel"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineMonitor;
