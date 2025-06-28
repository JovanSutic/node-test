import { CreateCityDto } from "../src/cities/cities.dto";
import { CreateProductDto } from "../src/products/products.dto";
import { CreateYearDto } from "../src/years/years.dto";
import { CreateCategoryDto } from "../src/categories/categories.dto";
import { CreatePriceDto, PriceType } from "../src/prices/prices.dto";
import {
  CreateCrimeAspectDto,
  CreateCrimeRankDto,
} from "../src/crimes/crimes.dto";
import {
  CreateSocialLifestyleDto,
  SocialType,
} from "../src/social_lifestyle/social_lifestyle.dto";
import { CreateWeathersDto, WeathersDto } from "../src/weathers/weathers.dto";
import { CreateCountryDto } from "../src/countries/countries.dto";

export const categories: CreateCategoryDto[] = [
  { name: "Restaurants" },
  { name: "Markets" },
  { name: "Rent per month" },
  { name: "Utilities" },
  { name: "Clothing and shoes" },
  { name: "Sport and leisure" },
];

export const countries: CreateCountryDto[] = [
  { name: "Italy" },
  { name: "Spain" },
  { name: "Netherlands" },
  { name: "France" },
  { name: "Germany" },
  { name: "Austria" },
  { name: "Hungary" },
  { name: "Serbia" },
  { name: "Greece" },
];

export const cities: CreateCityDto[] = [
  {
    name: "Amsterdam",
    country: "Netherlands",
    countriesId: 3,
    search: "Amsterdam",
    lat: 52.377956,
    lng: 4.89707,
    size: 2000000,
    seaside: true,
  },
  {
    name: "Paris",
    country: "France",
    countriesId: 4,
    search: "Paris",
    lat: 48.858093,
    lng: 2.294694,
    size: 6000000,
    seaside: false,
  },
  {
    name: "Rome",
    country: "Italy",
    countriesId: 1,
    search: "Rome",
    lat: 41.89193,
    lng: 12.51133,
    size: 5000000,
    seaside: false,
  },
  {
    name: "Barcelona",
    country: "Spain",
    countriesId: 2,
    search: "Barcelona",
    lat: 41.38879,
    lng: 2.15899,
    size: 4000000,
    seaside: true,
  },
  {
    name: "Madrid",
    country: "Spain",
    countriesId: 2,
    search: "Madrid",
    lat: 40.416775,
    lng: -3.70379,
    size: 5000000,
    seaside: false,
  },
  {
    name: "Berlin",
    country: "Germany",
    countriesId: 5,
    search: "Berlin",
    lat: 52.5373,
    lng: 13.356085,
    size: 4000000,
    seaside: false,
  },
  {
    name: "Vienna",
    country: "Austria",
    countriesId: 6,
    search: "Vienna",
    lat: 48.20849,
    lng: 16.37208,
    size: 4000000,
    seaside: false,
  },
  {
    name: "Budapest",
    country: "Hungary",
    countriesId: 7,
    search: "Budapest",
    lat: 47.526642,
    lng: 19.046394,
    size: 3000000,
    seaside: false,
  },
  {
    name: "Belgrade",
    country: "Serbia",
    countriesId: 8,
    search: "Belgrade",
    lat: 44.80401,
    lng: 20.46513,
    size: 2000000,
    seaside: false,
  },
  {
    name: "Athens",
    country: "Greece",
    search: "Athens",
    lat: 37.970833,
    lng: 23.72611,
    size: 3000000,
    seaside: false,
  },
];

export const years: CreateYearDto[] = [
  { year: 2017 },
  { year: 2018 },
  { year: 2019 },
  { year: 2020 },
  { year: 2021 },
  { year: 2022 },
  { year: 2023 },
  { year: 2024 },
];

export const products: CreateProductDto[] = [
  {
    name: "Man business shoes",
    categoryId: 5,
    unit: "1 pair",
    description: "just text",
  },
  {
    name: "Cinema ticket",
    categoryId: 6,
    unit: "1",
    description: "just text 1",
  },
];

