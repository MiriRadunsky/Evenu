import express from "express";

const router = express.Router();

// GET /api/cities - מחזיר רשימת ערים בישראל
router.get("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&limit=5000"
    );
    const data = await response.json();

    if (!data.result || !data.result.records) {
      console.error("Unexpected API response structure:", data);
      return res.status(500).json({ success: false, error: "Invalid API response" });
    }

    const cities = data.result.records
      .map((r) => r["שם_ישוב"] || r["name"] || r["city"])
      .filter((city) => city && city.trim() !== "" && !city.includes("(שבט)"))
      .sort((a, b) => a.localeCompare(b, "he"));

    const uniqueCities = [...new Set(cities)];
    res.json({ success: true, cities: uniqueCities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ success: false, error: "Failed to fetch cities" });
  }
});

export default router;
