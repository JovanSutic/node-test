export interface BudgetItem {
  productId: number;
  quantity: number;
  type?: "bottom" | "top" | "short";
}

export const SOLO_BUDGET: BudgetItem[] = [
  { productId: 27, quantity: 1 }, // Rent (1-bedroom city center)
  { productId: 38, quantity: 0.5 }, // Utilities
  { productId: 39, quantity: 1 }, // Internet
  { productId: 40, quantity: 1 }, // Mobile plan

  { productId: 1, quantity: 15 }, // Inexpensive restaurant meals
  { productId: 2, quantity: 6 }, // Mid-range 3-course meals
  { productId: 3, quantity: 5 }, // McMeal
  { productId: 8, quantity: 15 }, // Cappuccino
  { productId: 9, quantity: 8 }, // Milk
  { productId: 10, quantity: 9 }, // Bread
  { productId: 11, quantity: 2.5 }, // Eggs (12-pack)
  { productId: 12, quantity: 15 }, // Water (1.5L)
  { productId: 18, quantity: 3 }, // Rice
  { productId: 25, quantity: 3.5 }, // Chicken
  { productId: 26, quantity: 1.5 }, // Beef
  { productId: 14, quantity: 4 }, // Apples
  { productId: 20, quantity: 4 }, // Bananas
  { productId: 15, quantity: 3 }, // Oranges
  { productId: 19, quantity: 3 }, // Tomatoes
  { productId: 16, quantity: 3 }, // Potatoes
  { productId: 21, quantity: 1.5 }, // Onions
  { productId: 17, quantity: 7 }, // Lettuce
  { productId: 22, quantity: 2 }, // Cheese

  { productId: 13, quantity: 4 }, // Domestic beer (store)
  { productId: 48, quantity: 4 }, // Imported beer (store)
  { productId: 4, quantity: 10 }, // Domestic beer (restaurant)
  { productId: 5, quantity: 6 }, // Imported beer (restaurant)
  { productId: 23, quantity: 2 }, // Wine
  { productId: 24, quantity: 4 }, // Cigarettes

  { productId: 36, quantity: 1 }, // Monthly pass (public transport)
  { productId: 49, quantity: 4 }, // Taxi start
  { productId: 50, quantity: 20 }, // Taxi 1 km (5 km * 4 rides)

  { productId: 41, quantity: 1 }, // Fitness club
  { productId: 43, quantity: 2 }, // Cinema

  { productId: 44, quantity: 0.2 }, // Jeans
  { productId: 45, quantity: 0.2 }, // Summer dress
  { productId: 46, quantity: 0.2 }, // Running shoes
  { productId: 47, quantity: 0.2 }, // Leather business shoes
];

export const SOLO_BUDGET_LOW: BudgetItem[] = [
  { productId: 28, quantity: 1, type: "bottom" }, // Rent (1-bedroom city center)
  { productId: 38, quantity: 0.5 }, // Utilities
  { productId: 39, quantity: 1 }, // Internet
  { productId: 40, quantity: 1 }, // Mobile plan

  { productId: 1, quantity: 5 }, // Inexpensive restaurant meals
  { productId: 2, quantity: 2 }, // Mid-range 3-course meals
  { productId: 3, quantity: 2 }, // McMeal
  { productId: 8, quantity: 5 }, // Cappuccino
  { productId: 9, quantity: 10 }, // Milk
  { productId: 10, quantity: 14 }, // Bread
  { productId: 11, quantity: 4.5 }, // Eggs (12-pack)
  { productId: 12, quantity: 20 }, // Water (1.5L)
  { productId: 18, quantity: 5 }, // Rice
  { productId: 25, quantity: 5.5 }, // Chicken
  { productId: 26, quantity: 2.5 }, // Beef
  { productId: 14, quantity: 5 }, // Apples
  { productId: 20, quantity: 5 }, // Bananas
  { productId: 15, quantity: 4 }, // Oranges
  { productId: 19, quantity: 5 }, // Tomatoes
  { productId: 16, quantity: 5 }, // Potatoes
  { productId: 21, quantity: 2.5 }, // Onions
  { productId: 17, quantity: 9 }, // Lettuce
  { productId: 22, quantity: 3.5 }, // Cheese

  { productId: 13, quantity: 3 }, // Domestic beer (store)
  { productId: 48, quantity: 3 }, // Imported beer (store)
  { productId: 4, quantity: 2 }, // Domestic beer (restaurant)
  { productId: 5, quantity: 1 }, // Imported beer (restaurant)
  { productId: 23, quantity: 1 }, // Wine
  { productId: 24, quantity: 1 }, // Cigarettes

  { productId: 36, quantity: 1 }, // Monthly pass (public transport)
  { productId: 49, quantity: 2 }, // Taxi start
  { productId: 50, quantity: 5 }, // Taxi 1 km (2.5 km * 2 rides)

  { productId: 41, quantity: 1 }, // Fitness club
  { productId: 43, quantity: 1 }, // Cinema

  { productId: 44, quantity: 0.1 }, // Jeans
  { productId: 45, quantity: 0.1 }, // Summer dress
  { productId: 46, quantity: 0.1 }, // Running shoes
  { productId: 47, quantity: 0.05 }, // Leather business shoes
];

