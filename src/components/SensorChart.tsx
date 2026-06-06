'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Props = {
    data: any[];
    dataKey: string;
    label: string;
    color: string;
    unit: string;
    timeRange: string;
};

const formatTick = (timestamp: number, timeRange: string) => {
    const date = new Date(timestamp);
    if (timeRange === '1H' || timeRange === '6H') {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'America/Los_Angeles'
        });
    }
    if (timeRange === '24H') {
        return date.toLocaleTimeString('en-US', { 
            month: 'short',
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/Los_Angeles'
        });
    }
    // 7D
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        timeZone: 'America/Los_Angeles'
    });
};

export default function SensorChart({ data, dataKey, label, color, unit, timeRange}: Props) {
    return (
        <div className="bg-gray-900 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-medium mb-4">{label}</p>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                    <XAxis 
                        dataKey="timestamp_ms"
                        tickFormatter={(v) => formatTick(v, timeRange)}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <Tooltip
                        labelFormatter={(v) => new Date(v).toLocaleTimeString()}
                        formatter={(v: any) => [`${v} ${unit}`, label]}
                        contentStyle={{ backgroundColor: '#111827', border: 'none' }}
                    />
                    <Line 
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        dot={false}
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}