export type DemoData = {
  address: string;
  agent: string;
  contact: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  latitude: number;
  longitude: number;
  distance_miles: number;
  source?: string;
};

export const DEMO_DATA: DemoData[] = [
  {
    address: "1010 Lamar St, Houston, TX 77002",
    agent: "Carlos Ramirez",
    contact: "c.ramirez@houstonrealty.com",
    price: "$499,000",
    bedrooms: 2,
    bathrooms: 2,
    latitude: 29.7589,
    longitude: -95.3677,
    distance_miles: 3.62,
  },
  {
    address: "2020 Westheimer Rd, Houston, TX 77098",
    agent: "Tina Nguyen",
    contact: "tina@westhoustonhomes.com",
    price: "$650,000",
    bedrooms: 4,
    bathrooms: 3,
    latitude: 29.7447,
    longitude: -95.4105,
    distance_miles: 1.33,
  },
  {
    address: "3030 Memorial Dr, Houston, TX 77007",
    agent: "Derek Lee",
    contact: "dlee@memorialrealty.com",
    price: "$720,000",
    bedrooms: 5,
    bathrooms: 4,
    latitude: 29.7703,
    longitude: -95.4266,
    distance_miles: 3.17,
  },
  {
    address: "4040 Bellaire Blvd, Houston, TX 77025",
    agent: "Monica Patel",
    contact: "monica.patel@houstonhomes.com",
    price: "$580,000",
    bedrooms: 3,
    bathrooms: 2.5,
    latitude: 29.705,
    longitude: -95.4391,
    distance_miles: 2.06,
  },
  {
    address: "5050 Kirby Dr, Houston, TX 77098",
    agent: "Nathan Scott",
    contact: "n.scott@kirbyrealty.com",
    price: "$610,000",
    bedrooms: 4,
    bathrooms: 3,
    latitude: 29.7262,
    longitude: -95.4185,
    distance_miles: 0.25,
  },

  {
    address: "5050 Kirby Dr, Houston, TX 77098",
    agent: "Nathan Scott",
    contact: "n.scott@kirbyrealty.com",
    price: "$610,000",
    bedrooms: 4,
    bathrooms: 3,
    latitude: 29.7261,
    longitude: -95.4184,
    distance_miles: 0.25,
  },
  {
    address: "4040 Bellaire Blvd, Houston, TX 77025",
    agent: "Monica Patel",
    contact: "monica.patel@houstonhomes.com",
    price: "$580,000",
    bedrooms: 3,
    bathrooms: 2.5,
    latitude: 29.704,
    longitude: -95.439,
    distance_miles: 2.06,
  },
  {
    address: "2020 Westheimer Rd, Houston, TX 77098",
    agent: "Tina Nguyen",
    contact: "tina@westhoustonhomes.com",
    price: "$650,000",
    bedrooms: 4,
    bathrooms: 3,
    latitude: 29.7446,
    longitude: -95.4104,
    distance_miles: 1.33,
  },
  {
    address: "3030 Memorial Dr, Houston, TX 77007",
    agent: "Derek Lee",
    contact: "dlee@memorialrealty.com",
    price: "$720,000",
    bedrooms: 5,
    bathrooms: 4,
    latitude: 29.7702,
    longitude: -95.4265,
    distance_miles: 3.17,
  },
];
