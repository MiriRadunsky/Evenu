import { useEffect, useState } from "react";
import api from "../services/axios";

export function useKashrutList() {
  const [kashrutList, setKashrutList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKashrut() {
      try {
        // שימוש בـ axios מוגדר כדי להשתמש בـ API URL הנכון בכל סביבה
        const { data } = await api.get("/kashrut");

        if (data.success && data.kashrut) {
          setKashrutList(data.kashrut);
        } else {
          setKashrutList([]);
        }
      } catch (err) {
        console.error("Error loading kashrut list:", err);
        setKashrutList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchKashrut();
  }, []);

  return { kashrutList, loading };
}
