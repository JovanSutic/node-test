import type { SocialBracket, TaxBracket } from "../types/flow.types";

interface Regions {
  name: string;
  region: string;
}

export const spanishTaxBrackets: TaxBracket[] = [
  {
    from: 0,
    to: 12450,
    rate: 9.5,
  },
  {
    from: 12450.01,
    to: 20200,
    rate: 12,
  },
  {
    from: 20200.01,
    to: 35200,
    rate: 15,
  },
  {
    from: 35200.01,
    to: 60000,
    rate: 18.5,
  },
  {
    from: 60000.01,
    to: 300000,
    rate: 22.5,
  },
  {
    from: 300000.01,
    to: Infinity,
    rate: 24.5,
  },
];

export const regionsSpain: Record<string, Regions> = {
  "231": { name: "A Corunna", region: "Galicia" },
  "224": { name: "Alicante", region: "Valencian Community" },
  "243": { name: "Almeria", region: "Andalusia" },
  "219": { name: "Barcelona", region: "Catalonia" },
  "221": { name: "Bilbao", region: "Basque Country" },
  "242": { name: "Cadiz", region: "Andalusia" },
  "235": { name: "Cartagena", region: "Region of Murcia" },
  "245": { name: "Castellon de la Plana", region: "Valencian Community" },
  "237": { name: "Cordoba", region: "Andalusia" },
  "229": { name: "Gijon", region: "Asturias" },
  "241": { name: "Girona", region: "Catalonia" },
  "236": { name: "Granada", region: "Andalusia" },
  "248": { name: "Huelva", region: "Andalusia" },
  "225": { name: "Las Palmas", region: "Canary Islands" },
  "218": { name: "Madrid", region: "Community of Madrid" },
  "222": { name: "Malaga", region: "Andalusia" },
  "244": { name: "Marbella", region: "Andalusia" },
  "226": { name: "Murcia", region: "Region of Murcia" },
  "228": { name: "Oviedo", region: "Asturias" },
  "234": { name: "Palma de Mallorca", region: "Balearic Islands" },
  "247": { name: "Pamplona", region: "Navarre" },
  "239": { name: "Salamanca", region: "Castile and León" },
  "232": { name: "San Sebastian", region: "Basque Country" },
  "246": { name: "Santa Cruz de Tenerife", region: "Canary Islands" },
  "230": { name: "Santander", region: "Cantabria" },
  "220": { name: "Seville", region: "Andalusia" },
  "240": { name: "Tarragona", region: "Catalonia" },
  "223": { name: "Valencia", region: "Valencian Community" },
  "238": { name: "Valladolid", region: "Castile and León" },
  "233": { name: "Vigo", region: "Galicia" },
};

