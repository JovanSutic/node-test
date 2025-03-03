import { CreateCityDto } from "../src/cities/cities.dto";

export const users = [
  { name: "Jovan" },
  { name: "John" },
  { name: "Jane" },
  { name: "Nick" },
  { name: "Lola" },
];

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
