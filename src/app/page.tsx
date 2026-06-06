'use client';

import { useState, useEffect } from 'react';
import ReadingCard from '@/components/ReadingCard';
import SensorChart from '@/components/SensorChart';
import { getTooltipNameProp } from 'recharts/types/util/ChartUtils';

type Reading = {
    id: number;
    temp: number;
    humidity: number;
    eco2: number;
    tvoc: number;
    alert_temp_high: number;
    alert_temp_low: number;
    alert_humidity_high: number;
    alert_humidity_low: number;
    alert_eco2_warn: number;
    alert_eco2_bad: number;
    alert_tvoc_warn: number;
    alert_tvoc_bad: number;
    timestamp_ms: number;
    created_at: string;
};

type TimeRange = '1H' | '6H' | '24H' | '7D';

const TIME_RANGES: Record<TimeRange, number> = {
    '1H':  1 * 60 * 60 * 1000,
    '6H':  6 * 60 * 60 * 1000,
    '24H': 24 * 60 * 60 * 1000,
    '7D':  7 * 24 * 60 * 60 * 1000,
};

const getTempStatus = (v: number) => v > 35 || v < 10 ? 'bad' : v > 28 ? 'warn' : 'good';
const getHumidityStatus = (v: number) => v > 60 || v < 30 ? 'warn' : 'good';
const getEco2Status = (v: number) => v > 2000 ? 'bad' : v > 1000 ? 'warn' : 'good';
const getTvocStatus = (v: number) => v > 660 ? 'bad' : v > 220 ? 'warn' : 'good';

function CardSkeleton() {
    return (
        <div className="bg-gray-900 rounded-xl p-6 animate-pulse">
            <div className="h-3 w-20 bg-gray-800 rounded mb-4" />
            <div className="h-10 w-24 bg-gray-800 rounded mb-2" />
            <div className="h-3 w-12 bg-gray-800 rounded" />
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="bg-gray-900 rounded-xl p-6 animate-pulse">
            <div className="h-3 w-24 bg-gray-800 rounded mb-4" />
            <div className="h-48 bg-gray-800 rounded" />
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-800 rounded" />
            ))}
        </div>
    );
}