export const regionalTaxBrackets: Record<string, TaxBracket[]> = {
  Andalusia: [
    { from: 0, to: 13000, rate: 9.5 },
    { from: 13000.01, to: 21100, rate: 12.0 },
    { from: 21100.01, to: 35200, rate: 15.0 },
    { from: 35200.01, to: 60000, rate: 18.5 },
    { from: 60000.01, to: Number.POSITIVE_INFINITY, rate: 22.5 },
  ],
  "Balearic Islands": [
    {
      from: 0,
      to: 10000,
      rate: 9.5,
    },
    {
      from: 10000.01,
      to: 18000,
      rate: 11.75,
    },
    {
      from: 18000.01,
      to: 30000,
      rate: 14.75,
    },
    {
      from: 30000.01,
      to: 48000,
      rate: 17.75,
    },
    {
      from: 48000.01,
      to: 70000,
      rate: 19.25,
    },
    {
      from: 70000.01,
      to: 90000,
      rate: 22.0,
    },
    {
      from: 90000.01,
      to: 120000,
      rate: 23.0,
    },
    {
      from: 120000.01,
      to: 175000,
      rate: 24.0,
    },
    {
      from: 175000.01,
      to: Number.POSITIVE_INFINITY,
      rate: 25.0,
    },
  ],
  Catalonia: [
    { from: 0, to: 12450, rate: 10.5 },
    { from: 12450.01, to: 17707.2, rate: 12.0 },
    { from: 17707.21, to: 21000, rate: 14.0 },
    { from: 21000.01, to: 33007.2, rate: 15.0 },
    { from: 33007.21, to: 53407.2, rate: 18.8 },
    { from: 53407.21, to: 90000, rate: 21.5 },
    { from: 90000.01, to: 120000, rate: 23.5 },
    { from: 120000.01, to: 175000, rate: 24.5 },
    { from: 175000.01, to: Number.POSITIVE_INFINITY, rate: 25.5 },
  ],
  "Valencian Community": [
    { from: 0, to: 12000, rate: 9.0 },
    { from: 12000.01, to: 22000, rate: 12.0 },
    { from: 22000.01, to: 32000, rate: 15.0 },
    { from: 32000.01, to: 42000, rate: 17.5 },
    { from: 42000.01, to: 52000, rate: 20.0 },
    { from: 52000.01, to: 65000, rate: 22.5 },
    { from: 65000.01, to: 72000, rate: 25.0 },
    { from: 72000.01, to: 100000, rate: 26.5 },
    { from: 100000.01, to: 150000, rate: 27.5 },
    { from: 150000.01, to: 200000, rate: 28.5 },
    { from: 200000.01, to: Number.POSITIVE_INFINITY, rate: 29.5 },
  ],
  Galicia: [
    { from: 0, to: 12985.35, rate: 9.0 },
    { from: 12985.35, to: 21068.6, rate: 11.65 },
    { from: 21068.6, to: 35200.0, rate: 14.9 },
    { from: 35200.0, to: 60000.0, rate: 18.4 },
    { from: 60000.0, to: Number.POSITIVE_INFINITY, rate: 22.5 },
  ],
  Asturias: [
    { from: 0, to: 12450.0, rate: 10.0 },
    { from: 12450.0, to: 20200.0, rate: 12.0 },
    { from: 20200.0, to: 35200.0, rate: 15.0 },
    { from: 35200.0, to: 45200.0, rate: 18.5 },
    { from: 45200.0, to: 60200.0, rate: 21.0 },
    { from: 60200.0, to: 240200.0, rate: 22.5 },
    { from: 240200.0, to: Number.POSITIVE_INFINITY, rate: 25.5 },
  ],
  "Canary Islands": [
    { from: 0, to: 12450.0, rate: 9.0 },
    { from: 12450.0, to: 20200.0, rate: 12.0 },
    { from: 20200.0, to: 35200.0, rate: 14.0 },
    { from: 35200.0, to: 60000.0, rate: 18.5 },
    { from: 60000.0, to: 90000.0, rate: 22.5 },
    { from: 90000.0, to: Number.POSITIVE_INFINITY, rate: 25.0 },
  ],
  Cantabria: [
    { from: 0, to: 13000, rate: 8.5 },
    { from: 13000.01, to: 21000, rate: 11 },
    { from: 21000.01, to: 35200, rate: 14.5 },
    { from: 35200.01, to: 60000, rate: 18 },
    { from: 60000.01, to: 90000, rate: 22.5 },
    { from: 90000.01, to: Number.POSITIVE_INFINITY, rate: 24.5 },
  ],
  "Castile and León": [
    { from: 0, to: 12450, rate: 9.5 },
    { from: 12450.01, to: 20200, rate: 12.0 },
    { from: 20200.01, to: 35200, rate: 14.0 },
    { from: 35200.01, to: 53407.2, rate: 18.5 },
    { from: 53407.21, to: Number.POSITIVE_INFINITY, rate: 21.5 },
  ],
  Navarre: [
    { from: 0, to: 4458, rate: 13.0 },
    { from: 4458.01, to: 10030, rate: 22.0 },
    { from: 10030.01, to: 21175, rate: 25.0 },
    { from: 21175.01, to: 35663, rate: 28.0 },
    { from: 35663.01, to: 51266, rate: 36.5 },
    { from: 51266.01, to: 66869, rate: 41.5 },
    { from: 66869.01, to: 89159, rate: 44.0 },
    { from: 89159.01, to: 139310, rate: 47.0 },
    { from: 139310.01, to: 195034, rate: 49.0 },
    { from: 195034.01, to: 334344, rate: 50.5 },
    { from: 334344.01, to: Number.POSITIVE_INFINITY, rate: 54.0 },
  ],
  "Basque Country": [
    {
      from: 0,
      to: 8059,
      rate: 13.0,
    },
    {
      from: 8059.01,
      to: 12160,
      rate: 16.5,
    },
    {
      from: 12160.01,
      to: 17233,
      rate: 22.0,
    },
    {
      from: 17233.01,
      to: 22306,
      rate: 25.0,
    },
    {
      from: 22306.01,
      to: 28400,
      rate: 32.0,
    },
    {
      from: 28400.01,
      to: 41629,
      rate: 35.5,
    },
    {
      from: 41629.01,
      to: 44987,
      rate: 43.5,
    },
    {
      from: 44987.01,
      to: 83696,
      rate: 45.0,
    },
    {
      from: 83696.01,
      to: Number.POSITIVE_INFINITY,
      rate: 48.0,
    },
  ],
  "Region of Murcia": [
    {
      from: 0,
      to: 12450,
      rate: 9.5,
    },
    {
      from: 12450.01,
      to: 20200,
      rate: 11.2,
    },
    {
      from: 20200.01,
      to: 34000,
      rate: 13.3,
    },
    {
      from: 34000.01,
      to: 60000,
      rate: 17.9,
    },
    {
      from: 60000.01,
      to: Number.POSITIVE_INFINITY,
      rate: 22.5,
    },
  ],
  "Community of Madrid": [
    {
      from: 0,
      to: 13362.22,
      rate: 8.5,
    },
    {
      from: 13362.23,
      to: 19004.63,
      rate: 10.7,
    },
    {
      from: 19004.64,
      to: 35425.68,
      rate: 12.8,
    },
    {
      from: 35425.69,
      to: 60000,
      rate: 17.4,
    },
    {
      from: 60000.01,
      to: Number.POSITIVE_INFINITY,
      rate: 20.5,
    },
  ],
};

