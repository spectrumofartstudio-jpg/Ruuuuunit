export interface SubItem {
  id: string;
  name: string;
  quantity: number;
}

export interface Asset {
  id: string;
  name: string;
  quantity: number;
  image?: string; // base64 string
  category: string;
  createdAt: number;
  subItems?: SubItem[];
  color?: string;
}

export interface Inventory {
  id: string;
  name: string;
  icon: string;
}

export type ViewMode = 'grid' | 'list';

export type ThemeType = 'default' | 'night' | 'kawaii' | 'donkey' | 'strawberry' | 'blackwhite';

export interface Theme {
  id: ThemeType;
  name: string;
  bg: string;
  sidebar: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
}
