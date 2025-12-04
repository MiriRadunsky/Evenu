import { useEffect, useState } from "react";

export function useCitiesList() {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCities() {
      try {
        // קריאה דרך השרת שלנו (proxy) כדי להימנע מבעיות CORS
        const res = await fetch("/api/cities");
        const data = await res.json();

        if (data.success && data.cities) {
          setCities(data.cities);
        }
      } catch (err) {
        console.error("Error loading cities list:", err);
      }
    }

    fetchCities();
  }, []);

  return cities;
}
