import { useEffect, useState } from "react";

export function useRegionsList() {
  const [regionsList, setRegionsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegions() {
      try {
        // קריאה דרך השרת שלנו כדי להימנע מבעיות CORS
        const res = await fetch("/api/regions");
        const data = await res.json();

        if (data.success && data.regions) {
          setRegionsList(data.regions);
        } else {
          setRegionsList([]);
        }
      } catch (err) {
        console.error("Error loading region list:", err);
        setRegionsList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRegions();
  }, []);

  return { regionsList, loading };
}
