export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  collegeId?: string;
  collegeName?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  role: 'admin' | 'customer';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: {
    url?: string;
    alt?: string;
  };
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  pricePerDay?: number;
  securityDeposit?: number;
  condition?: string;
  location?: string;
  discountPrice?: number;
  category: Category | string;
  sku: string;
  tags?: string[];
  images?: ProductImage[];
  ratings: {
    average: number;
    count: number;
  };
  status?: 'Available' | 'Already Rented' | 'Unavailable';
  isAvailable?: boolean;
  isActive: boolean;
  createdBy?: User | string;
  owner?: User | string;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  _id: string;
  product: Product | string;
  quantity: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastRestockDate?: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  discountPrice: number;
  total: number;
  discountTotal: number;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  discountPrice: number;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  discountPrice: number;
  total: number;
  discountTotal: number;
  finalPrice: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderMessage {
  _id?: string;
  sender: string | User;
  senderName?: string;
  text: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderNumber?: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  discountPrice: number;
  finalPrice: number;
  status: 'pending' | 'accepted' | 'declined' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  notes?: string;
  messages?: OrderMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse {
  message?: string;
  error?: string;
  details?: Array<{ field: string; message: string }>;
  [key: string]: any;
}
