import { Property } from "./types";

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "PK-9999",
    title: "La Casa del Gobernador",
    price: 155000000,
    status: "Active",
    city: "Cebu City",
    address: "Maria Luisa Estate Park, Banilad, Cebu City, 6000",
    mapsLink: "https://maps.google.com/?q=Maria+Luisa+Estate+Park+Cebu",
    tags: ["Ultra Luxury", "Historical", "Premium"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687644-b04fd5ee0420?auto=format&fit=crop&q=80&w=1200"
    ],
    bedrooms: 7,
    bathrooms: 8,
    area: 1200,
    description: "An authentic recreation of a Spanish-colonial governor's mansion built with modern seismic-resistant engineering and smart climate control. This estate features imported Machuca tiles, a 25-meter lap pool, and a private wine cellar. Masterfully curated by our lead archivist.",
    type: "For Sale",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "PK-9021",
    title: "The Emerald Courtyard",
    price: 85000000,
    status: "Active",
    city: "Cebu City",
    address: "Busay Heights, Cebu City, 6000",
    mapsLink: "https://maps.google.com/?q=Busay+Heights+Cebu",
    tags: ["Luxury", "View", "Pool", "Heritage"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200"
    ],
    bedrooms: 5,
    bathrooms: 6,
    area: 750,
    description: "A monumental restoration project merging a historic 19th-century foundation with avant-garde sustainable engineering. This estate represents the pinnacle of Cebuano luxury, blending the traditional Bahay na Bato aesthetic with modern structural glass and smart home integration.",
    type: "For Sale",
    originalPrice: 95000000
  },
  {
    id: "PK-7712",
    title: "Vista Mar Residence",
    price: 32500000,
    status: "Pending",
    city: "Lapu-Lapu City",
    address: "Mactan Newtown, Lapu-Lapu City, 6015",
    mapsLink: "https://maps.google.com/?q=Mactan+Newtown",
    tags: ["Coastal", "Modern", "Exclusive"],
    images: [
      "https://images.unsplash.com/photo-1512918766775-d56a176003b0?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
    ],
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    description: "Contemporary coastal living inspired by local fishing village geometries. This residence offers panoramic views of the Hilutungan Channel and features a private infinity pool that seems to merge with the sea.",
    type: "For Sale"
  },
  {
    id: "PK-4421",
    title: "Heritage Loft",
    price: 18900000,
    status: "Active",
    city: "Cebu City",
    address: "Talisay, Cebu City, 6045",
    mapsLink: "https://maps.google.com/?q=Talisay+Cebu",
    tags: ["Urban", "Capiz", "Minimalist"],
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1200"
    ],
    bedrooms: 2,
    bathrooms: 2,
    area: 145,
    description: "Mactan Island's premier vertical living space with Capiz-shell inspired facades. This loft features polished concrete floors and dark wood accents that pay homage to traditional Cebuano craft.",
    type: "For Sale"
  },
  {
    id: "PK-1102",
    title: "Skyline Penthouse",
    price: 120000,
    status: "Active",
    city: "Cebu City",
    address: "IT Park, Cebu City, 6000",
    mapsLink: "https://maps.google.com/?q=Cebu+IT+Park",
    tags: ["High-rise", "Urban", "Tech"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200"
    ],
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    description: "An elegant high-rise penthouse interior with floor-to-ceiling windows showing a sprawling cityscape of Cebu at night. Located in the heart of Cebu's technology hub.",
    type: "For Rent",
    pricePeriod: "monthly"
  }
];