export const PAIR_BUDGET: BudgetItem[] = [
  { productId: 27, quantity: 1 }, // Rent
  { productId: 38, quantity: 0.5 }, // Utilities
  { productId: 39, quantity: 1 }, // Internet
  { productId: 40, quantity: 2 }, // Mobile plan

  { productId: 1, quantity: 25 }, // Inexpensive restaurant meals
  { productId: 2, quantity: 9 }, // Mid-range 3-course meals
  { productId: 3, quantity: 8 }, // McMeal
  { productId: 8, quantity: 25 }, // Cappuccino
  { productId: 9, quantity: 12 }, // Milk
  { productId: 10, quantity: 12 }, // Bread
  { productId: 11, quantity: 3.5 }, // Eggs (12-pack)
  { productId: 12, quantity: 25 }, // Water (1.5L)
  { productId: 18, quantity: 5 }, // Rice
  { productId: 25, quantity: 5.5 }, // Chicken
  { productId: 26, quantity: 2.5 }, // Beef
  { productId: 14, quantity: 6 }, // Apples
  { productId: 20, quantity: 6 }, // Bananas
  { productId: 15, quantity: 5 }, // Oranges
  { productId: 19, quantity: 5 }, // Tomatoes
  { productId: 16, quantity: 5 }, // Potatoes
  { productId: 21, quantity: 2.5 }, // Onions
  { productId: 17, quantity: 11 }, // Lettuce
  { productId: 22, quantity: 3.5 }, // Cheese

  { productId: 13, quantity: 7 }, // Domestic beer (store)
  { productId: 48, quantity: 7 }, // Imported beer (store)
  { productId: 4, quantity: 20 }, // Domestic beer (restaurant)
  { productId: 5, quantity: 12 }, // Imported beer (restaurant)
  { productId: 23, quantity: 4 }, // Wine
  { productId: 24, quantity: 7 }, // Cigarettes

  { productId: 36, quantity: 2 }, // Monthly pass (2 adults)
  { productId: 49, quantity: 6 }, // Taxi start
  { productId: 50, quantity: 30 }, // Taxi 1km (5km * 4 rides * 2)
  { productId: 41, quantity: 2 }, // Fitness club
  { productId: 43, quantity: 4 }, // Cinema

  { productId: 44, quantity: 0.4 }, // Jeans
  { productId: 45, quantity: 0.4 }, // Summer dress
  { productId: 46, quantity: 0.4 }, // Running shoes
  { productId: 47, quantity: 0.2 }, // Leather business shoes
];

