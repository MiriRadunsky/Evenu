import { useEffect, useState } from "react";
import api from "../services/axios";

export function useCitiesList() {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCities() {
      try {
        // שימוש בـ axios מוגדר כדי להשתמש בـ API URL הנכון בכל סביבה
        const { data } = await api.get("/cities");

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
