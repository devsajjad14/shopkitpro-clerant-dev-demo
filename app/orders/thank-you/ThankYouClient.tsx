"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ShoppingBagIcon,
  TruckIcon,
  CreditCardIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useOrderStore } from '@/store/order-store';
import { useCartStore } from '@/lib/stores/cart-store';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  color?: string;
  size?: string;
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
  shippingAddress: any;
  billingAddress: any;
  orderDate: string;
  estimatedDelivery: string;
}

// Helper function to get optimized image URL
const getOptimizedImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
};

// Helper function to make URL friendly strings
const urlFriendly = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default function ThankYouClient() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const { orderDetails, setOrderDetails } = useOrderStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const [lastClearedOrderId, setLastClearedOrderId] = useState<string | null>(null);

  useEffect(() => {
    // If we don't have order details in the store, try to construct them from URL params
    if (!orderDetails) {
      constructOrderDetailsFromParams();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, [orderDetails]);

  // Clear cart after order is displayed, only once per order
  useEffect(() => {
    if (!isLoading && orderDetails?.orderId && lastClearedOrderId !== orderDetails.orderId) {
      clearCart();
      setLastClearedOrderId(orderDetails.orderId);
    }
  }, [isLoading, orderDetails?.orderId, lastClearedOrderId, clearCart]);

  const constructOrderDetailsFromParams = () => {
    try {
      // Get cart items from localStorage
      const cartItems = JSON.parse(localStorage.getItem('cart-storage') || '{}').state?.items || [];
      // Get data from URL parameters
      const orderId = searchParams.get('order_id') || '';
      const paypalOrderId = searchParams.get('paypal_order_id') || '';
      const stripePaymentIntentId = searchParams.get('stripe_payment_intent_id') || '';
      const customerEmail = searchParams.get('email') || '';
      const paymentMethod = searchParams.get('payment_method') || '';
      // Calculate totals
      const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const shippingAmount = 5.99; // Default shipping
      const taxAmount = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + shippingAmount + taxAmount;
      // Get address data from URL params
      const shippingAddress = {
        street: searchParams.get('shipping_street') || '',
        city: searchParams.get('shipping_city') || '',
        state: searchParams.get('shipping_state') || '',
        postalCode: searchParams.get('shipping_postal') || '',
        country: searchParams.get('shipping_country') || ''
      };
      const billingAddress = {
        street: searchParams.get('billing_street') || '',
        city: searchParams.get('billing_city') || '',
        state: searchParams.get('billing_state') || '',
        postalCode: searchParams.get('billing_postal') || '',
        country: searchParams.get('billing_country') || ''
      };
      // Transform cart items to order items
      const orderItems = cartItems.map((item: any) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        color: item.color,
        size: item.size
      }));
      const newOrderDetails: OrderDetails = {
        orderId: orderId,
        paypalOrderId: paypalOrderId,
        stripePaymentIntentId: stripePaymentIntentId,
        customerEmail: customerEmail,
        paymentMethod: paymentMethod,
        status: 'confirmed',
        paymentStatus: 'paid',
        items: orderItems,
        taxAmount: taxAmount,
        shippingAmount: shippingAmount,
        totalAmount: totalAmount,
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        orderDate: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
      setOrderDetails(newOrderDetails);
    } catch (error) {
      console.error('Error constructing order details:', error);
      // Set empty order details if construction fails
      const emptyOrderDetails: OrderDetails = {
        orderId: '',
        paypalOrderId: '',
        stripePaymentIntentId: '',
        customerEmail: '',
        paymentMethod: '',
        status: '',
        paymentStatus: '',
        items: [],
        taxAmount: 0,
        shippingAmount: 0,
        totalAmount: 0,
        shippingAddress: {},
        billingAddress: {},
        orderDate: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
      setOrderDetails(emptyOrderDetails);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  // Main receipt UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-0">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 border-b border-gray-200 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Thank You for Your Order!</h1>
          <p className="text-sm text-gray-600">Your order has been placed and a confirmation email sent.</p>
        </div>
        <div className="px-6 py-6">
          {/* Order Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
            <div className="space-y-3">
              {orderDetails?.orderId && (
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{orderDetails.orderId}</p>
                </div>
              )}
              {orderDetails?.paymentMethod && (
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <div className="flex items-center mt-1">
                    <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm font-medium text-gray-900">{orderDetails.paymentMethod}</p>
                  </div>
                </div>
              )}
              {orderDetails?.paypalOrderId && (
                <div>
                  <p className="text-xs text-gray-500">PayPal Order ID</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{orderDetails.paypalOrderId}</p>
                </div>
              )}
              {orderDetails?.stripePaymentIntentId && (
                <div>
                  <p className="text-xs text-gray-500">Stripe Payment Intent ID</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{orderDetails.stripePaymentIntentId}</p>
                </div>
              )}
            </div>
            {/* Order Status Row */}
            {orderDetails?.status && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">Order Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 capitalize`}>
                  {orderDetails.status}
                </span>
              </div>
            )}
          </div>
          <hr className="my-6 border-gray-200" />
          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {orderDetails?.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 relative">
                      <Image
                        src={getOptimizedImageUrl(item.image || `/images/prodimages/product${item.productId}.jpg`)}
                        alt={item.productName}
                        fill
                        className="rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/prodimages/product1.jpg';
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      <Link href={`/product/id/${item.productId}/name/${urlFriendly(item.productName)}`} className="hover:text-indigo-600">
                        {item.productName}
                      </Link>
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 flex-wrap">
                      {item.color && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {item.size}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <hr className="my-6 border-gray-200" />
          {/* Order Totals */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <dl className="space-y-2">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="text-gray-900">
                  ${(orderDetails?.totalAmount || 0) - (orderDetails?.taxAmount || 0) - (orderDetails?.shippingAmount || 0)}
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Shipping</dt>
                <dd className="text-gray-900">${orderDetails?.shippingAmount?.toFixed(2) || '0.00'}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Tax</dt>
                <dd className="text-gray-900">${orderDetails?.taxAmount?.toFixed(2) || '0.00'}</dd>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <dt className="text-gray-900">Total</dt>
                <dd className="text-gray-900">${orderDetails?.totalAmount?.toFixed(2) || '0.00'}</dd>
              </div>
            </dl>
          </div>
          <hr className="my-6 border-gray-200" />
          {/* Shipping Information */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
            <div className="text-sm text-gray-900">
              {orderDetails?.shippingAddress?.street && (
                <p className="font-medium">{orderDetails.shippingAddress.street}</p>
              )}
              {(orderDetails?.shippingAddress?.city || orderDetails?.shippingAddress?.state || orderDetails?.shippingAddress?.postalCode) && (
                <p>
                  {[
                    orderDetails.shippingAddress.city,
                    orderDetails.shippingAddress.state,
                    orderDetails.shippingAddress.postalCode
                  ].filter(Boolean).join(', ')}
                </p>
              )}
              {orderDetails?.shippingAddress?.country && (
                <p>{orderDetails.shippingAddress.country}</p>
              )}
              {!orderDetails?.shippingAddress?.street && 
               !orderDetails?.shippingAddress?.city && 
               !orderDetails?.shippingAddress?.state && 
               !orderDetails?.shippingAddress?.postalCode && 
               !orderDetails?.shippingAddress?.country && (
                <p className="text-gray-400 italic">No shipping address provided</p>
              )}
            </div>
            <div className="mt-4 text-xs text-gray-500">Estimated Delivery: <span className="font-medium text-gray-900">{orderDetails?.estimatedDelivery}</span></div>
          </div>
          {/* Action Buttons - at end of receipt */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-0 py-2 text-indigo-700 font-semibold hover:underline focus:underline transition-all duration-200"
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
            <Link 
              href="/account/orders" 
              className="inline-flex items-center justify-center px-0 py-2 text-gray-700 font-semibold hover:underline focus:underline transition-all duration-200"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 