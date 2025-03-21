import { CreateCityDto } from "../src/cities/cities.dto";
import { CreateProductDto } from "../src/products/products.dto";
import { CreateYearDto } from "../src/years/years.dto";

export const cities: CreateCityDto[] = [
  {
    name: "Belgrade",
    country: "Serbia",
    numbeo_id: 12345,
  },
  {
    name: "Budapest",
    country: "Hungary",
    numbeo_id: 12346,
  },
  {
    name: "Athens",
    country: "Greece",
    numbeo_id: 12347,
  },
  {
    name: "Berlin",
    country: "Germany",
    numbeo_id: 12341,
  },
  {
    name: "Madrid",
    country: "Spain",
    numbeo_id: 12342,
  },
  {
    name: "Rome",
    country: "Italy",
    numbeo_id: 12343,
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
    category: "clothing and shoes",
    unit: "1 pair",
    description: "just text",
  },
  {
    name: "Cinema ticket",
    category: "sport and leisure",
    unit: "1",
    description: "just text 1",
  },
];
