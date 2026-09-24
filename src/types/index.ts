export type RoleKey =
  | 'super_admin'
  | 'business_owner'
  | 'general_manager'
  | 'club_bar_manager'
  | 'hotel_manager'
  | 'butchery_manager'
  | 'cashier'
  | 'waiter_server'
  | 'receptionist'
  | 'accountant'
  | 'inventory_manager'
  | 'security_officer'
  | 'cctv_operator'
  | 'auditor';

export type UserRole = RoleKey;

export interface RoleDefinition {
  key: RoleKey;
  label: string;
  department: string;
  color: string;
  description: string;
  permissions: PermissionKey[];
}

export type PermissionKey =
  | 'view_sales'
  | 'create_sales'
  | 'edit_sales'
  | 'void_refund'
  | 'view_reports'
  | 'manage_inventory'
  | 'manage_employees'
  | 'manage_rooms'
  | 'view_cctv'
  | 'export_data'
  | 'manage_users'
  | 'manage_settings'
  | 'access_financials'
  | 'access_finances'
  | 'manage_butchery'
  | 'manage_club';

export type DepartmentKey = 'BAR_CLUB' | 'HOTEL_ROOMS' | 'BUTCHERY' | 'RESTAURANT' | 'SECURITY_CCTV';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  department: DepartmentKey | 'ALL';
  avatar?: string;
  pin?: string;
  phone: string;
  activeShiftId?: string;
  status?: 'active' | 'on_break' | 'off_duty';
  active?: boolean;
  commissionRate?: number;
  currentShift?: string;
}

export interface Product {
  id: string;
  name: string;
  department: DepartmentKey;
  category: string;
  subcategory?: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: 'bottle' | 'shot' | 'can' | 'kg' | 'plate' | 'pack' | 'night';
  barcode: string;
  isAgeRestricted?: boolean;
  allowsShotMeasure?: boolean;
  shotPrice?: number;
  shotsPerBottle?: number;
  isWeighable?: boolean;
  minStockLevel: number;
  image?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  weightKg?: number;
  isShot?: boolean;
  notes?: string;
  kdsStatus?: 'pending' | 'cooking' | 'ready' | 'served';
  department: DepartmentKey;
}

export type PaymentMethod =
  | 'cash'
  | 'mpesa'
  | 'card'
  | 'bank_transfer'
  | 'mobile_money'
  | 'credit_account'
  | 'room_folio'
  | 'mixed';