export const PAIR_BUDGET_LOW: BudgetItem[] = [
  { productId: 28, quantity: 1, type: "bottom" }, // Rent (1-bedroom city center)
  { productId: 38, quantity: 0.5 }, // Utilities
  { productId: 39, quantity: 1 }, // Internet
  { productId: 40, quantity: 1 }, // Mobile plan

  { productId: 1, quantity: 10 }, // Inexpensive restaurant meals
  { productId: 2, quantity: 4 }, // Mid-range 3-course meals
  { productId: 3, quantity: 4 }, // McMeal
  { productId: 8, quantity: 10 }, // Cappuccino
  { productId: 9, quantity: 16 }, // Milk
  { productId: 10, quantity: 20 }, // Bread
  { productId: 11, quantity: 8 }, // Eggs (12-pack)
  { productId: 12, quantity: 35 }, // Water (1.5L)
  { productId: 18, quantity: 8 }, // Rice
  { productId: 25, quantity: 8.5 }, // Chicken
  { productId: 26, quantity: 4 }, // Beef
  { productId: 14, quantity: 8 }, // Apples
  { productId: 20, quantity: 8 }, // Bananas
  { productId: 15, quantity: 7 }, // Oranges
  { productId: 19, quantity: 8 }, // Tomatoes
  { productId: 16, quantity: 8 }, // Potatoes
  { productId: 21, quantity: 3.5 }, // Onions
  { productId: 17, quantity: 13 }, // Lettuce
  { productId: 22, quantity: 5.5 }, // Cheese

  { productId: 13, quantity: 6 }, // Domestic beer (store)
  { productId: 48, quantity: 6 }, // Imported beer (store)
  { productId: 4, quantity: 4 }, // Domestic beer (restaurant)
  { productId: 5, quantity: 4 }, // Imported beer (restaurant)
  { productId: 23, quantity: 2 }, // Wine
  { productId: 24, quantity: 4 }, // Cigarettes

  { productId: 36, quantity: 2 }, // Monthly pass (public transport)
  { productId: 49, quantity: 4 }, // Taxi start
  { productId: 50, quantity: 10 }, // Taxi 1 km (2.5 km * 2 rides)

  { productId: 41, quantity: 2 }, // Fitness club
  { productId: 43, quantity: 2 }, // Cinema

  { productId: 44, quantity: 0.2 }, // Jeans
  { productId: 45, quantity: 0.2 }, // Summer dress
  { productId: 46, quantity: 0.2 }, // Running shoes
  { productId: 47, quantity: 0.1 }, // Leather business shoes
];

export const FAMILY_BUDGET: BudgetItem[] = [
  { productId: 29, quantity: 0.7 }, // Rent
  { productId: 38, quantity: 1 }, // Utilities
  { productId: 39, quantity: 1 }, // Internet
  { productId: 40, quantity: 2 }, // Mobile plan

  { productId: 1, quantity: 25 }, // Inexpensive restaurant meals
  { productId: 2, quantity: 9 }, // Mid-range 3-course meals
  { productId: 3, quantity: 8 }, // McMeal
  { productId: 8, quantity: 25 }, // Cappuccino
  { productId: 9, quantity: 12 }, // Milk
  { productId: 10, quantity: 12 }, // Bread
  { productId: 11, quantity: 3.5 }, // Eggs (12-pack)
  { productId: 12, quantity: 25 }, // Water (1.5L)
  { productId: 18, quantity: 5 }, // Rice
  { productId: 25, quantity: 5.5 }, // Chicken
  { productId: 26, quantity: 2.5 }, // Beef
  { productId: 14, quantity: 6 }, // Apples
  { productId: 20, quantity: 6 }, // Bananas
  { productId: 15, quantity: 5 }, // Oranges
  { productId: 19, quantity: 5 }, // Tomatoes
  { productId: 16, quantity: 5 }, // Potatoes
  { productId: 21, quantity: 2.5 }, // Onions
  { productId: 17, quantity: 11 }, // Lettuce
  { productId: 22, quantity: 3.5 }, // Cheese

  { productId: 13, quantity: 7 }, // Domestic beer (store)
  { productId: 48, quantity: 7 }, // Imported beer (store)
  { productId: 4, quantity: 20 }, // Domestic beer (restaurant)
  { productId: 5, quantity: 12 }, // Imported beer (restaurant)
  { productId: 23, quantity: 4 }, // Wine
  { productId: 24, quantity: 7 }, // Cigarettes

  { productId: 36, quantity: 2 }, // Monthly pass (2 adults)
  { productId: 49, quantity: 6 }, // Taxi start
  { productId: 50, quantity: 30 }, // Taxi 1km (5km * 4 rides * 2)
  { productId: 41, quantity: 2 }, // Fitness club
  { productId: 43, quantity: 4 }, // Cinema

  { productId: 44, quantity: 0.4 }, // Jeans
  { productId: 45, quantity: 0.4 }, // Summer dress
  { productId: 46, quantity: 0.4 }, // Running shoes
  { productId: 47, quantity: 0.2 }, // Leather business shoes
];

