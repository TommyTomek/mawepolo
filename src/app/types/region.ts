export interface Region {
  slug: string;

  hero: {
    title: string;
    image: string;
    stats: RegionStats;
    description: string;
  };

  cities: RegionItem[];
  territory: RegionItem[];
  gastronomy: RegionItem[];
  culture: RegionItem[];
  economy: RegionItem[];
}

export interface RegionStats {
  capital: string;
  population: string;
  area: string;
  density?: string;
  gdp?: string;
  provinces?: number;
  counties?: number;
}

export interface RegionItem {
  slug: string;
  title: string;
  text: string;
  img: string;
}
