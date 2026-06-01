import type {
  AreasResponse,
  AreaCountry,
  AreaCountryWithRegions,
} from "../types/areas";
import type { GeoArea, GeoCountry, GeoHierarchy, GeoRegion } from "./geo-hierarchy";

function hasRegions(country: AreaCountry): country is AreaCountryWithRegions {
  return "regions" in country;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/**
 * Transform the raw /areas API response into the GeoHierarchy shape
 * consumed by AreaHierarchyPicker and filter logic.
 */
export function transformAreasToHierarchy(raw: AreasResponse): GeoHierarchy {
  const countries: GeoCountry[] = Object.entries(raw)
    .map(([countryName, countryData]) => {
      const countryId = slugify(countryName);

      let regions: GeoRegion[];

      if (hasRegions(countryData)) {
        regions = countryData.regions.map((regionObj) => {
          const [regionName, regionData] = Object.entries(regionObj)[0];
          const areas: GeoArea[] = regionData.districts.map((d) => ({
            name: d.district_name,
            geoCode: d.district_code,
            geoType: "lad" as const,
          }));

          return {
            id: slugify(regionName),
            code: regionData.region_code,
            label: regionName,
            areas: areas.sort((a, b) => a.name.localeCompare(b.name, "en")),
          };
        });
      } else {
        const areas: GeoArea[] = countryData.districts.map((d) => ({
          name: d.district_name,
          geoCode: d.district_code,
          geoType: "lad" as const,
        }));

        regions = [
          {
            id: countryId,
            code: countryData.country_code,
            label: countryName,
            areas: areas.sort((a, b) => a.name.localeCompare(b.name, "en")),
          },
        ];
      }

      return {
        id: countryId,
        code: countryData.country_code,
        label: countryName,
        regions: regions.sort((a, b) => a.label.localeCompare(b.label, "en")),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "en"));

  return { countries };
}
