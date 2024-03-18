import Day from "./Day";

function Weather({ location, dates, max, min, codes }) {
	return (
		<div>
			<h2>Weather {location}</h2>
			<ul className="weather">
				{dates.map((date, i) => (
					<Day
						date={date}
						max={max.at(i)}
						min={min.at(i)}
						code={codes.at(i)}
						key={date}
						isToday={i === 0}
					/>
				))}
			</ul>
		</div>
	);
}

export default Weather;