export const prices: CreatePriceDto[] = [
  {
    price: 1.52,
    bottom: 1.01,
    top: 2.44,
    currency: "EUR",
    cityId: 1,
    productId: 1,
    yearId: 1,
    priceType: PriceType.HISTORICAL,
  },
  {
    price: 2.52,
    bottom: 2.01,
    top: 3.44,
    currency: "EUR",
    cityId: 1,
    productId: 1,
    yearId: 2,
    priceType: PriceType.HISTORICAL,
  },
  {
    price: 4.52,
    bottom: 3.01,
    top: 5.44,
    currency: "EUR",
    cityId: 2,
    productId: 1,
    yearId: 1,
    priceType: PriceType.HISTORICAL,
  },
  {
    price: 14.52,
    bottom: 13.01,
    top: 15.44,
    currency: "EUR",
    cityId: 2,
    productId: 1,
    yearId: 2,
    priceType: PriceType.HISTORICAL,
  },
  {
    price: 101.52,
    bottom: 101.01,
    top: 102.44,
    currency: "EUR",
    cityId: 1,
    productId: 1,
    yearId: 1,
    priceType: PriceType.CURRENT,
  },
  {
    price: 102.52,
    bottom: 102.01,
    top: 103.44,
    currency: "EUR",
    cityId: 1,
    productId: 1,
    yearId: 2,
    priceType: PriceType.CURRENT,
  },
  {
    price: 104.52,
    bottom: 103.01,
    top: 105.44,
    currency: "EUR",
    cityId: 2,
    productId: 1,
    yearId: 1,
    priceType: PriceType.CURRENT,
  },
  {
    price: 114.52,
    bottom: 113.01,
    top: 115.44,
    currency: "EUR",
    cityId: 2,
    productId: 1,
    yearId: 2,
    priceType: PriceType.CURRENT,
  },
  {
    price: 100,
    bottom: 103.01,
    top: 105.44,
    currency: "EUR",
    cityId: 4,
    productId: 1,
    yearId: 1,
    priceType: PriceType.CURRENT,
  },
  {
    price: 200,
    bottom: 113.01,
    top: 115.44,
    currency: "EUR",
    cityId: 5,
    productId: 1,
    yearId: 1,
    priceType: PriceType.CURRENT,
  },
  {
    price: 50,
    bottom: 103.01,
    top: 105.44,
    currency: "EUR",
    cityId: 4,
    productId: 2,
    yearId: 1,
    priceType: PriceType.CURRENT,
  },
  {
    price: 0.01,
    bottom: 113.01,
    top: 115.44,
    currency: "EUR",
    cityId: 5,
    productId: 2,
    yearId: 1,
    priceType: PriceType.CURRENT,
  },
];

export const socialLifeStyleReports: CreateSocialLifestyleDto[] = [
  {
    cityId: 1,
    yearId: 1,
    avg_price: 200,
    currency: "EUR",
    type: SocialType.SOLO,
  },
  {
    cityId: 2,
    yearId: 1,
    avg_price: 200,
    currency: "EUR",
    type: SocialType.SOLO,
  },
  {
    cityId: 2,
    yearId: 2,
    avg_price: 500,
    currency: "EUR",
    type: SocialType.SOLO,
  },
  {
    cityId: 2,
    yearId: 3,
    avg_price: 1200,
    currency: "EUR",
    type: SocialType.SOLO,
  },
];

export const crimeAspects: CreateCrimeAspectDto[] = [
  {
    name: "Level of crime",
  },
  {
    name: "Crime increasing in the past 5 years",
  },
  {
    name: "Worries home broken and things stolen",
  },
];

export const crimeRanks: CreateCrimeRankDto[] = [
  {
    cityId: 1,
    yearId: 1,
    crimeAspectId: 1,
    rank: 38.7,
  },
  {
    cityId: 1,
    yearId: 1,
    crimeAspectId: 2,
    rank: 68.7,
  },
  {
    cityId: 2,
    yearId: 1,
    crimeAspectId: 1,
    rank: 44.7,
  },
  {
    cityId: 2,
    yearId: 1,
    crimeAspectId: 2,
    rank: 5.7,
  },
];

export const weathers: CreateWeathersDto[] = [
  {
    cityId: 1,
    sunshine: 250,
    rain: 100,
    cold: 60,
    heat: 90,
    cold_extremes: 5,
    heat_extremes: 3,
    humidity: 75,
    severe: "Low risk of storms",
    lowest: -10,
    highest: 35,
  },
  {
    cityId: 2,
    sunshine: 250,
    rain: 120,
    cold: 60,
    heat: 90,
    cold_extremes: 5,
    heat_extremes: 3,
    humidity: 75,
    severe: "Low risk of winds",
    lowest: -10,
    highest: 35,
  },
];
