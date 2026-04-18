export interface Region {
  slug: string;

  hero: {
    title: string;
    image: string;
  };

  cities: RegionItem[];
  territory: RegionItem[];
  gastronomy: RegionItem[];
  culture: RegionItem[];
  economy: RegionItem[];
}

export interface RegionItem {
  slug: string;
  title: string;
  text: string;
  img: string;
}
