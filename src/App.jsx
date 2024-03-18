import { useEffect, useState } from "react";
import Weather from "./components/Weather";

function convertToFlag(countryCode) {
	const codePoints = countryCode
		.toUpperCase()
		.split("")
		.map((char) => 127397 + char.charCodeAt());
	return String.fromCodePoint(...codePoints);
}

export default function App() {
	const [location, setLocation] = useState(
		localStorage.getItem("location") || ""
	);
	const [weather, setWeather] = useState({});
	const [displayLocation, setDisplayLocation] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleLocation = (e) => {
		setLocation(e.target.value);
	};

	useEffect(() => {
		const controller = new AbortController();

		const fetchWeather = async () => {
			if (location.length < 2) {
				setWeather({});
				localStorage.removeItem("location");
				return;
			}

			try {
				setIsLoading(true);

				// 1) Getting location (geocoding)
				const geoRes = await fetch(
					`https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
					{ signal: controller.signal }
				);
				const geoData = await geoRes.json();

				if (!geoData.results) throw new Error("Location not found");

				const { latitude, longitude, timezone, name, country_code } =
					geoData.results.at(0);

				// 2) Getting actual weather
				const weatherRes = await fetch(
					`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${
						timezone ?? "Europe/London"
					}&daily=weathercode,temperature_2m_max,temperature_2m_min`
				);
				const weatherData = await weatherRes.json();

				setWeather(weatherData.daily);
				setDisplayLocation(`${name} ${convertToFlag(country_code)}`);
				localStorage.setItem("location", location);
			} catch (err) {
				if (err.name !== "AbortError") {
					console.log(err);
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchWeather();

		return () => controller.abort();
	}, [location]);

	return (
		<div className="app">
			<h1>Classy Weather</h1>

			<input
				type="text"
				placeholder="Search from location..."
				value={location}
				onChange={handleLocation}
			/>

			{isLoading && <p className="loader">Loading...</p>}
			{weather.weathercode && (
				<Weather
					location={displayLocation}
					dates={weather.time}
					max={weather.temperature_2m_max}
					min={weather.temperature_2m_min}
					codes={weather.weathercode}
				/>
			)}
		</div>
	);
}
