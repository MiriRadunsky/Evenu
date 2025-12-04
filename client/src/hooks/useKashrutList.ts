import { useEffect, useState } from "react";

export function useKashrutList() {
  const [kashrutList, setKashrutList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKashrut() {
      try {
        // קריאה דרך השרת שלנו כדי להימנע מבעיות CORS
        const res = await fetch("/api/kashrut");
        const data = await res.json();

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
