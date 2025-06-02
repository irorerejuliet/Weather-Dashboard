import React, { useState, useEffect } from "react";
import SearchBar from "./Components/SearchBar";

export default function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [lastCity, setLastCity] = useState("");
  const [unit, setUnit] = useState("metric");

  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(localStorage.getItem("recentSearches")) || [];
  });

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  function getDailyForecast(forecastData) {
    return forecastData.list.filter((item) => item.dt_txt.includes("12:00:00"));
  }

  async function fetchWeather(city) {
    setError("");
    setWeather(null);
    setForecast(null);
    setLoading(true);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`
      );
      const data = await res.json();

      if (res.ok) {
        setWeather(data);
        setLastCity(city);
      } else {
        setError(data.message);
        setLoading(false);
        return;
      }

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`
      );
      const forecastData = await forecastRes.json();

      if (forecastRes.ok) {
        setForecast(forecastData);
      } else {
        setError(forecastData.message);
      }
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }

    setRecentSearches((prev) => {
      const updated = [city, ...prev.filter((c) => c !== city)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }

  useEffect(() => {
    if (lastCity) {
      fetchWeather(lastCity);
    }
  }, [unit]);

  return (
    <main className="min-h-screen bg-[#1e1e2f] text-white">
      <div className="max-w-md mx-auto p-6 font-sans text-gray-900">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-white">
          Weather Dashboard
        </h1>
        <SearchBar onSearch={fetchWeather} />

        <div className="mb-4 flex justify-center">
          <button
            onClick={() =>
              setUnit((prev) => (prev === "metric" ? "imperial" : "metric"))
            }
            className="bg-indigo-600 text-white px-5 py-2 rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Toggle temperature unit"
          >
            Switch to {unit === "metric" ? "Fahrenheit (°F)" : "Celsius (°C)"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 mb-4 text-center font-semibold animate-fadeIn">
            {error}
          </p>
        )}

        {loading && (
          <div className="flex justify-center mb-6">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-300 h-12 w-12"></div>
          </div>
        )}

        {/* Current Weather */}
        {weather && !loading && (
          <div className="border rounded-lg p-6 shadow-lg bg-white animate-fadeIn mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {weather.name}, {weather.sys.country}
            </h2>
            <div className="flex items-center space-x-6">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt={weather.weather[0].description}
                className="w-24 h-24"
              />
              <div>
                <p className="text-5xl font-extrabold">
                  {Math.round(weather.main.temp)}°
                  {unit === "metric" ? "C" : "F"}
                </p>
                <p className="capitalize text-lg mt-1">
                  {weather.weather[0].description}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Humidity: {weather.main.humidity}%
                </p>
                <p className="text-sm text-gray-600">
                  Wind speed: {weather.wind.speed} m/s
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 animate-fadeIn">
            {getDailyForecast(forecast).map((day) => (
              <div
                key={day.dt}
                className="border rounded-lg p-4 bg-white shadow-md flex flex-col items-center"
              >
                <p className="font-semibold mb-1 text-indigo-700">
                  {new Date(day.dt_txt).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                  className="mb-2"
                />
                <p className="font-bold text-lg mb-1">
                  {Math.round(day.main.temp_min)}
                  {unit === "metric" ? "°C" : "°F"} /{" "}
                  {Math.round(day.main.temp_max)}
                  {unit === "metric" ? "°C" : "°F"}
                </p>
                <p className="capitalize text-gray-700">
                  {day.weather[0].description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <p className="font-semibold mb-3 text-center text-gray-700">
              Recent Searches:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {recentSearches.map((city, index) => (
                <button
                  key={index}
                  className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm hover:bg-indigo-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onClick={() => fetchWeather(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loader styles */}
        <style>{`
        .loader {
          border-top-color: #6366f1;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in forwards;
        }
      `}</style>
      </div>
    </main>
  );
}
