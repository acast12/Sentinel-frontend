type Props = {
    label: string;
    value: number | undefined;
    unit: string;
    status: 'good' | 'warn' | 'bad' | 'unknown';
};

export default function ReadingCard({ label, value, unit }: Props) {
    return (
        <div className="bg-gray-900 rounded-xl p-6">
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-4xl font-bold mt-2">
                {value !== undefined ? value.toFixed(1) : '--'}
            </p>
            <p className="text-gray-500 text-sm mt-1">{unit}</p>
        </div>
    );
}