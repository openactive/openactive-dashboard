import type { AreasResponse } from "../../types/areas";

/**
 * Minimal raw /areas payload: England with regions, Scotland flat (no regions).
 * District codes are realistic ONS-style values; names are chosen for area-selection
 * and map-resolution tests (e.g. Lewes basemap label vs hierarchy name).
 */
export const sampleAreasResponse: AreasResponse = {
  England: {
    country_code: "E92000001",
    regions: [
      {
        "North East": {
          region_code: "E12000001",
          districts: [
            {
              district_name: "Hartlepool",
              district_code: "E06000001",
            },
            {
              district_name: "Middlesbrough",
              district_code: "E06000002",
            },
          ],
        },
      },
      {
        "South East": {
          region_code: "E12000008",
          districts: [
            {
              district_name: "Lewes District",
              district_code: "E06000059",
            },
          ],
        },
      },
    ],
  },
  Scotland: {
    country_code: "S92000003",
    districts: [
      {
        district_name: "Highland",
        district_code: "S12000017",
      },
    ],
  },
};