export const socialBrackets: SocialBracket[] = [
  {
    from: 0,
    to: 670,
    fee: 200,
  },
  {
    from: 670.01,
    to: 900,
    fee: 220,
  },
  {
    from: 900.01,
    to: 1125.9,
    fee: 260,
  },
  {
    from: 1125.91,
    to: 1300,
    fee: 280,
  },
  {
    from: 1300.01,
    to: 1500,
    fee: 294,
  },
  {
    from: 1500.01,
    to: 1700,
    fee: 294,
  },
  {
    from: 1700.01,
    to: 1900,
    fee: 350,
  },
  {
    from: 1900.01,
    to: 2330,
    fee: 390,
  },
  {
    from: 2330.01,
    to: 2760,
    fee: 415,
  },
  {
    from: 2760.01,
    to: 3190,
    fee: 440,
  },
  {
    from: 3190.01,
    to: 3620,
    fee: 465,
  },
  {
    from: 3620.01,
    to: 4050,
    fee: 490,
  },
  {
    from: 4050.01,
    to: 6000,
    fee: 530,
  },
  {
    from: 6000.01,
    to: Infinity,
    fee: 590,
  },
];

export const portugalMainlandTaxBrackets: TaxBracket[] = [
  {
    from: 0,
    to: 8059,
    rate: 13.0,
  },
  {
    from: 8059.01,
    to: 12160,
    rate: 16.5,
  },
  {
    from: 12160.01,
    to: 17233,
    rate: 22.0,
  },
  {
    from: 17233.01,
    to: 22306,
    rate: 25.0,
  },
  {
    from: 22306.01,
    to: 28400,
    rate: 32.0,
  },
  {
    from: 28400.01,
    to: 41629,
    rate: 35.5,
  },
  {
    from: 41629.01,
    to: 44987,
    rate: 43.5,
  },
  {
    from: 44987.01,
    to: 83696,
    rate: 45.0,
  },
  {
    from: 83696.01,
    to: Infinity,
    rate: 48.0,
  },
];

export const madeiraTaxBrackets: TaxBracket[] = [
  {
    from: 0,
    to: 8059,
    rate: 10.15,
  },
  {
    from: 8059.01,
    to: 12160,
    rate: 14.7,
  },
  {
    from: 12160.01,
    to: 17233,
    rate: 18.55,
  },
  {
    from: 17233.01,
    to: 22306,
    rate: 19.95,
  },
  {
    from: 22306.01,
    to: 28400,
    rate: 29.75,
  },
  {
    from: 28400.01,
    to: 41629,
    rate: 33.67,
  },
  {
    from: 41629.01,
    to: 44987,
    rate: 42.2,
  },
  {
    from: 44987.01,
    to: 83696,
    rate: 43.65,
  },
  {
    from: 83696.01,
    to: Infinity,
    rate: 47.52,
  },
];

export const azoresTaxBrackets: TaxBracket[] = [
  {
    from: 0,
    to: 8059,
    rate: 10.15,
  },
  {
    from: 8059.01,
    to: 12160,
    rate: 14.7,
  },
  {
    from: 12160.01,
    to: 17233,
    rate: 18.55,
  },
  {
    from: 17233.01,
    to: 22306,
    rate: 19.95,
  },
  {
    from: 22306.01,
    to: 28400,
    rate: 24.5,
  },
  {
    from: 28400.01,
    to: 41629,
    rate: 25.9,
  },
  {
    from: 41629.01,
    to: 44987,
    rate: 30.45,
  },
  {
    from: 44987.01,
    to: 83696,
    rate: 31.5,
  },
  {
    from: 83696.01,
    to: Infinity,
    rate: 33.6,
  },
];

export function getPortugalBrackets(cityId: number) {
  if(cityId === 156) {
    return madeiraTaxBrackets;
  }

  return portugalMainlandTaxBrackets;
}
