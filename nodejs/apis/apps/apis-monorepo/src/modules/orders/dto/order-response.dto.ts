export class OrderItemResponseDto {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export class OrderResponseDto {
  id: string;
  unitId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItemResponseDto[];
  total: number;
  status: 'processando' | 'enviado' | 'entregue' | 'cancelado';
  orderDate: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  trackingNumber?: string;
  shippingAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class OrderStatsDto {
  total: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

export class OrderFiltersDto {
  search?: string;
  status?: 'processando' | 'enviado' | 'entregue' | 'cancelado';
  page?: number = 1;
  limit?: number = 50;
}

