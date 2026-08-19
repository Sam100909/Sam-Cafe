import { MENU_IMAGE_PATHS } from "./menu-images.js";

// Local fallback. It keeps the cafe menu usable before Firebase is configured
// and is also the data source for the one-time admin import.
export const FALLBACK_MENU_ITEMS = [
  { name: "Espresso", description: "Rich and concentrated, single shot.", price: 8, category: "Coffee", imageUrl: MENU_IMAGE_PATHS["Espresso"], available: true, featured: false, sortOrder: 10 },
  { name: "Americano", description: "Espresso lengthened with hot water.", price: 9, category: "Coffee", imageUrl: MENU_IMAGE_PATHS["Americano"], available: true, featured: false, sortOrder: 20 },
  { name: "Latte", description: "Espresso with silky steamed milk.", price: 12, category: "Coffee", imageUrl: MENU_IMAGE_PATHS["Latte"], available: true, featured: true, sortOrder: 30 },
  { name: "Cappuccino", description: "Espresso, steamed milk and foam.", price: 12, category: "Coffee", imageUrl: MENU_IMAGE_PATHS["Cappuccino"], available: true, featured: false, sortOrder: 40 },
  { name: "English Breakfast Tea", description: "A warming black tea, served simply.", price: 8, category: "Tea", imageUrl: MENU_IMAGE_PATHS["English Breakfast Tea"], available: true, featured: false, sortOrder: 50 },
  { name: "Matcha Latte", description: "Stone-ground matcha, steamed milk.", price: 14, category: "Matcha", imageUrl: MENU_IMAGE_PATHS["Matcha Latte"], available: true, featured: true, sortOrder: 60 },
  { name: "Basque Cheesecake", description: "Caramelised top, creamy centre.", price: 15, category: "Desserts", imageUrl: MENU_IMAGE_PATHS["Basque Cheesecake"], available: true, featured: true, sortOrder: 70 },
  { name: "Tiramisu", description: "Espresso-soaked layers, cocoa dusted.", price: 15, category: "Desserts", imageUrl: MENU_IMAGE_PATHS["Tiramisu"], available: true, featured: false, sortOrder: 80 },
  { name: "Croissant", description: "Buttery, flaky, baked fresh.", price: 9, category: "Pastries", imageUrl: MENU_IMAGE_PATHS["Croissant"], available: true, featured: false, sortOrder: 90 }
];

export const MENU_CATEGORIES = ["Coffee", "Tea", "Matcha", "Desserts", "Pastries"];
