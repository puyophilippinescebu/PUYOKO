export type PropertyStatus = "Active" | "Pending" | "Sold" | "Archived";

export interface Property {
  id: string;
  title: string;
  price: number;
  currency?: string;
  status: PropertyStatus;
  city: string;
  address: string;
  mapsLink: string;
  landmarks?: string;
  tags: string[];
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  type: "For Sale" | "For Rent";
}

export interface StatCard {
  label: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
}
