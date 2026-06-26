import type {
  ExplorerFilterOption,
  ExplorerFilters,
  ExplorerSummary,
} from "./explore-filters";
import type { GeoHierarchy } from "./geo-hierarchy";
import type { LocationScopedItem } from "./explorer-location-query";

export type MobilePanel = "none" | "filters" | "stats";

export interface ExplorerFilterControlProps {
  hierarchy: GeoHierarchy;
  filters: ExplorerFilters;
  publisherOptions: ExplorerFilterOption[];
  organizationOptions: ExplorerFilterOption[];
  activityOptions: ExplorerFilterOption[];
  onFiltersChange: (filters: ExplorerFilters) => void;
  onPublisherChange: (values: string[]) => void;
  onOrganizationChange: (values: string[]) => void;
  onActivityChange: (values: string[]) => void;
  onFilterOpenChange?: (item: LocationScopedItem, open: boolean) => void;
}

export interface ExplorerMobileChromeProps {
  panel: MobilePanel;
  onPanelChange: (panel: MobilePanel) => void;
  summary: ExplorerSummary;
  selectionLabel: string;
  filterProps: ExplorerFilterControlProps;
  isLoading?: boolean;
}
