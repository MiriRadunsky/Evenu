import api from "@/services/axios";
import { useEffect, useState } from "react";

export function useRegionsList() {
  const [regionsList, setRegionsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegions() {
      try {
        // const res = await fetch("/api/regions");
        const res=await api.get("/regions");
        // const data = await res.json();

        if (res.data.success && res.data.regions) {
          setRegionsList(res.data.regions);
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
