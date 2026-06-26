export type GeoArea = {
  name: string;
  geoCode: string;
  geoType: "lad" | "county";
};

export type GeoRegion = {
  id: string;
  code: string;
  label: string;
  areas: GeoArea[];
};

export type GeoCountry = {
  id: string;
  code: string;
  label: string;
  regions: GeoRegion[];
};

export type GeoHierarchy = {
  countries: GeoCountry[];
};
