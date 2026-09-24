import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  RoleKey,
  PermissionKey,
  User,
  Product,
  Table,
  Room,
  ButcheryCut,
  ClubEvent,
  SecurityIncident,
  CCTVCamera,
  Customer,
  Expense,
  CashDrawerShift,
  Order,
  AuditLog,
  DepartmentKey,
  GuestInfo,
  PaymentMethod,
  OrderItem,
  SplitPaymentDetail
} from '../types';
import {
  ROLE_DEFINITIONS,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_BUTCHERY_CUTS,
  INITIAL_TABLES,
  INITIAL_ROOMS,
  INITIAL_CCTV_CAMERAS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_EVENTS,
  INITIAL_INCIDENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ORDERS,
  INITIAL_DRAWER_SHIFT
} from '../data/mockData';

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

interface AppContextType {
  // User & Roles
  currentUser: User;
  users: User[];
  addUser: (userData: Omit<User, 'id'>) => void;
  rolePermissions: Record<RoleKey, PermissionKey[]>;
  switchUser: (userIdOrRole: string) => void;
  updateRolePermission: (role: RoleKey, permission: PermissionKey, enabled: boolean) => void;
  hasPermission: (perm: PermissionKey) => boolean;
  canAccessView: (view: NavigationTab) => boolean;

  // Navigation
  currentView: NavigationTab;
  setCurrentView: (view: NavigationTab) => void;

  // Products & Inventory
  products: Product[];
  updateProductStock: (productId: string, qtyDelta: number) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;

  // Butchery
  butcheryCuts: ButcheryCut[];
  updateButcheryStock: (cutId: string, kgDelta: number) => void;

  // Tables & Club Floor
  tables: Table[];
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  assignTableWaiter: (tableId: string, waiterId: string, waiterName: string) => void;
  updateTableDetails: (tableId: string, partial: Partial<Table>) => void;

  // Hotel Rooms
  rooms: Room[];
  checkInRoom: (roomId: string, guest: GuestInfo) => void;
  checkOutRoom: (roomId: string, paymentMethod: PaymentMethod) => void;
  addFolioCharge: (roomId: string, item: { department: DepartmentKey; description: string; amount: number; txnRef?: string }) => void;
  updateRoomStatus: (roomId: string, status: Room['status']) => void;

