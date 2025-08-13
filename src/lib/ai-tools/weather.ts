export async function getWeather(city: string) {
	const apiKey = process.env.WEATHER_API_KEY;
	if (!apiKey) throw new Error('WEATHER_API_KEY is not configured');
	const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
	const res = await fetch(url, { headers: { Accept: 'application/json' } });
	if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
	const data = await res.json();
	return {
		location: data?.location?.name,
		region: data?.location?.region,
		country: data?.location?.country,
		temp_c: data?.current?.temp_c,
		condition: data?.current?.condition?.text,
		icon: data?.current?.condition?.icon,
	};
} 