export const FAMILY_BUDGET_LOW: BudgetItem[] = [
  { productId: 30, quantity: 0.7, type: "bottom" }, // Rent
  { productId: 38, quantity: 1 }, // Utilities
  { productId: 39, quantity: 1 }, // Internet
  { productId: 40, quantity: 2 }, // Mobile plan

  { productId: 1, quantity: 10 }, // Inexpensive restaurant meals
  { productId: 2, quantity: 4 }, // Mid-range 3-course meals
  { productId: 3, quantity: 4 }, // McMeal
  { productId: 8, quantity: 10 }, // Cappuccino
  { productId: 9, quantity: 16 }, // Milk
  { productId: 10, quantity: 20 }, // Bread
  { productId: 11, quantity: 8 }, // Eggs (12-pack)
  { productId: 12, quantity: 35 }, // Water (1.5L)
  { productId: 18, quantity: 8 }, // Rice
  { productId: 25, quantity: 8.5 }, // Chicken
  { productId: 26, quantity: 4 }, // Beef
  { productId: 14, quantity: 8 }, // Apples
  { productId: 20, quantity: 8 }, // Bananas
  { productId: 15, quantity: 7 }, // Oranges
  { productId: 19, quantity: 8 }, // Tomatoes
  { productId: 16, quantity: 8 }, // Potatoes
  { productId: 21, quantity: 3.5 }, // Onions
  { productId: 17, quantity: 13 }, // Lettuce
  { productId: 22, quantity: 5.5 }, // Cheese

  { productId: 13, quantity: 6 }, // Domestic beer (store)
  { productId: 48, quantity: 6 }, // Imported beer (store)
  { productId: 4, quantity: 4 }, // Domestic beer (restaurant)
  { productId: 5, quantity: 4 }, // Imported beer (restaurant)
  { productId: 23, quantity: 2 }, // Wine
  { productId: 24, quantity: 4 }, // Cigarettes

  { productId: 36, quantity: 2 }, // Monthly pass (public transport)
  { productId: 49, quantity: 4 }, // Taxi start
  { productId: 50, quantity: 10 }, // Taxi 1 km (2.5 km * 2 rides)

  { productId: 41, quantity: 2 }, // Fitness club
  { productId: 43, quantity: 2 }, // Cinema

  { productId: 44, quantity: 0.2 }, // Jeans
  { productId: 45, quantity: 0.2 }, // Summer dress
  { productId: 46, quantity: 0.2 }, // Running shoes
  { productId: 47, quantity: 0.1 }, // Leather business shoes
];

export const KID_BUDGET: BudgetItem[] = [
  { productId: 29, quantity: 0.15 }, // Rent
  { productId: 1, quantity: 5 }, // Inexpensive restaurant meals (fewer outings)
  { productId: 2, quantity: 1 }, // Mid-range 3-course meals (rarely)
  { productId: 3, quantity: 2 }, // McMeal (occasional)

  { productId: 9, quantity: 10 }, // Milk (more than adults)
  { productId: 10, quantity: 7 }, // Bread
  { productId: 11, quantity: 1.5 }, // Eggs (smaller portions)
  { productId: 12, quantity: 10 }, // Water
  { productId: 18, quantity: 2 }, // Rice
  { productId: 25, quantity: 2 }, // Chicken
  { productId: 26, quantity: 0.8 }, // Beef (less red meat)
  { productId: 14, quantity: 5 }, // Apples
  { productId: 20, quantity: 5 }, // Bananas
  { productId: 15, quantity: 3 }, // Oranges
  { productId: 19, quantity: 2 }, // Tomatoes
  { productId: 16, quantity: 2 }, // Potatoes
  { productId: 21, quantity: 1 }, // Onions
  { productId: 17, quantity: 4 }, // Lettuce
  { productId: 22, quantity: 1 }, // Cheese

  { productId: 36, quantity: 1 }, // Monthly pass (same, if commuting to school)
  { productId: 54, quantity: 0.5 }, // Preschool
  { productId: 55, quantity: 0.04 }, // School

  { productId: 44, quantity: 0.1 }, // Jeans
  { productId: 45, quantity: 0.1 }, // Summer dress
  { productId: 46, quantity: 0.1 }, // Running shoes
];
