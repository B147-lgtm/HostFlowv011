
export enum BookingStatus {
  UPCOMING = 'Upcoming',
  CHECKED_IN = 'Checked In',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum InventoryCategory {
  USABLES = 'Regular Usables',
  KITCHEN_STOCK = 'Kitchen Stock',
  LINEN_TOWELS = 'Linen + Towels',
  KITCHENWARE = 'Kitchenware'
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense'
}

export enum ExpenseCategory {
  CLEANING = 'Cleaning',
  MAINTENANCE = 'Maintenance',
  UTILITIES = 'Utilities',
  RESTOCK = 'Inventory Restock',
  KITCHEN_SUPPLIES = 'Kitchen Supplies',
  TAXES = 'Taxes/Fees',
  MARKETING = 'Marketing',
  MISC = 'Miscellaneous'
}

export enum StockStatus {
  IN_STOCK = 'In Stock',
  LOW_STOCK = 'Low Stock',
  OUT_OF_STOCK = 'Out of Stock'
}

export enum UserRole {
  ASSET_MANAGER = 'Asset Manager',
  AIRBNB_MANAGER = 'Airbnb Manager',
  PRIVATE_HOST = 'Private Host',
  AIRBNB_HOST = 'Airbnb Host'
}

export interface StayPackage {
  id: string;
  title: string;
  desc: string;
  iconType: 'home' | 'star' | 'sparkles' | 'zap';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  provider: 'google' | 'email';
  isVerified: boolean;
  role?: UserRole;
  dob?: string;
  createdAt: string;
}

export interface PropertyConfig {
  id: string;
  name: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  airbnbUrl?: string;
  icalUrl?: string;
  isConfigured: boolean;
}

export interface Transaction {
  id: string;
  propertyId: string;
  date: string;
  type: TransactionType;
  category: ExpenseCategory | 'Booking' | 'Additional Service' | 'Misc Income';
  amount: number;
  description: string;
  referenceId?: string;
  staffName?: string;
  receiptFileName?: string;
}

export interface InventoryItem {
  id: string;
  propertyId: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  minThreshold: number;
  unit: string;
  lastUpdated: string;
  unitCost: number;
}

export interface Guest {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalStays: number;
  lastStay: string;
  notes: string;
  avatar: string;
  idType?: string;
  idNumber?: string;
  vehicleNumber?: string;
  idFileName?: string;
  idFileData?: string; 
  hasConsented?: boolean;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalPrice: number;
  guestsCount: number;
  source: 'Airbnb' | 'Manual' | 'Direct';
  isSynced?: boolean;
  cottageName?: string;
}

export interface StaffLog {
  id: string;
  propertyId: string;
  staffName: string;
  action: string;
  timestamp: string;
  type: 'INVENTORY' | 'CLEANING' | 'MAINTENANCE' | 'FINANCIAL' | 'SERVICE' | 'RECEPTION';
  priority?: 'low' | 'medium' | 'high';
}

export interface Review {
  id: string;
  guestId: string;
  guestName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  category: string;
}
