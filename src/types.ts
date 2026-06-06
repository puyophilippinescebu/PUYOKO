export type PropertyStatus = "Active" | "Pending" | "Sold" | "Archived" | "Under Construction" | "Preselling";

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
  videoUrl?: string;
  pricePeriod?: string;
  originalPrice?: number;
  accommodatedBy?: string;
  createdBy?: string;
}

export interface PropertyRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  type: 'CREATE' | 'EDIT' | 'DELETE' | 'ARCHIVE';
  requestedBy: string;
  requestedAt: string;
  proposedData?: Partial<Property>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
}

export interface StatCard {
  label: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
}
