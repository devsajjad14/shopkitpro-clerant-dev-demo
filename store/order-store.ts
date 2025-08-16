import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  color?: string | null;
  size?: string | null;
}

interface OrderAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface OrderDetails {
  orderId: string;
  paypalOrderId?: string;
  stripePaymentIntentId?: string;
  customerEmail: string;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  orderDate: string;
  estimatedDelivery: string;
}

interface OrderStore {
  orderDetails: OrderDetails | null;
  setOrderDetails: (orderDetails: OrderDetails) => void;
  clearOrderDetails: () => void;
  updateOrderField: (field: keyof OrderDetails, value: any) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orderDetails: null,
      
      setOrderDetails: (orderDetails: OrderDetails) => {
        set({ orderDetails });
      },
      
      clearOrderDetails: () => {
        set({ orderDetails: null });
      },
      
      updateOrderField: (field: keyof OrderDetails, value: any) => {
        const currentOrder = get().orderDetails;
        if (currentOrder) {
          set({
            orderDetails: {
              ...currentOrder,
              [field]: value
            }
          });
        }
      }
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({ orderDetails: state.orderDetails })
    }
  )
); 