  // Orders & POS
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'txnNumber' | 'createdAt'>) => Order;
  voidOrder: (orderId: string, reason: string) => boolean;
  refundOrder: (orderId: string, reason: string) => boolean;
  heldOrders: Order[];
  saveHeldOrder: (orderData: Omit<Order, 'id' | 'txnNumber' | 'createdAt'>) => void;
  resumeHeldOrder: (orderId: string) => Order | undefined;

  // CCTV & Surveillance
  cctvCameras: CCTVCamera[];
  activeCameraId: string;
  setActiveCameraId: (id: string) => void;
  toggleMotionAlert: (camId: string) => void;

  // Incidents
  incidents: SecurityIncident[];
  reportIncident: (incident: Omit<SecurityIncident, 'id' | 'timestamp' | 'status'>) => void;
  resolveIncident: (incidentId: string, actionTaken: string) => void;

  // Customers & CRM
  customers: Customer[];
  addCustomer: (customer: any) => Customer;
  updateCustomerTab: (customerId: string, amountDelta: number) => void;
  settleCustomerTab: (customerId: string, amount: number) => void;

  // Financials & Drawer
  expenses: Expense[];
  addExpense: (expense: any) => void;
  drawerShift: CashDrawerShift;
  cashDrawerShift: CashDrawerShift;
  recordCashDrop: (amount: number, reason: string) => void;
  performCashDrop: (amount: number) => void;
  closeShift: (actualClosing: number, notes?: string) => void;
  reconcileShiftClose: (actualClosing: number) => void;

  // Events & Tickets
  events: ClubEvent[];
  sellEventTicket: (eventId: string, isVip: boolean) => void;

  // Audit
  auditLogs: AuditLog[];
  logAction: (action: string, module: AuditLog['module'], details: string, severity?: AuditLog['severity']) => void;

  // Receipt Modal
  receiptOrder: Order | null;
  receiptModalOrder: Order | null;
  openReceipt: (order: Order) => void;
  closeReceipt: () => void;

  // Quick Notification Toast
  toast: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'hosp_crm_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from storage or defaults
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to Super Admin
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [rolePermissions, setRolePermissions] = useState<Record<RoleKey, PermissionKey[]>>(() => {
    const map: Record<RoleKey, PermissionKey[]> = {} as any;
    for (const [rKey, rDef] of Object.entries(ROLE_DEFINITIONS)) {
      map[rKey as RoleKey] = [...rDef.permissions];
    }
    return map;
  });

  const [currentView, setCurrentView] = useState<NavigationTab>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [butcheryCuts, setButcheryCuts] = useState<ButcheryCut[]>(INITIAL_BUTCHERY_CUTS);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [cctvCameras, setCctvCameras] = useState<CCTVCamera[]>(INITIAL_CCTV_CAMERAS);
  const [activeCameraId, setActiveCameraId] = useState<string>('cam-3');
  const [incidents, setIncidents] = useState<SecurityIncident[]>(INITIAL_INCIDENTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [drawerShift, setDrawerShift] = useState<CashDrawerShift>(INITIAL_DRAWER_SHIFT);
  const [events, setEvents] = useState<ClubEvent[]>(INITIAL_EVENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [heldOrders, setHeldOrders] = useState<Order[]>([]);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const logAction = (
    action: string,
    module: AuditLog['module'],
    details: string,
    severity: AuditLog['severity'] = 'info'
  ) => {
    const now = new Date();
    const timeStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      module,
      details,
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const hasPermission = (perm: PermissionKey): boolean => {
    const currentPerms = rolePermissions[currentUser.role] || [];
    return currentPerms.includes(perm);
  };

  const canAccessView = (view: NavigationTab): boolean => {
    const role = currentUser.role as string;
    if (role === 'super_admin' || role === 'business_owner' || role === 'general_manager') {
      return true;
    }
    switch (view) {
      case 'dashboard':
        return hasPermission('view_reports') || hasPermission('view_sales');
      case 'pos':
        return hasPermission('create_sales') || hasPermission('view_sales');
      case 'club':
        return hasPermission('manage_club') || ['club_bar_manager', 'waiter_server', 'security_officer'].includes(role);
      case 'hotel':
        return hasPermission('manage_rooms') || ['hotel_manager', 'receptionist'].includes(role);
      case 'butchery':
        return hasPermission('manage_butchery') || ['butchery_manager', 'cashier'].includes(role);
      case 'restaurant':
      case 'restaurant_kds':
        return true;
      case 'inventory':
        return hasPermission('manage_inventory') || ['inventory_manager', 'accountant'].includes(role);
      case 'cctv':
        return hasPermission('view_cctv') || ['cctv_operator', 'security_officer'].includes(role);
      case 'crm':
        return hasPermission('view_sales') || hasPermission('manage_employees');
      case 'finance':
        return hasPermission('access_financials') || hasPermission('access_finances') || role === 'accountant' || role === 'auditor';
      case 'employees':
        return hasPermission('manage_employees') || role === 'general_manager' || role === 'super_admin';
      case 'security':
        return hasPermission('view_cctv') || role === 'security_officer' || role === 'auditor';
      case 'reports':
        return hasPermission('view_reports') || role === 'auditor' || role === 'accountant';
      case 'settings':
      case 'users':
        return hasPermission('manage_settings') || hasPermission('manage_users') || role === 'super_admin';
      default:
        return true;
    }
  };

  const switchUser = (userIdOrRole: string) => {
    const foundUser =
      users.find((u) => u.id === userIdOrRole || u.role === userIdOrRole) ||
      INITIAL_USERS.find((u) => u.role === userIdOrRole);

    if (foundUser) {
      setCurrentUser(foundUser);
      logAction('USER_SWITCH_SESSION', 'Users', `Switched active session to ${foundUser.name} (${foundUser.role})`, 'info');
      showToast(`Active profile switched to ${foundUser.name} (${ROLE_DEFINITIONS[foundUser.role].label})`, 'success');
    }
  };

  const updateRolePermission = (role: RoleKey, permission: PermissionKey, enabled: boolean) => {
    if (!hasPermission('manage_users') && currentUser.role !== 'super_admin') {
      showToast('Unauthorized: Administrator permission required.', 'error');
      return;
    }
    setRolePermissions((prev) => {
      const current = prev[role] || [];
      const updated = enabled
        ? Array.from(new Set([...current, permission]))
        : current.filter((p) => p !== permission);

      logAction(
        'PERMISSION_MODIFIED',
        'Users',
        `${enabled ? 'Granted' : 'Revoked'} ${permission} for role ${ROLE_DEFINITIONS[role].label}`,
        'warning'
      );
      return { ...prev, [role]: updated };
    });
    showToast(`Updated permissions for ${ROLE_DEFINITIONS[role].label}`, 'info');
  };

  const updateProductStock = (productId: string, qtyDelta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock + qtyDelta) } : p))
    );
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
    );
    logAction('PRODUCT_PRICE_CHANGE', 'Inventory', `Updated product ${productId} price to KES ${newPrice}`, 'warning');
    showToast(`Product price updated to KES ${newPrice}`, 'success');
  };

  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: `p-${Date.now()}`
    };
    setProducts((prev) => [newProd, ...prev]);
    logAction('PRODUCT_CREATED', 'Inventory', `Added new product ${newProd.name} under ${newProd.category}`, 'info');
    showToast(`Added product ${newProd.name}`, 'success');
  };

  const updateButcheryStock = (cutId: string, kgDelta: number) => {
    setButcheryCuts((prev) =>
      prev.map((c) => (c.id === cutId ? { ...c, stockKg: Math.max(0, Number((c.stockKg + kgDelta).toFixed(2))) } : c))
    );
  };

  const updateTableStatus = (tableId: string, status: Table['status']) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t))
    );
    logAction('TABLE_STATUS_CHANGED', 'Club', `Table ${tableId} changed to ${status}`, 'info');
  };

  const assignTableWaiter = (tableId: string, waiterId: string, waiterName: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, currentWaiterId: waiterId, currentWaiterName: waiterName } : t))
    );
    logAction('TABLE_WAITER_ASSIGNED', 'Club', `Assigned ${waiterName} to table ${tableId}`, 'info');
  };

  const updateTableDetails = (tableId: string, partial: Partial<Table>) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, ...partial } : t))
    );
  };

  const checkInRoom = (roomId: string, guest: GuestInfo) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const firstNightCharge = {
            id: `fc-${Date.now()}`,
            date: guest.checkInDate,
            department: 'HOTEL_ROOMS' as DepartmentKey,
            description: `Room Rate (${r.type}) - Check-in Advance Charge`,
            amount: r.ratePerNight,
          };
          return {
            ...r,
            status: 'occupied',
            currentGuest: guest,
            paidAmount: guest.depositAmount,
            folioCharges: [firstNightCharge],
            keyCardAssigned: `KC-${r.number}-${Date.now().toString().slice(-3)}`
          };
        }
        return r;
      })
    );

    logAction(
      'ROOM_CHECKIN',
      'Hotel',
      `Checked in ${guest.name} to Room ${roomId} with deposit KES ${guest.depositAmount}`,
      'info'
    );
    showToast(`Room ${roomId} checked in successfully for ${guest.name}!`, 'success');
  };

  const checkOutRoom = (roomId: string, paymentMethod: PaymentMethod) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room || !room.currentGuest) return;

    const totalFolio = room.folioCharges.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalFolio - room.paidAmount;

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: 'housekeeping',
              cleaningPriority: 'urgent',
              currentGuest: undefined,
              folioCharges: [],
              paidAmount: 0,
              keyCardAssigned: undefined
            }
          : r
      )
    );

    logAction(
      'ROOM_CHECKOUT',
      'Hotel',
      `Checked out Room ${room.number}. Final balance KES ${balance.toLocaleString()} settled via ${paymentMethod}. Dispatched for housekeeping.`,
      'info'
    );
    showToast(`Room ${room.number} checked out. Housekeeping priority set!`, 'success');
  };

  const addFolioCharge = (
    roomId: string,
    item: { department: DepartmentKey; description: string; amount: number; txnRef?: string }
  ) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            folioCharges: [
              ...r.folioCharges,
              {
                id: `fc-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                ...item,
              }
            ]
          };
        }
        return r;
      })
    );

    logAction(
      'FOLIO_CROSS_CHARGE',
      'Hotel',
      `Added charge of KES ${item.amount.toLocaleString()} (${item.description}) to Room ${roomId} folio.`,
      'info'
    );
    showToast(`Charged KES ${item.amount.toLocaleString()} to Room Folio`, 'info');
  };

  const updateRoomStatus = (roomId: string, status: Room['status']) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status } : r))
    );
    logAction('ROOM_STATUS_UPDATED', 'Hotel', `Room ${roomId} status changed to ${status}`, 'info');
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'txnNumber' | 'createdAt'>): Order => {
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const deptTag =
      orderData.department === 'BAR_CLUB'
        ? 'BAR'
        : orderData.department === 'HOTEL_ROOMS'
        ? 'HOT'
        : orderData.department === 'BUTCHERY'
        ? 'BUT'
        : 'RES';

    const txnNumber = `TXN-${deptTag}-${datePrefix}-${randomSuffix}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      txnNumber,
      createdAt: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      status: 'completed',
    };

    // Deduct stock for inventory products
    for (const item of newOrder.items) {
      if (item.department === 'BUTCHERY' && item.weightKg) {
        updateButcheryStock(item.productId, -item.weightKg);
      } else {
        updateProductStock(item.productId, -(item.quantity || 1));
      }
    }

    // Update table spend if assigned
    if (newOrder.tableId) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === newOrder.tableId
            ? {
                ...t,
                status: 'occupied',
                totalSpend: (t.totalSpend || 0) + newOrder.total,
                bottleServiceCount:
                  (t.bottleServiceCount || 0) +
                  newOrder.items.filter((i) => i.category === 'Spirits' || i.category === 'Wines').length
              }
            : t
        )
      );
    }

    // Update customer total spend & loyalty points
    if (newOrder.customerId) {
      const ptsEarned = Math.floor(newOrder.total / 100);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === newOrder.customerId
            ? {
                ...c,
                totalSpent: c.totalSpent + newOrder.total,
                visits: c.visits + 1,
                points: c.points + ptsEarned,
                outstandingTab:
                  newOrder.paymentMethod === 'credit_account'
                    ? c.outstandingTab + newOrder.total
                    : c.outstandingTab
              }
            : c
        )
      );
    }

    // If charged to room folio, add line to room
    if (newOrder.paymentMethod === 'room_folio' && newOrder.roomId) {
      addFolioCharge(newOrder.roomId, {
        department: newOrder.department,
        description: `Order ${txnNumber} (${newOrder.items.map((i) => i.name).join(', ')})`,
        amount: newOrder.total,
        txnRef: txnNumber,
      });
    }

    // Update cash drawer shift if cash/mpesa/card
    if (drawerShift.status === 'open') {
      setDrawerShift((prev) => {
        let cashAdd = 0;
        let cardAdd = 0;
        let mpesaAdd = 0;

        if (newOrder.paymentMethod === 'cash') cashAdd = newOrder.total;
        else if (newOrder.paymentMethod === 'card') cardAdd = newOrder.total;
        else if (newOrder.paymentMethod === 'mpesa' || newOrder.paymentMethod === 'mobile_money') mpesaAdd = newOrder.total;
        else if (newOrder.paymentMethod === 'mixed' && newOrder.paymentDetails) {
          for (const sp of newOrder.paymentDetails) {
            if (sp.method === 'cash') cashAdd += sp.amount;
            if (sp.method === 'card') cardAdd += sp.amount;
            if (sp.method === 'mpesa' || sp.method === 'mobile_money') mpesaAdd += sp.amount;
          }
        }

        return {
          ...prev,
          cashSales: prev.cashSales + cashAdd,
          cardSales: prev.cardSales + cardAdd,
          mpesaSales: prev.mpesaSales + mpesaAdd,
          expectedClosing: prev.openingBalance + (prev.cashSales + cashAdd) - prev.cashPaidOut,
        };
      });
    }

    setOrders((prev) => [newOrder, ...prev]);

    logAction(
      'ORDER_COMPLETED',
      'POS',
      `Completed ${newOrder.txnNumber} for KES ${newOrder.total.toLocaleString()} via ${newOrder.paymentMethod.toUpperCase()}`,
      'info'
    );

    setReceiptOrder(newOrder);
    showToast(`Order ${newOrder.txnNumber} finalized: KES ${newOrder.total.toLocaleString()}`, 'success');

    return newOrder;
  };

  const voidOrder = (orderId: string, reason: string): boolean => {
    if (!hasPermission('void_refund') && currentUser.role !== 'super_admin' && currentUser.role !== 'club_bar_manager') {
      showToast('Unauthorized: Void requires manager override.', 'error');
      return false;
    }

    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status !== 'completed') {
      showToast('Cannot void this order.', 'error');
      return false;
    }

    // Restore stock
    for (const item of targetOrder.items) {
      if (item.department === 'BUTCHERY' && item.weightKg) {
        updateButcheryStock(item.productId, item.weightKg);
      } else {
        updateProductStock(item.productId, item.quantity || 1);
      }
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'voided', voidReason: reason } : o))
    );

    logAction(
      'ORDER_VOIDED',
      'POS',
      `Voided ${targetOrder.txnNumber} (KES ${targetOrder.total.toLocaleString()}). Reason: ${reason}`,
      'warning'
    );
    showToast(`Voided order ${targetOrder.txnNumber}`, 'info');
    return true;
  };

  const refundOrder = (orderId: string, reason: string): boolean => {
    if (!hasPermission('void_refund')) {
      showToast('Unauthorized: Refund requires manager override.', 'error');
      return false;
    }

    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return false;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'refunded', voidReason: reason } : o))
    );

    logAction(
      'ORDER_REFUNDED',
      'POS',
      `Processed refund for ${targetOrder.txnNumber} of KES ${targetOrder.total.toLocaleString()}. Reason: ${reason}`,
      'warning'
    );
    showToast(`Refund processed for ${targetOrder.txnNumber}`, 'info');
    return true;
  };

  const saveHeldOrder = (orderData: Omit<Order, 'id' | 'txnNumber' | 'createdAt'>) => {
    const held: Order = {
      ...orderData,
      id: `held-${Date.now()}`,
      txnNumber: `HELD-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleTimeString(),
      status: 'held',
    };
    setHeldOrders((prev) => [held, ...prev]);
    showToast(`Order held for table/customer (${held.items.length} items)`, 'info');
  };

  const resumeHeldOrder = (orderId: string): Order | undefined => {
    const found = heldOrders.find((o) => o.id === orderId);
    if (found) {
      setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast(`Resumed held order ${found.txnNumber}`, 'info');
    }
    return found;
  };

  const toggleMotionAlert = (camId: string) => {
    setCctvCameras((prev) =>
      prev.map((c) => (c.id === camId ? { ...c, motionAlert: !c.motionAlert, status: !c.motionAlert ? 'motion_detected' : 'live' } : c))
    );
  };

  const reportIncident = (incident: Omit<SecurityIncident, 'id' | 'timestamp' | 'status'>) => {
    const now = new Date();
    const newInc: SecurityIncident = {
      ...incident,
      id: `inc-${Date.now()}`,
      timestamp: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      status: 'investigating',
    };
    setIncidents((prev) => [newInc, ...prev]);
    logAction(
      'SECURITY_INCIDENT_REPORTED',
      'Security',
      `[Severity: ${incident.severity.toUpperCase()}] ${incident.description} at ${incident.location}`,
      incident.severity === 'critical' || incident.severity === 'high' ? 'critical' : 'warning'
    );
    showToast(`Security incident logged: ${incident.location}`, 'warning');
  };

  const resolveIncident = (incidentId: string, actionTaken: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: 'resolved', actionTaken } : inc))
    );
    logAction('SECURITY_INCIDENT_RESOLVED', 'Security', `Resolved incident ${incidentId}. Action: ${actionTaken}`, 'info');
    showToast('Incident marked as resolved.', 'success');
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'joinedDate' | 'totalSpent' | 'visits' | 'points' | 'outstandingTab'>) => {
    const newCust: Customer = {
      ...customer,
      id: `c-${Date.now()}`,
      joinedDate: new Date().toISOString().slice(0, 10),
      totalSpent: 0,
      visits: 0,
      points: 0,
      outstandingTab: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
    logAction('CUSTOMER_REGISTERED', 'POS', `Registered VIP patron: ${newCust.name} (${newCust.vipTier})`, 'info');
    showToast(`Customer ${newCust.name} added to CRM`, 'success');
    return newCust;
  };

  const updateCustomerTab = (customerId: string, amountDelta: number) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, outstandingTab: Math.max(0, c.outstandingTab + amountDelta) } : c
      )
    );
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
    };
    setExpenses((prev) => [newExp, ...prev]);

    if (expense.paidVia === 'cash' && drawerShift.status === 'open') {
      setDrawerShift((prev) => ({
        ...prev,
        cashPaidOut: prev.cashPaidOut + expense.amount,
        expectedClosing: prev.expectedClosing - expense.amount,
      }));
    }

    logAction('EXPENSE_RECORDED', 'Finance', `Recorded expense KES ${expense.amount.toLocaleString()} for ${expense.description} (${expense.category})`, 'info');
    showToast(`Expense voucher created: KES ${expense.amount.toLocaleString()}`, 'success');
  };

  const recordCashDrop = (amount: number, reason: string) => {
    setDrawerShift((prev) => ({
      ...prev,
      cashPaidOut: prev.cashPaidOut + amount,
      expectedClosing: prev.expectedClosing - amount,
    }));
    logAction('CASH_DROP', 'Finance', `Cash drop of KES ${amount.toLocaleString()} to safe. Reason: ${reason}`, 'warning');
    showToast(`Recorded cash drop of KES ${amount.toLocaleString()}`, 'info');
  };

  const closeShift = (actualClosing: number, notes?: string) => {
    const variance = actualClosing - drawerShift.expectedClosing;
    setDrawerShift((prev) => ({
      ...prev,
      closedAt: new Date().toLocaleTimeString(),
      status: 'closed',
      actualClosing,
      variance,
      notes: notes || prev.notes,
    }));
    logAction(
      'CASH_DRAWER_CLOSED',
      'Finance',
      `Closed shift. Expected KES ${drawerShift.expectedClosing.toLocaleString()}, Actual KES ${actualClosing.toLocaleString()} (Variance: KES ${variance.toLocaleString()})`,
      Math.abs(variance) > 500 ? 'warning' : 'info'
    );
    showToast(`Shift closed. Variance: KES ${variance.toLocaleString()}`, Math.abs(variance) > 0 ? 'warning' : 'success');
  };

  const performCashDrop = (amount: number) => {
    recordCashDrop(amount, 'Vault safe deposit');
    setDrawerShift((prev) => ({
      ...prev,
      cashDroppedToSafe: (prev.cashDroppedToSafe || 0) + amount,
    }));
  };

  const reconcileShiftClose = (actualClosing: number) => {
    closeShift(actualClosing);
    setDrawerShift((prev) => ({
      ...prev,
      actualClosingCount: actualClosing,
    }));
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now().toString().slice(-4)}`,
    };
    setUsers((prev) => [newUser, ...prev]);
    logAction('USER_ENROLLED', 'Users', `Enrolled staff ${newUser.name} as ${newUser.role} in ${newUser.department}`, 'info');
    showToast(`Staff member ${newUser.name} enrolled successfully`, 'success');
  };

  const settleCustomerTab = (customerId: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newTab = Math.max(0, c.outstandingTab - amount);
          return { ...c, outstandingTab: newTab };
        }
        return c;
      })
    );
    logAction('CUSTOMER_TAB_SETTLED', 'POS', `Settled tab of KES ${amount.toLocaleString()} for customer ID ${customerId}`, 'info');
    showToast(`Customer tab payment of KES ${amount.toLocaleString()} processed!`, 'success');
  };

  const sellEventTicket = (eventId: string, isVip: boolean) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    const price = isVip ? event.vipTicketPrice : event.entryFee;

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ticketsSold: e.ticketsSold + 1 } : e))
    );

    // Create automated order for ticket
    createOrder({
      department: 'BAR_CLUB',
      orderType: 'bar_walkin',
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      items: [
        {
          id: `oi-${Date.now()}`,
          productId: `ticket-${event.id}`,
          name: `${event.title} - ${isVip ? 'VIP Access Pass' : 'Standard Entry'}`,
          category: 'Event Ticket',
          unitPrice: price,
          quantity: 1,
          department: 'BAR_CLUB',
        },
      ],
      subtotal: price,
      serviceCharge: 0,
      discountPercent: 0,
      discountAmount: 0,
      tax: Math.round(price * 0.16),
      total: price,
      paymentMethod: 'mpesa',
      mpesaRef: `TKT${Date.now().toString().slice(-6)}`,
      status: 'completed',
    });

    showToast(`Issued ${isVip ? 'VIP Pass' : 'Standard Ticket'} for ${event.title}!`, 'success');
  };

  const openReceipt = (order: Order) => {
    setReceiptOrder(order);
  };

  const closeReceipt = () => {
    setReceiptOrder(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        addUser,
        rolePermissions,
        switchUser,
        updateRolePermission,
        hasPermission,
        canAccessView,
        currentView,
        setCurrentView,
        products,
        updateProductStock,
        updateProductPrice,
        addProduct,
        butcheryCuts,
        updateButcheryStock,
        tables,
        updateTableStatus,
        assignTableWaiter,
        updateTableDetails,
        rooms,
        checkInRoom,
        checkOutRoom,
        addFolioCharge,
        updateRoomStatus,
        orders,
        createOrder,
        voidOrder,
        refundOrder,
        heldOrders,
        saveHeldOrder,
        resumeHeldOrder,
        cctvCameras,
        activeCameraId,
        setActiveCameraId,
        toggleMotionAlert,
        incidents,
        reportIncident,
        resolveIncident,
        customers,
        addCustomer,
        updateCustomerTab,
        settleCustomerTab,
        expenses,
        addExpense,
        drawerShift,
        cashDrawerShift: drawerShift,
        recordCashDrop,
        performCashDrop,
        closeShift,
        reconcileShiftClose,
        events,
        sellEventTicket,
        auditLogs,
        logAction,
        receiptOrder,
        receiptModalOrder: receiptOrder,
        openReceipt,
        closeReceipt,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