export default function Home() {
    const [latest, setLatest] = useState<Reading | null>(null);
    const [history, setHistory] = useState<Reading[]>([]);
    const [alerts, setAlerts] = useState<Reading[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>('1H');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [latestRes, historyRes, alertsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/readings/latest`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/readings/history?from=${Date.now() - TIME_RANGES[timeRange]}&to=${Date.now()}`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/readings/alerts`),
                ]);

                const [latestData, historyData, alertsData] = await Promise.all([
                    latestRes.json(),
                    historyRes.json(),
                    alertsRes.json(),
                ]);

                setLatest(latestData);
                setHistory(historyData);
                setAlerts(alertsData);
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [timeRange]);

    return (
        <main className="min-h-screen bg-gray-950 text-white px-12 py-8">

            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Sentinel</h1>
                    <p className="text-gray-400 mt-1">Bedroom — Air Quality Monitor</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Last updated:{' '}
                        {latest
                            ? new Date(latest.timestamp_ms).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })
                            : 'Loading...'}
                    </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                    </span>
                    <span className="text-green-400 text-xs font-medium">Live</span>
                </div>
            </div>

            {/* Current Readings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {loading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <>
                        <ReadingCard
                            label="Temperature"
                            value={latest?.temp}
                            unit={`°C / ${latest ? ((latest.temp * 9/5) + 32).toFixed(1) : '--'}°F`}
                            status={latest ? getTempStatus(latest.temp) : 'unknown'}
                        />
                        <ReadingCard
                            label="Humidity"
                            value={latest?.humidity}
                            unit="%"
                            status={latest ? getHumidityStatus(latest.humidity) : 'unknown'}
                        />
                        <ReadingCard
                            label="eCO2"
                            value={latest?.eco2}
                            unit="ppm"
                            status={latest ? getEco2Status(latest.eco2) : 'unknown'}
                        />
                        <ReadingCard
                            label="TVOC"
                            value={latest?.tvoc}
                            unit="ppb"
                            status={latest ? getTvocStatus(latest.tvoc) : 'unknown'}
                        />
                    </>
                )}
            </div>

            {/* Guidelines */}
            <div className="bg-gray-900 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Air Quality Guidelines</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-2">Temperature</p>
                        <p className="text-green-400 text-sm">18–24°C — Comfortable</p>
                        <p className="text-red-400 text-sm">Above 35°C / Below 10°C — Alert</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-2">Humidity</p>
                        <p className="text-green-400 text-sm">30–60% — Ideal</p>
                        <p className="text-yellow-400 text-sm">Above 60% — Mold risk</p>
                        <p className="text-yellow-400 text-sm">Below 30% — Too dry</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-2">eCO2</p>
                        <p className="text-green-400 text-sm">Under 1000ppm — Good</p>
                        <p className="text-yellow-400 text-sm">1000–2000ppm — Poor</p>
                        <p className="text-red-400 text-sm">Above 2000ppm — Unhealthy</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-2">TVOC</p>
                        <p className="text-green-400 text-sm">Under 220ppb — Clean</p>
                        <p className="text-yellow-400 text-sm">220–660ppb — Concern</p>
                        <p className="text-red-400 text-sm">Above 660ppb — Unhealthy</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">History</h2>
                    <div className="flex gap-2">
                        {(['1H', '6H', '24H', '7D'] as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    timeRange === range
                                        ? 'bg-white text-gray-950'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {loading ? (
                        <>
                            <ChartSkeleton />
                            <ChartSkeleton />
                            <ChartSkeleton />
                            <ChartSkeleton />
                        </>
                    ) : (
                        <>
                            <SensorChart data={history} dataKey="temp"     label="Temperature" color="#34d399" unit="°C"   timeRange={timeRange}  />
                            <SensorChart data={history} dataKey="humidity" label="Humidity"    color="#60a5fa" unit="%"    timeRange={timeRange}   />
                            <SensorChart data={history} dataKey="eco2"     label="eCO2"        color="#f59e0b" unit="ppm"     timeRange={timeRange} />
                            <SensorChart data={history} dataKey="tvoc"     label="TVOC"        color="#a78bfa" unit="ppb"     timeRange={timeRange} />
                        </>
                    )}
                </div>
            </div>

            {/* Alerts */}
            <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
                {loading ? (
                    <TableSkeleton />
                ) : alerts.length === 0 ? (
                    <p className="text-green-400 text-sm">No alerts — air quality is good</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 text-left border-b border-gray-800">
                                <th className="pb-2">Date</th>
                                <th className="pb-2">Time</th>
                                <th className="pb-2">Temp</th>
                                <th className="pb-2">Humidity</th>
                                <th className="pb-2">eCO2</th>
                                <th className="pb-2">TVOC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((a) => (
                                <tr key={a.id} className="border-b border-gray-800">
                                    <td className="py-2 text-gray-400">
                                        {new Date(a.timestamp_ms).toLocaleDateString('en-US', {
                                            timeZone: 'America/Los_Angeles',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </td>
                                    <td className="py-2 text-gray-400">
                                        {new Date(a.timestamp_ms).toLocaleTimeString('en-US', {
                                            timeZone: 'America/Los_Angeles',
                                        })}
                                    </td>
                                    <td className="py-2">{a.temp.toFixed(1)}°C</td>
                                    <td className="py-2">{a.humidity.toFixed(1)}%</td>
                                    <td className="py-2">{a.eco2.toFixed(0)}ppm</td>
                                    <td className="py-2">{a.tvoc.toFixed(0)}ppb</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </main>
    );
}