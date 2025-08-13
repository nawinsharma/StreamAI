"use client";

import Image from 'next/image';

export type WeatherPayload = {
	location?: string;
	region?: string;
	country?: string;
	temp_c?: number;
	condition?: string;
	icon?: string;
};

export function WeatherCard({ data }: { data: WeatherPayload }) {
	return (
		<div className="rounded-xl border border-border/50 bg-muted/20 p-4 flex items-center gap-4">
			{data.icon ? (
				<Image src={`https:${data.icon}`} alt={data.condition || 'weather'} width={48} height={48} />
			) : (
				<div className="w-12 h-12 rounded-full bg-blue-500/20" />
			)}
			<div>
				<div className="text-sm font-medium">
					{data.location || 'Unknown'}{data.region ? `, ${data.region}` : ''}{data.country ? `, ${data.country}` : ''}
				</div>
				<div className="text-xs text-muted-foreground">
					{typeof data.temp_c === 'number' ? `${data.temp_c}°C` : ''} {data.condition || ''}
				</div>
			</div>
		</div>
	);
}
