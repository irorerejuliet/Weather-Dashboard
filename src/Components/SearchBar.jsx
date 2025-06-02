import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [city, setCity] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!city.trim()) return;
    onSearch(city.trim());
    setCity("");
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex">
      <input
        type="text"
        placeholder="Enter city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="flex-grow px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none"
      />
      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700"
      >
        Search
      </button>
    </form>
    
  );
}
