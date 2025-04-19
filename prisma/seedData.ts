import { CreateCityDto } from "../src/cities/cities.dto";
import { CreateProductDto } from "../src/products/products.dto";
import { CreateYearDto } from "../src/years/years.dto";
import { CreateCategoryDto } from '../src/categories/categories.dto';

export const categories: CreateCategoryDto[] = [
  {name: "Restaurants"},
  {name: "Markets"},
  {name: "Rent per month"},
  {name: "Utilities"},
  {name: "Clothing and shoes"},
  {name: "Sport and leisure"},
]

export const cities: CreateCityDto[] = [
  {
    name: "Belgrade",
    country: "Serbia",
    search: "Belgrade",
    lat: 44.12345,
    lng: 24.1234,
    seaside: false
  },
  {
    name: "Budapest",
    country: "Hungary",
    search: "Belgrade",
    lat: 44.12345,
    lng: 24.1234,
    seaside: false
  },
  {
    name: "Athens",
    country: "Greece",
    search: "Athens",
    lat: 44.12345,
    lng: 24.1234,
    seaside: true
  },
  {
    name: "Berlin",
    country: "Germany",
    search: "Berlin",
    lat: 44.12345,
    lng: 24.1234,
    seaside: false
  },
  {
    name: "Madrid",
    country: "Spain",
    search: "Madrid",
    lat: 44.12345,
    lng: 24.1234,
    seaside: false
  },
  {
    name: "Rome",
    country: "Italy",
    search: "Rome",
    lat: 44.12345,
    lng: 24.1234,
    seaside: true
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
