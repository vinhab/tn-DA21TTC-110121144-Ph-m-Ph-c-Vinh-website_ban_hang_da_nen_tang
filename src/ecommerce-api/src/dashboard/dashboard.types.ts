export interface Summary {
    totalProducts: number;
    totalUsers: number;
    totalOrders: number;
    revenueToday: number;
}

export interface RevenueByDate {
    date: string;
    revenue: number;
}

export interface StatusCount {
    status: string;
    value: number;
}

export interface TopProduct {
    name: string;
    sold: number;
}

export interface LowStockProduct {
    name: string;
    stock: number;
}

export interface NewUser {
    name: string;
    email: string;
}

export interface RecentOrder {
    id: string | number;
    customer: string;
    status: string;
}

export interface DashboardNotification {
  type: string;
  text: string;
}