import { useState } from "react";
import axios from "axios";

export default function SearchBox({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const API_KEY = "pk.a824fc63fa98900506d2664d16dec676";

  const searchLocation = async (text) => {
    setQuery(text);

    if (text.length < 3) {
      setResults([]);
      return;
    }

    try {
      const res = await axios.get(
        `https://us1.locationiq.com/v1/autocomplete.php`,
        {
          params: {
            key: API_KEY,
            q: text,
            format: "json",
            limit: 5,
          },
        }
      );

      setResults(res.data);
    } catch (err) {
      console.log("Search error", err);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* INPUT */}
      <input
        value={query}
        onChange={(e) => searchLocation(e.target.value)}
        placeholder="Search location..."
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ccc",
          fontSize: 14,
        }}
      />

      {/* DROPDOWN */}
      {results.length > 0 && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 10,
            marginTop: 4,
            zIndex: 1000,
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {results.map((place, i) => (
            <div
              key={i}
              onClick={() => {
                const selected = {
                  name: place.display_name,
                  lat: place.lat,
                  lng: place.lon,
                };

                onSelect(selected);

                setQuery(place.display_name);
                setResults([]);
              }}
              style={{
                padding: 10,
                cursor: "pointer",
                fontSize: 13,
                borderBottom: "1px solid #eee",
              }}
            >
              {place.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}