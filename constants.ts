
import { 
  Booking, BookingStatus, Guest, Review, InventoryItem, 
  InventoryCategory, StaffLog, Transaction, TransactionType, ExpenseCategory,
  AdditionalService 
} from './types';

export const PROPERTY_NAME = "Wood Heaven Farms";

export const MOCK_GUESTS: Guest[] = [];
export const MOCK_BOOKINGS: Booking[] = [];
export const MOCK_SERVICES: AdditionalService[] = [];
export const MOCK_TRANSACTIONS: Transaction[] = [];
export const MOCK_STAFF_LOGS: StaffLog[] = [];

export const MOCK_INVENTORY: InventoryItem[] = [
  // REGULAR USABLES
  { id: 'u1', propertyId: 'prop-1', name: 'Shower Gel', category: InventoryCategory.USABLES, quantity: 5, minThreshold: 5, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u2', propertyId: 'prop-1', name: 'Shampoo', category: InventoryCategory.USABLES, quantity: 5, minThreshold: 5, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u3', propertyId: 'prop-1', name: 'Handwash', category: InventoryCategory.USABLES, quantity: 2.5, minThreshold: 2, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u4', propertyId: 'prop-1', name: 'Furniture Polish', category: InventoryCategory.USABLES, quantity: 5, minThreshold: 2, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u5', propertyId: 'prop-1', name: 'Glass Cleaner', category: InventoryCategory.USABLES, quantity: 5, minThreshold: 2, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u6', propertyId: 'prop-1', name: 'Harpic', category: InventoryCategory.USABLES, quantity: 1.5, minThreshold: 1, unit: 'Liters', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u7', propertyId: 'prop-1', name: 'Water Bottle', category: InventoryCategory.USABLES, quantity: 80, minThreshold: 24, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u8', propertyId: 'prop-1', name: 'Arome Liquid Diffuser', category: InventoryCategory.USABLES, quantity: 2, minThreshold: 1, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u9', propertyId: 'prop-1', name: 'Dental Kit', category: InventoryCategory.USABLES, quantity: 51, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u10', propertyId: 'prop-1', name: 'All Out Refill', category: InventoryCategory.USABLES, quantity: 17, minThreshold: 6, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u11', propertyId: 'prop-1', name: 'All Out Machines', category: InventoryCategory.USABLES, quantity: 9, minThreshold: 4, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u12', propertyId: 'prop-1', name: 'Air Freshners', category: InventoryCategory.USABLES, quantity: 2, minThreshold: 1, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u13', propertyId: 'prop-1', name: 'Tea', category: InventoryCategory.USABLES, quantity: 112, minThreshold: 50, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u14', propertyId: 'prop-1', name: 'Everyday Milk Sachets', category: InventoryCategory.USABLES, quantity: 212, minThreshold: 50, unit: 'Sachets', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u15', propertyId: 'prop-1', name: 'Bru Coffee Sachets', category: InventoryCategory.USABLES, quantity: 89, minThreshold: 50, unit: 'Sachets', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u16', propertyId: 'prop-1', name: 'Sugar Pouches', category: InventoryCategory.USABLES, quantity: 236, minThreshold: 100, unit: 'Pouches', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u17', propertyId: 'prop-1', name: 'Real Juice', category: InventoryCategory.USABLES, quantity: 3, minThreshold: 6, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u18', propertyId: 'prop-1', name: 'Tonic Water', category: InventoryCategory.USABLES, quantity: 28, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u19', propertyId: 'prop-1', name: 'Lemonade', category: InventoryCategory.USABLES, quantity: 3, minThreshold: 6, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'u20', propertyId: 'prop-1', name: 'Ginger Ale', category: InventoryCategory.USABLES, quantity: 1, minThreshold: 6, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },

  // KITCHEN STOCK
  { id: 'k1', propertyId: 'prop-1', name: 'Black Snack Serving Tray', category: InventoryCategory.KITCHEN_STOCK, quantity: 6, minThreshold: 2, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k2', propertyId: 'prop-1', name: 'Red Sauce Serving Bottle', category: InventoryCategory.KITCHEN_STOCK, quantity: 6, minThreshold: 2, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k3', propertyId: 'prop-1', name: 'Cinc Plates New', category: InventoryCategory.KITCHEN_STOCK, quantity: 33, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k4', propertyId: 'prop-1', name: 'Cinc Bowls New', category: InventoryCategory.KITCHEN_STOCK, quantity: 60, minThreshold: 24, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k5', propertyId: 'prop-1', name: 'Black Soup Bowls', category: InventoryCategory.KITCHEN_STOCK, quantity: 15, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k6', propertyId: 'prop-1', name: 'Black Soup Spoon', category: InventoryCategory.KITCHEN_STOCK, quantity: 15, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k7', propertyId: 'prop-1', name: 'Mouth Freshner Tray', category: InventoryCategory.KITCHEN_STOCK, quantity: 1, minThreshold: 1, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k8', propertyId: 'prop-1', name: 'Black Ceramic Tea Plates', category: InventoryCategory.KITCHEN_STOCK, quantity: 36, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k9', propertyId: 'prop-1', name: 'Black Coffee Cups', category: InventoryCategory.KITCHEN_STOCK, quantity: 37, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k10', propertyId: 'prop-1', name: 'Plastic Tray Organize New', category: InventoryCategory.KITCHEN_STOCK, quantity: 4, minThreshold: 2, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k11', propertyId: 'prop-1', name: 'Large Garbage Bags Packet', category: InventoryCategory.KITCHEN_STOCK, quantity: 10, minThreshold: 2, unit: 'Packets', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k12', propertyId: 'prop-1', name: 'Small Garbage Bags Packet', category: InventoryCategory.KITCHEN_STOCK, quantity: 3, minThreshold: 2, unit: 'Packets', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k13', propertyId: 'prop-1', name: 'Medium Garbage Bags Packet', category: InventoryCategory.KITCHEN_STOCK, quantity: 5, minThreshold: 2, unit: 'Packets', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k14', propertyId: 'prop-1', name: 'Face Tissue Packets', category: InventoryCategory.KITCHEN_STOCK, quantity: 40, minThreshold: 10, unit: 'Packets', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k15', propertyId: 'prop-1', name: 'Toilet Roll', category: InventoryCategory.KITCHEN_STOCK, quantity: 23, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'k16', propertyId: 'prop-1', name: 'Kadhai Parat For Bonfire', category: InventoryCategory.KITCHEN_STOCK, quantity: 2, minThreshold: 1, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },

  // LINEN + TOWELS
  { id: 'l1', propertyId: 'prop-1', name: 'Maroon Double Bed Sheet', category: InventoryCategory.LINEN_TOWELS, quantity: 12, minThreshold: 4, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l2', propertyId: 'prop-1', name: 'Maroon Pillow Cover', category: InventoryCategory.LINEN_TOWELS, quantity: 28, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l3', propertyId: 'prop-1', name: 'Maroon Duvet Cover', category: InventoryCategory.LINEN_TOWELS, quantity: 4, minThreshold: 2, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l4', propertyId: 'prop-1', name: 'Brown Pilow Cover', category: InventoryCategory.LINEN_TOWELS, quantity: 15, minThreshold: 8, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l5', propertyId: 'prop-1', name: 'Brown Double Bed Sheet', category: InventoryCategory.LINEN_TOWELS, quantity: 5, minThreshold: 2, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l6', propertyId: 'prop-1', name: 'Brown Single Bedsheet', category: InventoryCategory.LINEN_TOWELS, quantity: 5, minThreshold: 2, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l7', propertyId: 'prop-1', name: 'Brown Duvet Cover', category: InventoryCategory.LINEN_TOWELS, quantity: 1, minThreshold: 1, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l8', propertyId: 'prop-1', name: 'White Duvet Cover', category: InventoryCategory.LINEN_TOWELS, quantity: 9, minThreshold: 4, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l9', propertyId: 'prop-1', name: 'New White Double Bed Sheet', category: InventoryCategory.LINEN_TOWELS, quantity: 2, minThreshold: 2, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l10', propertyId: 'prop-1', name: 'White Double Bed Sheet', category: InventoryCategory.LINEN_TOWELS, quantity: 7, minThreshold: 4, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l11', propertyId: 'prop-1', name: 'White Pillow Cover', category: InventoryCategory.LINEN_TOWELS, quantity: 18, minThreshold: 10, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l12', propertyId: 'prop-1', name: 'Face Towel', category: InventoryCategory.LINEN_TOWELS, quantity: 6, minThreshold: 10, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'l13', propertyId: 'prop-1', name: 'Big Towel', category: InventoryCategory.LINEN_TOWELS, quantity: 64, minThreshold: 20, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },

  // KITCHENWARE
  { id: 'w1', propertyId: 'prop-1', name: 'Blue Crate', category: InventoryCategory.KITCHENWARE, quantity: 2, minThreshold: 1, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'w2', propertyId: 'prop-1', name: 'Rampur Whisky Glasses', category: InventoryCategory.KITCHENWARE, quantity: 11, minThreshold: 6, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'w3', propertyId: 'prop-1', name: 'Crystal Whisky Glasses', category: InventoryCategory.KITCHENWARE, quantity: 6, minThreshold: 6, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'w4', propertyId: 'prop-1', name: 'Water Glasses', category: InventoryCategory.KITCHENWARE, quantity: 25, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'w5', propertyId: 'prop-1', name: 'Black Tea Cup', category: InventoryCategory.KITCHENWARE, quantity: 32, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'w6', propertyId: 'prop-1', name: 'Steel Snack Floater', category: InventoryCategory.KITCHENWARE, quantity: 2, minThreshold: 1, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'w7', propertyId: 'prop-1', name: 'Black Big Plate Square', category: InventoryCategory.KITCHENWARE, quantity: 53, minThreshold: 24, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'w8', propertyId: 'prop-1', name: 'White Coffee Cup', category: InventoryCategory.KITCHENWARE, quantity: 9, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'w9', propertyId: 'prop-1', name: 'Small Black Plate Square', category: InventoryCategory.KITCHENWARE, quantity: 32, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'w10', propertyId: 'prop-1', name: 'Small Black Plate Circle', category: InventoryCategory.KITCHENWARE, quantity: 6, minThreshold: 12, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
  { id: 'w11', propertyId: 'prop-1', name: 'Black Bowls', category: InventoryCategory.KITCHENWARE, quantity: 109, minThreshold: 40, unit: 'Units', lastUpdated: '2024-05-20', unitCost: 0 },
];

export const MOCK_REVIEWS: Review[] = [];