export interface SplitPaymentDetail {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface Order {
  id: string;
  txnNumber: string;
  department: DepartmentKey;
  orderType: 'dine_in' | 'club_table' | 'bar_walkin' | 'takeaway' | 'room_service' | 'butchery_raw' | 'butchery_grill';
  tableId?: string;
  tableName?: string;
  roomId?: string;
  roomNumber?: string;
  waiterId?: string;
  waiterName?: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  serviceCharge: number;
  discountPercent: number;
  discountAmount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: SplitPaymentDetail[];
  mpesaRef?: string;
  status: 'completed' | 'voided' | 'refunded' | 'held' | 'on_tab';
  createdAt: string;
  voidReason?: string;
  notes?: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'waiting_payment' | 'closed';

export interface Table {
  id: string;
  number: string;
  name: string;
  section: 'VIP Lounge' | 'Main Dance Floor' | 'Garden Patio' | 'Sports Bar' | 'Executive Booth';
  capacity: number;
  minSpend: number;
  status: TableStatus;
  currentOrderId?: string;
  currentWaiterId?: string;
  currentWaiterName?: string;
  guestCount?: number;
  totalSpend?: number;
  reservedFor?: string;
  reservationTime?: string;
  bottleServiceCount?: number;
}

export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'housekeeping' | 'out_of_order' | 'checkout_pending';

export interface GuestInfo {
  name: string;
  phone: string;
  email: string;
  idNumber: string;
  checkInDate: string;
  checkOutDate: string;
  depositAmount: number;
  specialRequests?: string;
}

export interface RoomFolioItem {
  id: string;
  date: string;
  department: DepartmentKey;
  description: string;
  amount: number;
  txnRef?: string;
}

export interface Room {
  id: string;
  number: string;
  type: 'Deluxe Suite' | 'Executive Suite' | 'Standard King' | 'Presidential Penthouse' | 'Garden Villa';
  floor: number;
  ratePerNight: number;
  status: RoomStatus;
  currentGuest?: GuestInfo;
  folioCharges: RoomFolioItem[];
  paidAmount: number;
  amenities: string[];
  keyCardAssigned?: string;
  cleaningPriority?: 'normal' | 'urgent' | 'completed';
}

export interface ButcheryCut {
  id: string;
  name: string;
  category: 'Beef' | 'Goat (Mbuzi)' | 'Pork' | 'Lamb' | 'Poultry' | 'Specialty';
  pricePerKg: number;
  stockKg: number;
  minStockKg: number;
  recommendedCook: 'Choma Grill' | 'Wet Fry' | 'Stew' | 'Soup' | 'Raw Takeaway';
  costPerKg: number;
  carcassOrigin?: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  theme: string;
  entryFee: number;
  vipTicketPrice: number;
  ticketsSold: number;
  capacity: number;
  djLineup: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  description: string;
  status: 'investigating' | 'resolved' | 'escalated' | 'open';
  cctvCameraId?: string;
  tableId?: string;
  actionTaken?: string;
}

export interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  zone: 'Bar' | 'Club VIP' | 'Entrance' | 'Cashier Desk' | 'Hotel Lobby' | 'Butchery' | 'Parking' | 'Kitchen';
  status: 'live' | 'motion_detected' | 'recording' | 'maintenance';
  motionAlert: boolean;
  fps: number;
  resolution: string;
  thumbnailColor: string;
}

export type CustomerVIPTier = 'REGULAR' | 'SILVER' | 'VIP_GOLD' | 'PLATINUM_VVIP' | 'Regular' | 'Gold' | 'Platinum' | 'Diamond';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vipTier: CustomerVIPTier;
  totalSpent: number;
  visits: number;
  points: number;
  creditLimit: number;
  outstandingTab: number;
  notes?: string;
  preferredDrinks?: string[];
  preferredRoom?: string;
  joinedDate: string;
  loyaltyPoints?: number;
  carPlate?: string;
}

export interface Expense {
  id: string;
  date: string;
  department?: DepartmentKey | 'GENERAL';
  category:
    | 'Supplies'
    | 'DJ & Entertainment'
    | 'Utilities'
    | 'Staff Welfare'
    | 'Maintenance'
    | 'Petty Cash'
    | 'Beverage Restock'
    | 'Meat Sourcing'
    | 'Liquor & Stock'
    | 'Meat & Butchery Supply'
    | 'Staff Salaries & Wages'
    | 'Diesel & Generator'
    | 'Security & Bouncers'
    | 'Licenses & Permits'
    | 'Utilities & Electricity';
  amount: number;
  description: string;
  approvedBy: string;
  paidVia?: 'cash' | 'bank_transfer' | 'mpesa';
  paidTo?: string;
  paymentMethod?: string;
  status?: 'approved' | 'pending';
  receiptRef?: string;
}

export interface CashDrawerShift {
  id: string;
  cashierId: string;
  cashierName: string;
  shiftName?: string;
  startTime?: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  openingCashFloat: number;
  cashSales: number;
  cashSalesAdded: number;
  cardSales: number;
  mpesaSales: number;
  cashPaidOut: number;
  cashDroppedToSafe: number;
  expectedClosing: number;
  actualClosing?: number;
  actualClosingCount?: number;
  variance?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: RoleKey;
  userRole?: string;
  action: string;
  module: 'POS' | 'Club' | 'Hotel' | 'Butchery' | 'Inventory' | 'Security' | 'Finance' | 'Users' | 'Settings';
  targetEntity?: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress?: string;
}

export type AuditLogEntry = AuditLog;

export type NavigationTab =
  | 'dashboard'
  | 'pos'
  | 'club'
  | 'hotel'
  | 'butchery'
  | 'restaurant'
  | 'restaurant_kds'
  | 'inventory'
  | 'cctv'
  | 'crm'
  | 'finance'
  | 'employees'
  | 'security'
  | 'reports'
  | 'settings'
  | 'users';
