export interface RegionDetailBlock {
  readonly title: string;
  readonly text: string;
  readonly img: string;
}

export interface RegionDetail {
  readonly description: string;
  readonly blocks: readonly RegionDetailBlock[];
  readonly related?: readonly string[];
}

export interface RegionItem {
  readonly slug: string;
  readonly title: string;
  readonly text: string;
  readonly img: string;
}

export interface RelatedItem extends RegionItem {
  readonly category: string;
}