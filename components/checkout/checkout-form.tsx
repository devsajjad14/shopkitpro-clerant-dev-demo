'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import SquareCardForm, { SquareCardFormRef } from '@/components/SquareCardForm'
import StripeCardForm, { StripeCardFormRef } from '@/components/StripeCardForm'
import AuthorizeCardForm, { AuthorizeCardFormRef } from '@/components/AuthorizeCardForm'
import PayPalCardForm, { PayPalCardFormRef } from '@/components/PayPalCardForm'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckIcon, LockClosedIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { useSession, signIn } from 'next-auth/react'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { saveBillingAddress, saveShippingAddress } from '@/lib/actions/checkout'
import { useCartStore } from '@/lib/stores/cart-store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useOrderStore } from '@/store/order-store'
import { useCartTracking } from '@/hooks/use-cart-tracking'

const steps = ['Billing', 'Shipping', 'Payment'] as const
type Step = (typeof steps)[number]

interface FormData {
  name: string
  email: string
  password: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface FormErrors {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

interface ShippingFormData {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface PaymentFormData {
  cardNumber: string
  expiryDate: string
  cvc: string
  nameOnCard: string
}

interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault?: boolean
}

interface ShippingFormErrors {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

// Define a more explicit session type

// Country name to ISO 2-letter code mapping
const countryNameToCode: Record<string, string> = {
  'Pakistan': 'PK',
  'United States': 'US',
  'India': 'IN',
  'Canada': 'CA',
  'United Kingdom': 'GB',
  // Add more as needed
};

function getCountryCode(country: string): string {
  return countryNameToCode[country] || country || 'US';
}

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export default function CheckoutForm() {
  const [currentStep, setCurrentStep] = useState<Step>('Billing')
  const [isReturningCustomerOpen, setIsReturningCustomerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isBillingAddressLoading, setIsBillingAddressLoading] = useState(false)
  const [isPayPalEnabled, setIsPayPalEnabled] = useState(true)
  const [isCardEnabled, setIsCardEnabled] = useState(true)
  const [cardGateway, setCardGateway] = useState<'stripe' | 'square' | 'authorize' | 'paypal-commerce'>('stripe')
  const [loginError, setLoginError] = useState('')
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })
  const [shippingFormData, setShippingFormData] = useState<ShippingFormData>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })
  const [sameAsBilling, setSameAsBilling] = useState(false)
  const [shippingMethods, setShippingMethods] = useState<any[]>([])
  const [shippingMethod, setShippingMethod] = useState<string>('')
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const setOrderDetails = useOrderStore((state) => state.setOrderDetails);

  // Fix Zustand store usage
  const shippingCost = useCartStore((state) => state.shippingCost)
  const updateShippingCost = useCartStore((state) => state.updateShippingCost)

  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    nameOnCard: '',
  })

  // Add refs for payment inputs to bypass React state timing issues
  const cardNumberRef = useRef<HTMLInputElement>(null)
  const expiryDateRef = useRef<HTMLInputElement>(null)
  const cvcRef = useRef<HTMLInputElement>(null)
  const nameOnCardRef = useRef<HTMLInputElement>(null)
  const squareCardFormRef = useRef<SquareCardFormRef>(null)
  const stripeCardFormRef = useRef<StripeCardFormRef>(null)
  const authorizeCardFormRef = useRef<AuthorizeCardFormRef>(null)
  const payPalCardFormRef = useRef<PayPalCardFormRef>(null)

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [shippingFormErrors, setShippingFormErrors] =
    useState<ShippingFormErrors>({})

  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'paypal' | 'klarna' | 'cod'>('credit-card')

  const [squareCredentials, setSquareCredentials] = useState<{applicationId: string, locationId: string} | null>(null)

  const cartItems = useCartStore((state) => state.items)

  // Add a tooltip state for the button
  const [showTooltip, setShowTooltip] = useState(false)

  const [isKlarnaEnabled, setIsKlarnaEnabled] = useState(false);
  // Add COD state
  const [isCodEnabled, setIsCodEnabled] = useState(false);
  const [codInstructions, setCodInstructions] = useState('');
  const [codRequirePhone, setCodRequirePhone] = useState(false);
  const [codPhone, setCodPhone] = useState('');
  const [codPhoneError, setCodPhoneError] = useState('');

  // Initialize cart tracking
  const { trackCompleteCheckout, trackRecoveryCompletion } = useCartTracking();
  
  // Check if this is a recovery scenario
  const [isRecoveryScenario, setIsRecoveryScenario] = useState(false);
  const [recoveryData, setRecoveryData] = useState<{ recoveryCartId: string, recoveryEmail: string } | null>(null);
  
  // Detect recovery scenario from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isRecovery = urlParams.get('recovery') === 'true';
    const recoveryCartId = urlParams.get('cart');
    const recoveryEmail = urlParams.get('email');
    
    if (isRecovery && recoveryCartId && recoveryEmail) {
      console.log('🔄 RECOVERY DETECTED:', { recoveryCartId, recoveryEmail });
      setIsRecoveryScenario(true);
      setRecoveryData({
        recoveryCartId,
        recoveryEmail
      });
      
      // Keep URL parameters for recovery tracking
      console.log('🔄 Keeping recovery URL parameters for tracking');
    } else {
      console.log('🔄 NO RECOVERY DETECTED - Regular checkout flow');
    }
  }, []);

  // Initialize form data from session only once when component mounts
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }))
    }
  }, [status, session?.user])

  // Fetch payment method status and Square credentials from admin settings
  useEffect(() => {
    const fetchPaymentMethodStatus = async () => {
      try {
        const response = await fetch('/api/admin/payment-settings');
        if (response.ok) {
          const settings = await response.json();
          setIsPayPalEnabled(settings.paypalEnabled || false);
          setIsCardEnabled(settings.cardEnabled || false);
          setCardGateway(settings.cardGateway || 'stripe');
          setIsKlarnaEnabled(settings.klarnaEnabled || false);
          setIsCodEnabled(settings.codEnabled || false);
          setCodInstructions(settings.codInstructions || '');
          setCodRequirePhone(settings.codRequirePhone || false);
        }
      } catch (error) {
        console.error('Error fetching payment method status:', error);
      }
    };
    fetchPaymentMethodStatus();
  }, []);

  // Refresh payment settings when user focuses on the page (in case admin changed settings)
  useEffect(() => {
    const handleFocus = () => {
      const fetchPaymentMethodStatus = async () => {
        try {
          const response = await fetch('/api/admin/payment-settings')
          if (response.ok) {
            const settings = await response.json()
            setIsPayPalEnabled(settings.paypalEnabled || false)
            setIsCardEnabled(settings.cardEnabled || false)
            setCardGateway(settings.cardGateway || 'stripe')
          }
        } catch (error) {
          console.error('Error refreshing payment method status:', error)
        }
      }
      fetchPaymentMethodStatus()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Handle payment method switching when enabled status changes
  useEffect(() => {
    if (!isPayPalEnabled && paymentMethod === 'paypal' && isCardEnabled) {
      console.log('Auto-switching from disabled PayPal to enabled credit card')
      setPaymentMethod('credit-card')
    } else if (!isCardEnabled && paymentMethod === 'credit-card' && isPayPalEnabled) {
      console.log('Auto-switching from disabled credit card to enabled PayPal')
      setPaymentMethod('paypal')
    }
  }, [isPayPalEnabled, isCardEnabled, paymentMethod])

  // Fetch addresses only when currentStep changes and user is authenticated
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return

    const fetchAddresses = async () => {
      if (currentStep === 'Billing') {
        setIsBillingAddressLoading(true)
      }
      
      try {
        const type = currentStep === 'Billing' ? 'billing' : 'shipping'
        const response = await fetch(`/api/addresses?type=${type}`)
        if (!response.ok) throw new Error(`Failed to fetch ${type} address`)

        const addresses = await response.json()
        if (addresses.length > 0) {
          const defaultAddress =
            addresses.find((addr: Address) => addr.isDefault) || addresses[0]

          if (currentStep === 'Billing') {
            setFormData((prev) => ({
              ...prev,
              street: defaultAddress.street || prev.street,
              city: defaultAddress.city || prev.city,
              state: defaultAddress.state || prev.state,
              postalCode: defaultAddress.postalCode || prev.postalCode,
              country: defaultAddress.country || prev.country,
            }))
          } else {
            setShippingFormData((prev) => ({
              ...prev,
              street: defaultAddress.street || prev.street,
              city: defaultAddress.city || prev.city,
              state: defaultAddress.state || prev.state,
              postalCode: defaultAddress.postalCode || prev.postalCode,
              country: defaultAddress.country || prev.country,
            }))
          }
        }
      } catch (error) {
        console.error(
          `Error fetching ${currentStep.toLowerCase()} address:`,
          error
        )
      } finally {
        if (currentStep === 'Billing') {
          setIsBillingAddressLoading(false)
        }
      }
    }

    fetchAddresses()
  }, [currentStep, status, session?.user?.email])

  // Update shipping form data when sameAsBilling changes
  useEffect(() => {
    if (sameAsBilling) {
      setShippingFormData({
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      })
    }
  }, [sameAsBilling, formData])

  // Fetch shipping methods dynamically
  useEffect(() => {
    async function fetchShippingMethods() {
      try {
        const res = await fetch('/api/admin/shipping')
        if (!res.ok) throw new Error('Failed to fetch shipping methods')
        const data = await res.json()
        // Only use active methods
        const activeMethods = Array.isArray(data)
          ? data.filter((m) => m.isActive)
          : []
        setShippingMethods(activeMethods)
        // Set default shipping method if not set
        if (activeMethods.length > 0 && !shippingMethod) {
          setShippingMethod(activeMethods[0].id)
        }
      } catch (e) {
        setShippingMethods([])
      }
    }
    fetchShippingMethods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update shipping cost when shipping method changes
  useEffect(() => {
    const selected = shippingMethods.find((m) => m.id === shippingMethod)
    const newShippingCost = selected ? Number(selected.price) : 0
    if (newShippingCost !== shippingCost) {
      updateShippingCost(newShippingCost)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingMethod, shippingMethods, shippingCost])

  // Memoize validation functions
  const validateBillingForm = useCallback((): boolean => {
    const errors: FormErrors = {}
    let isValid = true

    // Street address validation
    if (!formData.street.trim()) {
      errors.street = 'Street address is required'
      isValid = false
    } else if (formData.street.trim().length < 5) {
      errors.street =
        'Please enter a valid street address (minimum 5 characters)'
      isValid = false
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required'
      isValid = false
    } else if (formData.city.trim().length < 2) {
      errors.city = 'Please enter a valid city name (minimum 2 characters)'
      isValid = false
    }

    // State validation
    if (!formData.state.trim()) {
      errors.state = 'State/Province is required'
      isValid = false
    } else if (formData.state.trim().length < 2) {
      errors.state =
        'Please enter a valid state/province name (minimum 2 characters)'
      isValid = false
    }

    // Postal code validation
    if (!formData.postalCode.trim()) {
      errors.postalCode = 'Postal code is required'
      isValid = false
    } else {
      // Remove any spaces from postal code
      const cleanPostalCode = formData.postalCode.replace(/\s/g, '')
      if (!/^\d{5}(-\d{4})?$/.test(cleanPostalCode)) {
        errors.postalCode =
          'Please enter a valid postal code (e.g., 12345 or 12345-6789)'
        isValid = false
      }
    }

    // Country validation
    if (!formData.country.trim()) {
      errors.country = 'Country is required'
      isValid = false
    } else if (formData.country.trim().length < 2) {
      errors.country =
        'Please enter a valid country name (minimum 2 characters)'
      isValid = false
    }

    setFormErrors(errors)

    // Show toast message if there are any errors
    if (!isValid) {
      const errorMessages = Object.values(errors)
      if (errorMessages.length > 0) {
        toast.error(errorMessages[0], {
          description:
            errorMessages.length > 1
              ? 'Please check all required fields'
              : undefined,
        })
      }
    }

    return isValid
  }, [formData, setFormErrors])

  const validateShippingForm = useCallback((): boolean => {
    const errors: ShippingFormErrors = {}
    let isValid = true

    // Skip validation if same as billing
    if (sameAsBilling) {
      setShippingFormErrors({})
      return true
    }

    // Street address validation
    if (!shippingFormData.street.trim()) {
      errors.street = 'Street address is required'
      isValid = false
    } else if (shippingFormData.street.trim().length < 5) {
      errors.street =
        'Please enter a valid street address (minimum 5 characters)'
      isValid = false
    }

    // City validation
    if (!shippingFormData.city.trim()) {
      errors.city = 'City is required'
      isValid = false
    } else if (shippingFormData.city.trim().length < 2) {
      errors.city = 'Please enter a valid city name (minimum 2 characters)'
      isValid = false
    }

    // State validation
    if (!shippingFormData.state.trim()) {
      errors.state = 'State/Province is required'
      isValid = false
    } else if (shippingFormData.state.trim().length < 2) {
      errors.state =
        'Please enter a valid state/province name (minimum 2 characters)'
      isValid = false
    }

    // Postal code validation
    if (!shippingFormData.postalCode.trim()) {
      errors.postalCode = 'Postal code is required'
      isValid = false
    } else {
      // Remove any spaces from postal code
      const cleanPostalCode = shippingFormData.postalCode.replace(/\s/g, '')
      if (!/^\d{5}(-\d{4})?$/.test(cleanPostalCode)) {
        errors.postalCode =
          'Please enter a valid postal code (e.g., 12345 or 12345-6789)'
        isValid = false
      }
    }

    // Country validation
    if (!shippingFormData.country.trim()) {
      errors.country = 'Country is required'
      isValid = false
    } else if (shippingFormData.country.trim().length < 2) {
      errors.country =
        'Please enter a valid country name (minimum 2 characters)'
      isValid = false
    }

    setShippingFormErrors(errors)

    // Show toast message if there are any errors
    if (!isValid) {
      const errorMessages = Object.values(errors)
      if (errorMessages.length > 0) {
        toast.error(errorMessages[0], {
          description:
            errorMessages.length > 1
              ? 'Please check all required fields'
              : undefined,
        })
      }
    }

    return isValid
  }, [shippingFormData, sameAsBilling, setShippingFormErrors])

  // Update handleNextStep to include shipping validation
  const handleNextStep = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)
    
    let orderSuccessful = false

    try {
      if (currentStep === 'Billing') {
        if (!validateBillingForm()) {
          setIsLoading(false)
          return
        }

        try {
          const billingData = new FormData()
          billingData.set('type', 'billing')
          billingData.set('isDefault', 'true')
          billingData.set('street', formData.street)
          billingData.set('city', formData.city)
          billingData.set('state', formData.state)
          billingData.set('postalCode', formData.postalCode)
          billingData.set('country', formData.country)

          const billingResult = await saveBillingAddress(null, billingData)
          if (billingResult?.error) {
            let errorMessage: string;
            if (
              typeof billingResult.error === 'object' &&
              billingResult.error !== null &&
              'message' in billingResult.error &&
              typeof (billingResult.error as any).message === 'string'
            ) {
              errorMessage = (billingResult.error as any).message;
            } else if (typeof billingResult.error === 'string') {
              errorMessage = billingResult.error;
            } else {
              errorMessage = 'Billing validation failed';
            }
            toast.error(errorMessage);
            return;
          }

          setCurrentStep('Shipping')
          toast.success('Billing information saved successfully')
        } catch (error: unknown) {
          console.error('Error saving billing address:', error)
          toast.error('Failed to save billing address. Please try again.')
          setIsLoading(false)
          return
        }
      } else if (currentStep === 'Shipping') {
        if (!validateShippingForm()) {
          setIsLoading(false)
          return
        }
        try {
          const shippingFormDataToSubmit = new FormData()

          if (sameAsBilling) {
            shippingFormDataToSubmit.set('street', formData.street)
            shippingFormDataToSubmit.set('city', formData.city)
            shippingFormDataToSubmit.set('state', formData.state)
            shippingFormDataToSubmit.set('postalCode', formData.postalCode)
            shippingFormDataToSubmit.set('country', formData.country)
          } else {
            shippingFormDataToSubmit.set('street', shippingFormData.street)
            shippingFormDataToSubmit.set('city', shippingFormData.city)
            shippingFormDataToSubmit.set('state', shippingFormData.state)
            shippingFormDataToSubmit.set(
              'postalCode',
              shippingFormData.postalCode
            )
            shippingFormDataToSubmit.set('country', shippingFormData.country)
          }

          shippingFormDataToSubmit.set('isDefault', 'true')
          shippingFormDataToSubmit.set('shippingMethod', shippingMethod)

          const shippingResult = await saveShippingAddress(
            null,
            shippingFormDataToSubmit
          )
          if (shippingResult?.error) {
            let errorMessage: string;
            if (
              typeof shippingResult.error === 'object' &&
              shippingResult.error !== null &&
              'message' in shippingResult.error &&
              typeof (shippingResult.error as any).message === 'string'
            ) {
              errorMessage = (shippingResult.error as any).message;
            } else if (typeof shippingResult.error === 'string') {
              errorMessage = shippingResult.error;
            } else {
              errorMessage = 'Shipping validation failed';
            }
            toast.error(errorMessage);
            return;
          }

          setCurrentStep('Payment')
          toast.success('Shipping information saved successfully')
        } catch (error: unknown) {
          console.error('Error saving shipping address:', error)
          toast.error('Failed to save shipping information')
          setIsLoading(false)
          return
        }
      } else if (currentStep === 'Payment') {
        if (paymentMethod === 'paypal' && isPayPalEnabled) {
          // Build payload for backend
          const payload = {
            order_id: generateOrderId(),
            customer: {
              email: formData.email,
              first_name: formData.name.split(' ')[0] || '',
              last_name: formData.name.split(' ').slice(1).join(' ') || 'Customer',
              phone: session?.user?.phone || '',
            },
            items: cartItems.map(item => ({
              product_id: String(item.productId),
              name: item.name || 'Product',
              quantity: Number(item.quantity) || 1,
              unit_price: String(Number(item.price) || 0),
              currency: 'USD',
            })),
            shipping_address: {
              line1: shippingFormData.street,
              line2: '',
              city: shippingFormData.city,
              state: shippingFormData.state,
              postal_code: shippingFormData.postalCode,
              country_code: getCountryCode(shippingFormData.country),
            },
            billing_address: {
              line1: formData.street,
              line2: '',
              city: formData.city,
              state: formData.state,
              postal_code: formData.postalCode,
              country_code: getCountryCode(formData.country),
            },
            subtotal: calculateSubtotal(cartItems),
            tax_amount: calculateTax(cartItems),
            shipping_amount: shippingCost,
            discount_amount: 0,
            total_amount: calculateTotal(cartItems, shippingCost),
            currency: 'USD',
            payment_method: 'paypal',
            notes: '',
          };
          // Use only valid product IDs for testing
          const validProductIds = [1850, 1851, 1857, 1849, 1868, 1842, 1856, 1845, 1844, 1852, 1854, 1853, 1841, 1846];
          // Prepare order items for DB insert
          let orderItemsData: {
            productId: number;
            name: string;
            quantity: number;
            unitPrice: string;
            totalPrice: string;
            // Add other fields as needed (color, size, sku, etc.)
          }[] = cartItems.map((item, idx) => {
            const name = item.name || 'Product';
            const quantity = Number(item.quantity) || 1;
            const unitPrice = Number(item.price) || 0;
            const totalPrice = unitPrice * quantity;
            // Always use a valid productId from the list (cycle through for multiple items)
            const productId = validProductIds[idx % validProductIds.length];
            return {
              productId,
              name,
              quantity,
              unitPrice: String(unitPrice),
              totalPrice: String(totalPrice),
              // Add other fields as needed (color, size, sku, etc.)
            };
          });
          // POST to backend via proxy
          try {
            const response = await fetch('/api/checkout/process-paypal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
              toast.error(result.message || 'Failed to process PayPal order');
              setIsLoading(false);
              return;
            }
            // Insert order into local DB
            try {
              await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customerEmail: formData.email,
                  paymentMethod: 'paypal',
                  status: 'paid',
                  paymentStatus: 'paid',
                  note: '',
                  items: cartItems.map(item => ({
                    productId: item.productId,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                  discountType: '',
                  discountValue: 0,
                  taxAmount: calculateTax(cartItems),
                  shippingAmount: shippingCost,
                  userId: session?.user?.id || null,
                  shippingAddress: JSON.stringify(shippingFormData),
                  billingAddress: JSON.stringify(formData),
                  phone: session?.user?.phone || '',
                }),
              });
            } catch (dbError) {
              console.error('Order DB insert error:', dbError);
              // Optionally show a toast, but continue to thank-you page
            }
            setOrderDetails({
              orderId: result.order_id,
              paypalOrderId: result.paypal_order_id,
              customerEmail: formData.email,
              paymentMethod: 'paypal',
              status: 'confirmed',
              paymentStatus: 'paid',
              items: cartItems.map(item => ({
                productId: item.productId,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                color: item.color || undefined,
                size: item.size || undefined
              })),
              taxAmount: calculateTax(cartItems),
              shippingAmount: shippingCost,
              totalAmount: calculateTotal(cartItems, shippingCost),
              shippingAddress: {
                street: shippingFormData.street,
                city: shippingFormData.city,
                state: shippingFormData.state,
                postalCode: shippingFormData.postalCode,
                country: shippingFormData.country
              },
              billingAddress: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country
              },
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
            });
            orderSuccessful = true;
            // Track cart completion
            const orderData = {
              totalAmount: calculateTotal(cartItems, shippingCost),
              itemCount: cartItems.length,
              items: cartItems, // Include cart items for hash generation
              orderId: result.order_id,
              paymentMethod: 'paypal'
            };
            
            // Track recovery if this is a recovery scenario
            if (isRecoveryScenario && recoveryData) {
              console.log('🔄 RECOVERY TRACKING:', { recoveryCartId: recoveryData.recoveryCartId, recoveryEmail: recoveryData.recoveryEmail });
              await trackRecoveryCompletion({
                recoveryCartId: recoveryData.recoveryCartId,
                recoveryEmail: recoveryData.recoveryEmail,
                orderData
              });
            } else {
              // Only track regular checkout completion if not a recovery
              trackCompleteCheckout(orderData);
            }
            router.push(`/orders/thank-you?order_id=${result.order_id}&paypal_order_id=${result.paypal_order_id}`);
            return;
          } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            toast.error('Network or fetch error.');
            setIsLoading(false);
            return;
          }
        } else if (paymentMethod === 'credit-card' && isCardEnabled) {
          // Validate payment data based on gateway
          if (cardGateway === 'square') {
            // For Square, get card details directly from the form ref
            const squareCardDetails = squareCardFormRef.current?.getCardDetails()
            if (!squareCardDetails) {
              toast.error('Please fill in all card details');
              setIsLoading(false);
              return;
            }
            
            // Update payment form data with current values
            setPaymentFormData({
              cardNumber: squareCardDetails.cardNumber,
              expiryDate: `${squareCardDetails.expiryMonth}/${squareCardDetails.expiryYear}`,
              cvc: squareCardDetails.cvc,
              nameOnCard: squareCardDetails.nameOnCard
            })
          } else if (cardGateway === 'authorize') {
            // For Authorize.Net, get card details directly from the form ref
            const authorizeCardDetails = authorizeCardFormRef.current?.getCardDetails()
            if (!authorizeCardDetails) {
              toast.error('Please fill in all card details');
              setIsLoading(false);
              return;
            }
            
            // Update payment form data with current values
            setPaymentFormData({
              cardNumber: authorizeCardDetails.cardNumber,
              expiryDate: `${authorizeCardDetails.expiryMonth}/${authorizeCardDetails.expiryYear}`,
              cvc: authorizeCardDetails.cvc,
              nameOnCard: authorizeCardDetails.nameOnCard
            })
          } else if (cardGateway === 'paypal-commerce') {
            // For PayPal Commerce, get card details directly from the form ref
            const payPalCardDetails = payPalCardFormRef.current?.getCardDetails()
            if (!payPalCardDetails) {
              toast.error('Please fill in all card details');
              setIsLoading(false);
              return;
            }
            
            // Update payment form data with current values
            setPaymentFormData({
              cardNumber: payPalCardDetails.cardNumber,
              expiryDate: `${payPalCardDetails.expiryMonth}/${payPalCardDetails.expiryYear}`,
              cvc: payPalCardDetails.cvc,
              nameOnCard: payPalCardDetails.nameOnCard
            })
          } else {
            // For Stripe, get card details from the form ref
            const stripeCardDetails = stripeCardFormRef.current?.getCardDetails()
            if (!stripeCardDetails) {
              toast.error('Please fill in all card details');
              setIsLoading(false);
              return;
            }
            
            // Update payment form data with current values
            setPaymentFormData({
              cardNumber: stripeCardDetails.cardNumber,
              expiryDate: `${stripeCardDetails.expiryMonth}/${stripeCardDetails.expiryYear}`,
              cvc: stripeCardDetails.cvc,
              nameOnCard: stripeCardDetails.nameOnCard
            })
          }

          // Parse expiry date based on gateway
          let expiryMonth, expiryYear, formattedExpiryYear;
          if (cardGateway === 'square') {
            const squareCardDetails = squareCardFormRef.current?.getCardDetails()
            if (squareCardDetails) {
              expiryMonth = squareCardDetails.expiryMonth
              expiryYear = squareCardDetails.expiryYear
              formattedExpiryYear = expiryYear.length === 2 ? '20' + expiryYear : expiryYear
            } else {
              [expiryMonth, expiryYear] = paymentFormData.expiryDate.split('/');
              formattedExpiryYear = expiryYear.length === 2 ? '20' + expiryYear : expiryYear;
            }
          } else if (cardGateway === 'authorize') {
            const authorizeCardDetails = authorizeCardFormRef.current?.getCardDetails()
            if (authorizeCardDetails) {
              expiryMonth = authorizeCardDetails.expiryMonth
              expiryYear = authorizeCardDetails.expiryYear
              formattedExpiryYear = expiryYear.length === 2 ? '20' + expiryYear : expiryYear
            } else {
              [expiryMonth, expiryYear] = paymentFormData.expiryDate.split('/');
              formattedExpiryYear = expiryYear.length === 2 ? '20' + expiryYear : expiryYear;
            }
          } else if (cardGateway === 'paypal-commerce') {
            const payPalCardDetails = payPalCardFormRef.current?.getCardDetails()
            if (payPalCardDetails) {
              expiryMonth = payPalCardDetails.expiryMonth
              expiryYear = payPalCardDetails.expiryYear
              formattedExpiryYear = expiryYear.length === 2 ? '20' + expiryYear : expiryYear
            } else {
              [expiryMonth, expiryYear] = paymentFormData.expiryDate.split('/');
              formattedExpiryYear = expiryYear.length === 2 ? '20' + expiryYear : expiryYear;
            }
          } else {
            const stripeCardDetails = stripeCardFormRef.current?.getCardDetails()
            if (stripeCardDetails) {
              expiryMonth = stripeCardDetails.expiryMonth
              expiryYear = stripeCardDetails.expiryYear
              formattedExpiryYear = expiryYear.length === 2 ? '20' + expiryYear : expiryYear
            } else {
              [expiryMonth, expiryYear] = paymentFormData.expiryDate.split('/');
              formattedExpiryYear = expiryYear.length === 2 ? '20' + expiryYear : expiryYear;
            }
          }

          // Build payload based on gateway
          let payload;
          
          if (cardGateway === 'square') {
            // Square payload with card details from ref
            const squareCardDetails = squareCardFormRef.current?.getCardDetails()
            if (!squareCardDetails) {
              toast.error('Please fill in all card details');
              setIsLoading(false);
              return;
            }
            
            payload = {
              order_id: generateOrderId(),
              customer: {
                email: formData.email,
                first_name: formData.name.split(' ')[0] || '',
                last_name: formData.name.split(' ').slice(1).join(' ') || 'Customer',
                phone: session?.user?.phone || '',
              },
              items: cartItems.map(item => ({
                product_id: String(item.productId),
                name: item.name || 'Product',
                quantity: Number(item.quantity) || 1,
                unit_price: (Number(item.price) * 100).toString(), // Convert to cents
                currency: 'usd', // Lowercase as required by schema
              })),
              shipping_address: {
                line1: shippingFormData.street,
                line2: '',
                city: shippingFormData.city,
                state: shippingFormData.state,
                postal_code: shippingFormData.postalCode,
                country_code: getCountryCode(shippingFormData.country),
              },
              billing_address: {
                line1: formData.street,
                line2: '',
                city: formData.city,
                state: formData.state,
                postal_code: formData.postalCode,
                country_code: getCountryCode(formData.country),
              },
              subtotal: (calculateSubtotal(cartItems) * 100).toString(), // Convert to cents
              tax_amount: (calculateTax(cartItems) * 100).toString(), // Convert to cents
              shipping_amount: (shippingCost * 100).toString(), // Convert to cents
              discount_amount: '0', // Convert to cents
              total_amount: (calculateTotal(cartItems, shippingCost) * 100).toString(), // Convert to cents
              currency: 'usd', // Lowercase as required by schema
              payment_method: {
                type: 'card',
                card_number: squareCardDetails.cardNumber,
                expiry_month: parseInt(squareCardDetails.expiryMonth),
                expiry_year: parseInt(squareCardDetails.expiryYear),
                cvc: squareCardDetails.cvc,
                name_on_card: squareCardDetails.nameOnCard,
                save_payment_method: false,
              },
              notes: '',
            };
          } else if (cardGateway === 'authorize') {
            // Authorize.Net payload with card details from ref
            const authorizeCardDetails = authorizeCardFormRef.current?.getCardDetails()
            if (!authorizeCardDetails) {
              toast.error('Please fill in all card details');
              setIsLoading(false);
              return;
            }
            
            payload = {
              order_id: generateOrderId(),
              customer: {
                email: formData.email,
                first_name: formData.name.split(' ')[0] || '',
                last_name: formData.name.split(' ').slice(1).join(' ') || 'Customer',
                phone: session?.user?.phone || '',
              },
              items: cartItems.map(item => ({
                product_id: String(item.productId),
                name: item.name || 'Product',
                quantity: Number(item.quantity) || 1,
                unit_price: Number(item.price).toFixed(2), // Dollar format
                currency: 'usd',
              })),
              shipping_address: {
                line1: shippingFormData.street,
                line2: '',
                city: shippingFormData.city,
                state: shippingFormData.state,
                postal_code: shippingFormData.postalCode,
                country_code: getCountryCode(shippingFormData.country),
              },
              billing_address: {
                line1: formData.street,
                line2: '',
                city: formData.city,
                state: formData.state,
                postal_code: formData.postalCode,
                country_code: getCountryCode(formData.country),
              },
              subtotal: calculateSubtotal(cartItems).toFixed(2),
              tax_amount: calculateTax(cartItems).toFixed(2),
              shipping_amount: shippingCost.toFixed(2),
              discount_amount: '0.00',
              total_amount: calculateTotal(cartItems, shippingCost).toFixed(2),
              currency: 'usd',
              payment_method: {
                type: 'card',
                card_number: authorizeCardDetails.cardNumber,
                expiry_month: parseInt(authorizeCardDetails.expiryMonth),
                expiry_year: parseInt(authorizeCardDetails.expiryYear),
                cvc: authorizeCardDetails.cvc,
                name_on_card: authorizeCardDetails.nameOnCard,
                save_payment_method: false,
              },
              notes: '',
            };
          } else if (cardGateway === 'paypal-commerce') {
            // PayPal Commerce payload with card details from ref
            const payPalCardDetails = payPalCardFormRef.current?.getCardDetails()
            if (!payPalCardDetails) {
              toast.error('Please fill in all card details');
              setIsLoading(false);
              return;
            }
            
            payload = {
              order_id: generateOrderId(),
              customer: {
                email: formData.email,
                first_name: formData.name.split(' ')[0] || '',
                last_name: formData.name.split(' ').slice(1).join(' ') || 'Customer',
                phone: session?.user?.phone || '',
              },
              items: cartItems.map(item => ({
                product_id: String(item.productId),
                name: item.name || 'Product',
                quantity: Number(item.quantity) || 1,
                unit_price: (Number(item.price) * 100).toString(), // Convert to cents
                currency: 'usd', // Lowercase as required by schema
              })),
              shipping_address: {
                line1: shippingFormData.street,
                line2: '',
                city: shippingFormData.city,
                state: shippingFormData.state,
                postal_code: shippingFormData.postalCode,
                country_code: getCountryCode(shippingFormData.country),
              },
              billing_address: {
                line1: formData.street,
                line2: '',
                city: formData.city,
                state: formData.state,
                postal_code: formData.postalCode,
                country_code: getCountryCode(formData.country),
              },
              subtotal: (calculateSubtotal(cartItems) * 100).toString(), // Convert to cents
              tax_amount: (calculateTax(cartItems) * 100).toString(), // Convert to cents
              shipping_amount: (shippingCost * 100).toString(), // Convert to cents
              discount_amount: '0', // Convert to cents
              total_amount: (calculateTotal(cartItems, shippingCost) * 100).toString(), // Convert to cents
              currency: 'usd', // Lowercase as required by schema
              payment_method: {
                type: 'card',
                card_number: payPalCardDetails.cardNumber,
                expiry_month: parseInt(payPalCardDetails.expiryMonth),
                expiry_year: parseInt(payPalCardDetails.expiryYear),
                cvc: payPalCardDetails.cvc,
                name_on_card: payPalCardDetails.nameOnCard,
                save_payment_method: false,
              },
              notes: '',
            };
          } else {
            // Stripe payload with card details
            payload = {
              order_id: generateOrderId(),
              customer: {
                email: formData.email,
                first_name: formData.name.split(' ')[0] || '',
                last_name: formData.name.split(' ').slice(1).join(' ') || 'Customer',
                phone: session?.user?.phone || '',
              },
              items: cartItems.map(item => ({
                product_id: String(item.productId),
                name: item.name || 'Product',
                quantity: Number(item.quantity) || 1,
                unit_price: (Number(item.price) * 100).toString(), // Convert to cents
                currency: 'usd', // Lowercase as required by schema
              })),
              shipping_address: {
                line1: shippingFormData.street,
                line2: '',
                city: shippingFormData.city,
                state: shippingFormData.state,
                postal_code: shippingFormData.postalCode,
                country_code: getCountryCode(shippingFormData.country),
              },
              billing_address: {
                line1: formData.street,
                line2: '',
                city: formData.city,
                state: formData.state,
                postal_code: formData.postalCode,
                country_code: getCountryCode(formData.country),
              },
              subtotal: (calculateSubtotal(cartItems) * 100).toString(), // Convert to cents
              tax_amount: (calculateTax(cartItems) * 100).toString(), // Convert to cents
              shipping_amount: (shippingCost * 100).toString(), // Convert to cents
              discount_amount: '0', // Convert to cents
              total_amount: (calculateTotal(cartItems, shippingCost) * 100).toString(), // Convert to cents
              currency: 'usd', // Lowercase as required by schema
              payment_method: {
                type: 'card',
                card_number: paymentFormData.cardNumber,
                expiry_month: parseInt(paymentFormData.expiryDate.split('/')[0]),
                expiry_year: parseInt('20' + paymentFormData.expiryDate.split('/')[1]),
                cvc: paymentFormData.cvc,
                name_on_card: paymentFormData.nameOnCard,
                save_payment_method: false,
              },
              notes: '',
            };
          }

          // Use only valid product IDs for testing
          const validProductIds = [1850, 1851, 1857, 1849, 1868, 1842, 1856, 1845, 1844, 1852, 1854, 1853, 1841, 1846];

          // Determine the correct API endpoint based on the configured card gateway
          const apiEndpoint = `/api/checkout/process-${cardGateway}`;

          // POST to backend via proxy
          try {
            const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const result = await response.json();
            
            if (!response.ok || !result.success) {
              const errorMessage = typeof result.error === 'object' && result.error?.message 
                ? result.error.message 
                : typeof result.error === 'string' 
                ? result.error 
                : result.message || `Failed to process ${cardGateway} payment`;
              toast.error(errorMessage);
              setIsLoading(false);
              return;
            }

            // Insert order into local DB
            try {
              await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customerEmail: formData.email,
                  paymentMethod: 'credit-card',
                  status: 'paid',
                  paymentStatus: 'paid',
                  note: '',
                  items: cartItems.map(item => ({
                    productId: item.productId,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                  discountType: '',
                  discountValue: 0,
                  taxAmount: calculateTax(cartItems),
                  shippingAmount: shippingCost,
                  userId: session?.user?.id || null,
                  shippingAddress: JSON.stringify(shippingFormData),
                  billingAddress: JSON.stringify(formData),
                  phone: session?.user?.phone || '',
                }),
              });
            } catch (dbError) {
              console.error('Order DB insert error:', dbError);
              // Optionally show a toast, but continue to thank-you page
            }

            // Set order details based on the payment gateway response
            const orderDetailsPayload: any = {
              orderId: result.order_id,
              customerEmail: formData.email,
              paymentMethod: 'credit-card',
              status: 'confirmed',
              paymentStatus: 'paid',
              items: cartItems.map(item => ({
                productId: item.productId,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                color: item.color || undefined,
                size: item.size || undefined
              })),
              taxAmount: calculateTax(cartItems),
              shippingAmount: shippingCost,
              totalAmount: calculateTotal(cartItems, shippingCost),
              shippingAddress: {
                street: shippingFormData.street,
                city: shippingFormData.city,
                state: shippingFormData.state,
                postalCode: shippingFormData.postalCode,
                country: shippingFormData.country
              },
              billingAddress: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country
              },
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

            // Add gateway-specific payment IDs to order details
            if (cardGateway === 'stripe') {
              orderDetailsPayload.stripePaymentIntentId = result.payment_intent?.id;
            } else if (cardGateway === 'square') {
              orderDetailsPayload.squarePaymentId = result.payment?.id;
            }

            setOrderDetails(orderDetailsPayload);

            orderSuccessful = true;
            
            // Track cart completion
            const orderData = {
              totalAmount: calculateTotal(cartItems, shippingCost),
              itemCount: cartItems.length,
              items: cartItems, // Include cart items for hash generation
              orderId: result.order_id,
              paymentMethod: 'credit-card',
              gateway: cardGateway
            };
            
            // Track recovery if this is a recovery scenario
            if (isRecoveryScenario && recoveryData) {
              console.log('🔄 RECOVERY TRACKING:', { recoveryCartId: recoveryData.recoveryCartId, recoveryEmail: recoveryData.recoveryEmail });
              await trackRecoveryCompletion({
                recoveryCartId: recoveryData.recoveryCartId,
                recoveryEmail: recoveryData.recoveryEmail,
                orderData
              });
            } else {
              // Only track regular checkout completion if not a recovery
              trackCompleteCheckout(orderData);
            }
            
            // Redirect to thank you page with appropriate payment IDs
            const redirectParams = new URLSearchParams({
              order_id: result.order_id
            });
            
            if (cardGateway === 'stripe' && result.payment_intent?.id) {
              redirectParams.append('stripe_payment_intent_id', result.payment_intent.id);
            } else if (cardGateway === 'square' && result.payment?.id) {
              redirectParams.append('square_payment_id', result.payment.id);
            }
            
            router.push(`/orders/thank-you?${redirectParams.toString()}`);
            return;
          } catch (fetchError) {
            console.error(`${cardGateway} fetch error:`, fetchError);
            toast.error('Network or fetch error.');
            setIsLoading(false);
            return;
          }
        } else if (paymentMethod === 'paypal' && !isPayPalEnabled) {
          toast.error('PayPal is currently disabled. Please select another payment method.');
          setIsLoading(false);
          return;
        } else if (paymentMethod === 'credit-card' && !isCardEnabled) {
          toast.error('Credit/Debit Card is currently disabled. Please select another payment method.');
          setIsLoading(false);
          return;
        } else if (paymentMethod === 'klarna' && isKlarnaEnabled) {
          // Klarna payment flow
          try {
            const payload = {
              order_id: generateOrderId(),
              customer: {
                email: formData.email,
                first_name: formData.name.split(' ')[0] || '',
                last_name: formData.name.split(' ').slice(1).join(' ') || 'Customer',
                phone: session?.user?.phone || '',
              },
              items: cartItems.map(item => ({
                product_id: String(item.productId),
                name: item.name || 'Product',
                quantity: Number(item.quantity) || 1,
                unit_price: String(Number(item.price) || 0),
                currency: 'USD',
              })),
              shipping_address: {
                line1: shippingFormData.street,
                line2: '',
                city: shippingFormData.city,
                state: shippingFormData.state,
                postal_code: shippingFormData.postalCode,
                country_code: getCountryCode(shippingFormData.country),
              },
              billing_address: {
                line1: formData.street,
                line2: '',
                city: formData.city,
                state: formData.state,
                postal_code: formData.postalCode,
                country_code: getCountryCode(formData.country),
              },
              subtotal: calculateSubtotal(cartItems),
              tax_amount: calculateTax(cartItems),
              shipping_amount: shippingCost,
              discount_amount: 0,
              total_amount: calculateTotal(cartItems, shippingCost),
              currency: 'USD',
              payment_method: 'klarna',
              notes: '',
            };
            const response = await fetch('/api/checkout/process-klarna', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
              const errorMessage =
                (typeof result.error === 'string' && result.error.includes('403 Forbidden'))
                  ? 'Klarna is not available in your country or network. Please use a VPN or try a different payment method.'
                  : result.message || result.error || 'Failed to process Klarna order';
              toast.error(errorMessage);
              setIsLoading(false);
              return;
            }
            setOrderDetails({
              orderId: result.order_id,
              customerEmail: formData.email,
              paymentMethod: 'klarna',
              status: 'confirmed',
              paymentStatus: 'paid',
              items: cartItems.map(item => ({
                productId: item.productId,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                color: item.color || undefined,
                size: item.size || undefined
              })),
              taxAmount: calculateTax(cartItems),
              shippingAmount: shippingCost,
              totalAmount: calculateTotal(cartItems, shippingCost),
              shippingAddress: {
                street: shippingFormData.street,
                city: shippingFormData.city,
                state: shippingFormData.state,
                postalCode: shippingFormData.postalCode,
                country: shippingFormData.country
              },
              billingAddress: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country
              },
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
            });
            orderSuccessful = true;
            // Track cart completion
            const orderData = {
              totalAmount: calculateTotal(cartItems, shippingCost),
              itemCount: cartItems.length,
              items: cartItems, // Include cart items for hash generation
              orderId: result.order_id,
              paymentMethod: 'klarna'
            };
            
            // Track recovery if this is a recovery scenario
            if (isRecoveryScenario && recoveryData) {
              console.log('🔄 RECOVERY TRACKING:', { recoveryCartId: recoveryData.recoveryCartId, recoveryEmail: recoveryData.recoveryEmail });
              await trackRecoveryCompletion({
                recoveryCartId: recoveryData.recoveryCartId,
                recoveryEmail: recoveryData.recoveryEmail,
                orderData
              });
            } else {
              // Only track regular checkout completion if not a recovery
              trackCompleteCheckout(orderData);
            }
            router.push(`/orders/thank-you?order_id=${result.order_id}`);
            return;
          } catch (fetchError) {
            console.error('Klarna fetch error:', fetchError);
            toast.error('Network or fetch error.');
            setIsLoading(false);
            return;
          }
        } else if (paymentMethod === 'cod' && isCodEnabled) {
          // Validate phone if required
          if (codRequirePhone && !codPhone.trim()) {
            setCodPhoneError('Phone number is required for Cash on Delivery.');
            setIsLoading(false);
            return;
          }
          // Insert order into local DB (via API)
          try {
            await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerEmail: formData.email,
                paymentMethod: 'cod',
                status: 'pending',
                paymentStatus: 'pending',
                note: '',
                items: cartItems.map(item => ({
                  productId: item.productId,
                  productName: item.name,
                  quantity: item.quantity,
                  price: item.price,
                })),
                discountType: '',
                discountValue: 0,
                taxAmount: calculateTax(cartItems),
                shippingAmount: shippingCost,
                userId: session?.user?.id || null,
                shippingAddress: JSON.stringify(shippingFormData),
                billingAddress: JSON.stringify(formData),
                phone: codPhone || session?.user?.phone || '',
              }),
            });
          } catch (dbError) {
            console.error('Order DB insert error:', dbError);
            // Optionally show a toast, but continue to thank-you page
          }
          setOrderDetails({
            orderId: generateOrderId(),
            customerEmail: formData.email,
            paymentMethod: 'cod',
            status: 'pending',
            paymentStatus: 'pending',
            items: cartItems.map(item => ({
              productId: item.productId,
              productName: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.image,
              color: item.color || undefined,
              size: item.size || undefined
            })),
            taxAmount: calculateTax(cartItems),
            shippingAmount: shippingCost,
            totalAmount: calculateTotal(cartItems, shippingCost),
            shippingAddress: {
              street: shippingFormData.street,
              city: shippingFormData.city,
              state: shippingFormData.state,
              postalCode: shippingFormData.postalCode,
              country: shippingFormData.country
            },
            billingAddress: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              country: formData.country
            },
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
          });
          orderSuccessful = true;
          // Track cart completion
          const orderData = {
            totalAmount: calculateTotal(cartItems, shippingCost),
            itemCount: cartItems.length,
            items: cartItems, // Include cart items for hash generation
            orderId: generateOrderId(),
            paymentMethod: 'cod'
          };
          
          // Track recovery if this is a recovery scenario, otherwise track regular completion
          if (isRecoveryScenario && recoveryData) {
            console.log('🔄 COD RECOVERY TRACKING:', { 
              recoveryCartId: recoveryData.recoveryCartId, 
              recoveryEmail: recoveryData.recoveryEmail,
              orderData 
            });
            trackRecoveryCompletion({
              recoveryCartId: recoveryData.recoveryCartId,
              recoveryEmail: recoveryData.recoveryEmail,
              orderData
            });
          } else {
            // Only track regular checkout completion if not a recovery
            trackCompleteCheckout(orderData);
          }
          router.push(`/orders/thank-you?order_id=${generateOrderId()}`);
          return;
        } else {
          toast.success('Order placed successfully!');
          router.push('/orders/thank-you');
        }
      }
    } catch (error: unknown) {
      console.error('Error in handleNextStep:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      if (!orderSuccessful) {
        setIsLoading(false)
      }
    }
  }, [
    currentStep,
    formData,
    shippingFormData,
    sameAsBilling,
    shippingMethod,
    isLoading,
    router,
    validateBillingForm,
    validateShippingForm,
    setIsLoading,
    paymentMethod,
    session,
    cartItems,
    shippingCost,
    setOrderDetails,
    cardGateway,
    paymentFormData,
    isCodEnabled,
    codInstructions,
    codRequirePhone,
    codPhone,
    codPhoneError,
    trackCompleteCheckout,
    trackRecoveryCompletion,
    isRecoveryScenario,
    recoveryData
  ])

  // Cache the handleInputChange function
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    [setFormData]
  )

  // Cache the handleShippingInputChange function
  const handleShippingInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setShippingFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    [setShippingFormData]
  )

  // Update handlePaymentInputChange to also update refs
  const handlePaymentInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      if (name === 'expiryDate') {
        // Only allow numbers and "/"
        let cleaned = value.replace(/[^0-9/]/g, '');

        // Auto-insert "/" after two digits
        if (cleaned.length === 2 && !cleaned.includes('/')) {
          cleaned = cleaned + '/';
        }

        // If user enters MM/YY, auto-expand to MM/YYYY
        if (/^(0[1-9]|1[0-2])\/\d{2}$/.test(cleaned)) {
          const [mm, yy] = cleaned.split('/');
          cleaned = `${mm}/20${yy}`;
        }

        // Limit to MM/YYYY
        if (cleaned.length > 7) {
          cleaned = cleaned.slice(0, 7);
        }

        setPaymentFormData((prev) => ({
          ...prev,
          [name]: cleaned,
        }));
      } else {
        setPaymentFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    },
    [setPaymentFormData]
  );

  // Cache the handleReturningCustomerLogin function
  const handleReturningCustomerLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsLoading(true)
      setLoginError('')

      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setLoginError('Invalid email or password')
        } else {
          const response = await fetch('/api/auth/session')
          const data = await response.json()
          setUser(data?.user || null)
        }
      } catch (error: unknown) {
        console.log('Login error:', error)
        setLoginError('An error occurred during login')
      } finally {
        setIsLoading(false)
      }
    },
    [setUser, setIsLoading, setLoginError]
  )

  // Utility: Generate a simple order ID (for demo; use a better one in production)
  function generateOrderId() {
    return 'ORDER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Utility: Calculate subtotal
  function calculateSubtotal(items: { price: number; quantity: number }[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // Utility: Calculate tax (example: 8%)
  function calculateTax(items: { price: number; quantity: number }[]): number {
    return Math.round(calculateSubtotal(items) * 0.08 * 100) / 100;
  }

  // Utility: Calculate total
  function calculateTotal(items: { price: number; quantity: number }[], shippingCost: number): number {
    return Math.round((calculateSubtotal(items) + calculateTax(items) + shippingCost) * 100) / 100;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      {/* Returning Customer Section - Responsive */}
      {!session?.user && (
        <div className='mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl bg-white border border-gray-200'>
          <button
            type='button'
            onClick={() => setIsReturningCustomerOpen(!isReturningCustomerOpen)}
            className='group flex items-center justify-between w-full text-left'
          >
            <span className='text-sm font-medium text-gray-900 group-hover:text-black transition-colors duration-300'>
              Returning customer? Click to login
            </span>
            {isReturningCustomerOpen ? (
              <ChevronUpIcon className='ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-black transition-colors duration-300' />
            ) : (
              <ChevronDownIcon className='ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-black transition-colors duration-300' />
            )}
          </button>

          <AnimatePresence>
            {isReturningCustomerOpen && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='mt-4 space-y-3 overflow-hidden'
                onSubmit={handleReturningCustomerLogin}
              >
                <div className='space-y-1'>
                  <label
                    htmlFor='email'
                    className='block text-xs font-medium text-gray-700'
                  >
                    Email address
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm transition-all duration-300 px-3 py-2 text-sm'
                    placeholder='your@email.com'
                    required
                  />
                </div>
                <div className='space-y-1'>
                  <label
                    htmlFor='password'
                    className='block text-xs font-medium text-gray-700'
                  >
                    Password
                  </label>
                  <input
                    type='password'
                    id='password'
                    name='password'
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm transition-all duration-300 px-3 py-2 text-sm'
                    placeholder='••••••••'
                    required
                  />
                </div>
                {loginError && (
                  <p className='text-sm text-red-600'>{loginError}</p>
                )}
                <div className='pt-1'>
                  <button
                    type='submit'
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 ${
                      isLoading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800 hover:shadow-md'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Progress Steps - Responsive */}
      <div className='mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-white border border-gray-200'>
        <ol className='flex items-center justify-between'>
          {steps.map((step, index) => {
            const isCurrent = currentStep === step
            const isPast = steps.indexOf(currentStep) > index
            const isLast = index === steps.length - 1

            return (
              <li
                key={step}
                className={`relative flex-1 ${isLast ? 'flex-none' : ''}`}
              >
                <div className='group flex flex-col items-center'>
                  <div className='flex items-center'>
                    <span
                      className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all duration-300 ${
                        isPast
                          ? 'bg-black shadow-md'
                          : isCurrent
                          ? 'bg-white border-2 border-black'
                          : 'bg-gray-100 border-2 border-gray-300'
                      }`}
                    >
                      {isPast ? (
                        <CheckIcon className='h-3 w-3 sm:h-4 sm:w-4 text-white' />
                      ) : (
                        <span
                          className={`block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                            isCurrent ? 'bg-black' : 'bg-gray-400'
                          }`}
                        />
                      )}
                    </span>
                    {!isLast && (
                      <div
                        className={`hidden sm:block h-0.5 mx-2 flex-1 transition-all duration-500 ${
                          isPast ? 'bg-black' : 'bg-gray-200'
                        }`}
                        style={{ width: '40px' }}
                      />
                    )}
                  </div>
                  <span
                    className={`mt-1 sm:mt-2 text-xs font-medium tracking-wide transition-all duration-300 ${
                      isPast
                        ? 'text-black'
                        : isCurrent
                        ? 'text-black font-semibold'
                        : 'text-gray-500'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Step Content - Responsive */}
      <div className='rounded-xl bg-white p-4 sm:p-6 border border-gray-200'>
        <AnimatePresence mode='wait'>
          {currentStep === 'Billing' && (
            <motion.div
              key='billing'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {!session?.user && (
                <div className='space-y-3 sm:space-y-4'>
                  <h2 className='text-base sm:text-lg font-bold text-gray-900'>
                    Contact Information
                  </h2>
                  <div className='grid grid-cols-1 gap-3 sm:gap-4'>
                    <div>
                      <Label htmlFor='name'>Full Name</Label>
                      <Input
                        type='text'
                        id='name'
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        type='email'
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor='password'>Password</Label>
                      <Input
                        type='password'
                        id='password'
                        name='password'
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`${
                  !session ? 'pt-3 sm:pt-4 border-t border-gray-200' : ''
                } mt-4 sm:mt-5`}
              >
                <h2 className='text-base sm:text-lg font-bold text-gray-900'>
                  Billing Address
                </h2>
                <p className='mt-1 text-xs text-gray-500'>
                  Use a permanent address where you can receive mail
                </p>
                
                {isBillingAddressLoading && (
                  <div className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                    <div className='flex items-center justify-center'>
                      <svg
                        className='animate-spin h-5 w-5 text-blue-600 mr-3'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      <span className='text-sm text-blue-700 font-medium'>
                        Loading your billing address...
                      </span>
                    </div>
                  </div>
                )}
                <form
                  id='billing-form'
                  onSubmit={(e) => e.preventDefault()}
                  className='mt-3 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2'
                >
                  <input type='hidden' name='type' value='billing' />
                  <input type='hidden' name='isDefault' value='true' />

                  <div className='sm:col-span-2'>
                    <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                      Street address*
                    </label>
                    <input
                      type='text'
                      name='street'
                      id='street'
                      value={formData.street}
                      onChange={handleInputChange}
                      disabled={isBillingAddressLoading}
                      className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3 py-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-300 ${
                        formErrors.street ? 'border-red-500' : ''
                      } ${isBillingAddressLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      required
                    />
                    {formErrors.street && (
                      <p className='mt-1 text-xs text-red-500'>
                        {formErrors.street}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                      City*
                    </label>
                    <input
                      type='text'
                      name='city'
                      id='city'
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={isBillingAddressLoading}
                      className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3 py-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-300 ${
                        formErrors.city ? 'border-red-500' : ''
                      } ${isBillingAddressLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      required
                    />
                    {formErrors.city && (
                      <p className='mt-1 text-xs text-red-500'>
                        {formErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                      State/Province*
                    </label>
                    <input
                      type='text'
                      name='state'
                      id='state'
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={isBillingAddressLoading}
                      className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3 py-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-300 ${
                        formErrors.state ? 'border-red-500' : ''
                      } ${isBillingAddressLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      required
                    />
                    {formErrors.state && (
                      <p className='mt-1 text-xs text-red-500'>
                        {formErrors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                      ZIP/Postal code*
                    </label>
                    <input
                      type='text'
                      name='postalCode'
                      id='postalCode'
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      disabled={isBillingAddressLoading}
                      className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3 py-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-300 ${
                        formErrors.postalCode ? 'border-red-500' : ''
                      } ${isBillingAddressLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      required
                    />
                    {formErrors.postalCode && (
                      <p className='mt-1 text-xs text-red-500'>
                        {formErrors.postalCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                      Country*
                    </label>
                    <input
                      type='text'
                      name='country'
                      id='country'
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={isBillingAddressLoading}
                      className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3 py-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-300 ${
                        formErrors.country ? 'border-red-500' : ''
                      } ${isBillingAddressLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      required
                    />
                    {formErrors.country && (
                      <p className='mt-1 text-xs text-red-500'>
                        {formErrors.country}
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {currentStep === 'Shipping' && (
            <motion.div
              key='shipping'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className='mb-4 sm:mb-6'>
                <h2 className='text-lg sm:text-xl font-bold text-gray-900 tracking-tight'>
                  Shipping Information
                </h2>
                <p className='mt-1 text-xs text-gray-500'>
                  Where should we deliver your order?
                </p>
              </div>

              <div className='space-y-4 sm:space-y-6'>
                <div className='flex items-center'>
                  <input
                    id='same-as-billing'
                    name='same-as-billing'
                    type='checkbox'
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                    className='h-4 w-4 rounded border-gray-200 text-black focus:ring-black'
                  />
                  <label
                    htmlFor='same-as-billing'
                    className='ml-2 block text-xs text-gray-700'
                  >
                    Same as billing address
                  </label>
                </div>

                <form id='shipping-form' className='space-y-4 sm:space-y-6'>
                  <input type='hidden' name='type' value='shipping' />
                  <input type='hidden' name='isDefault' value='true' />
                  <input
                    type='hidden'
                    name='shippingMethod'
                    value={shippingMethod}
                  />

                  <div className='space-y-3 sm:space-y-4'>
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                        Street address*
                      </label>
                      <input
                        type='text'
                        name='street'
                        value={shippingFormData.street}
                        onChange={handleShippingInputChange}
                        className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3 py-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-300 ${
                          shippingFormErrors.street ? 'border-red-500' : ''
                        }`}
                        disabled={sameAsBilling}
                        required
                      />
                      {shippingFormErrors.street && (
                        <p className='mt-1 text-xs text-red-500'>
                          {shippingFormErrors.street}
                        </p>
                      )}
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                      <div>
                        <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                          City*
                        </label>
                        <input
                          type='text'
                          name='city'
                          value={shippingFormData.city}
                          onChange={handleShippingInputChange}
                          className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3 py-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-300 ${
                            shippingFormErrors.city ? 'border-red-500' : ''
                          }`}
                          disabled={sameAsBilling}
                          required
                        />
                        {shippingFormErrors.city && (
                          <p className='mt-1 text-xs text-red-500'>
                            {shippingFormErrors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                          State/Province*
                        </label>
                        <input
                          type='text'
                          name='state'
                          value={shippingFormData.state}
                          onChange={handleShippingInputChange}
                          className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3 py-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-300 ${
                            shippingFormErrors.state ? 'border-red-500' : ''
                          }`}
                          disabled={sameAsBilling}
                          required
                        />
                        {shippingFormErrors.state && (
                          <p className='mt-1 text-xs text-red-500'>
                            {shippingFormErrors.state}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                      <div>
                        <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                          ZIP/Postal code*
                        </label>
                        <input
                          type='text'
                          name='postalCode'
                          value={shippingFormData.postalCode}
                          onChange={handleShippingInputChange}
                          className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3 py-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-300 ${
                            shippingFormErrors.postalCode ? 'border-red-500' : ''
                          }`}
                          disabled={sameAsBilling}
                          required
                        />
                        {shippingFormErrors.postalCode && (
                          <p className='mt-1 text-xs text-red-500'>
                            {shippingFormErrors.postalCode}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                          Country*
                        </label>
                        <input
                          type='text'
                          name='country'
                          value={shippingFormData.country}
                          onChange={handleShippingInputChange}
                          className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3 py-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-300 ${
                            shippingFormErrors.country ? 'border-red-500' : ''
                          }`}
                          disabled={sameAsBilling}
                          required
                        />
                        {shippingFormErrors.country && (
                          <p className='mt-1 text-xs text-red-500'>
                            {shippingFormErrors.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Methods - Responsive */}
                  <div className='space-y-3 sm:space-y-4'>
                    <h3 className='text-sm sm:text-base font-medium text-gray-900'>
                      Shipping Method
                    </h3>
                    <div className='space-y-2 sm:space-y-3'>
                      {shippingMethods.map((method) => (
                        <label
                          key={method.id}
                          className='relative flex items-start p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-black transition-colors duration-300 cursor-pointer'
                        >
                          <input
                            type='radio'
                            name='shipping-method'
                            value={method.id}
                            checked={shippingMethod === method.id}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className='mt-1 h-4 w-4 text-black focus:ring-black'
                          />
                          <div className='ml-3 flex-1'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm font-medium text-gray-900'>
                                {method.name}
                              </span>
                              <span className='text-sm font-medium text-gray-900'>
                                ${Number(method.price).toFixed(2)}
                              </span>
                            </div>
                            <p className='mt-1 text-xs text-gray-500'>
                              {method.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {currentStep === 'Payment' && (
            <motion.div
              key='payment'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className='mb-4 sm:mb-6'>
                <h2 className='text-lg sm:text-xl font-bold text-gray-900 tracking-tight'>
                  Payment Information
                </h2>
                <p className='mt-1 text-xs text-gray-500'>
                  Choose your preferred payment method
                </p>
                {/* No warning messages for disabled payment methods */}
              </div>

              <div className='space-y-4 sm:space-y-6'>
                <div className='space-y-3 sm:space-y-4'>
                  <h3 className='text-sm sm:text-base font-medium text-gray-900'>
                    Payment Method
                  </h3>

                  <div className='space-y-3 sm:space-y-4'>
                    {!isCardEnabled && !isPayPalEnabled && (
                      <div className='p-4 rounded-xl bg-red-50 border border-red-200'>
                        <p className='text-sm text-red-800'>
                          No payment methods are currently enabled. Please contact support.
                        </p>
                      </div>
                    )}
                    {isCardEnabled && (
                      <label className="block cursor-pointer group">
                        <div className={`relative p-4 sm:p-5 rounded-xl bg-white border transition-all duration-300
                          peer-checked:border-yellow-500 peer-checked:shadow-lg
                          group-hover:border-yellow-400 group-hover:shadow-md
                          ${paymentMethod === 'credit-card' ? 'border-yellow-500 shadow-lg scale-[1.03]' : 'border-gray-200'}`}
                        >
                          <input
                            type="radio"
                            id="credit-card"
                            name="payment-method"
                            checked={paymentMethod === 'credit-card'}
                            onChange={() => setPaymentMethod('credit-card')}
                            className="peer absolute top-4 sm:top-5 right-4 sm:right-5 h-5 w-5 opacity-0 z-10 cursor-pointer"
                          />
                          <span className={`absolute top-4 sm:top-5 right-4 sm:right-5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
                            ${paymentMethod === 'credit-card' ? 'border-yellow-500 bg-yellow-100 shadow-lg' : 'border-gray-300 bg-white'}
                            group-hover:border-yellow-400`}
                          >
                            {paymentMethod === 'credit-card' && (
                              <span className="block w-3 h-3 rounded-full bg-yellow-500 shadow-inner"></span>
                            )}
                          </span>
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <span className="text-sm font-medium text-gray-900">Credit Card</span>
                          </div>
                          {cardGateway === 'paypal-commerce' ? (
                            <PayPalCardForm
                              ref={payPalCardFormRef}
                              onCardDetails={(cardDetails) => {
                                setPaymentFormData({
                                  cardNumber: cardDetails.cardNumber,
                                  expiryDate: `${cardDetails.expiryMonth}/${cardDetails.expiryYear}`,
                                  cvc: cardDetails.cvc,
                                  nameOnCard: cardDetails.nameOnCard
                                })
                              }}
                              onError={(error) => toast.error(error)}
                              disabled={isLoading}
                            />
                          ) : cardGateway === 'authorize' ? (
                            <AuthorizeCardForm
                              ref={authorizeCardFormRef}
                              onCardDetails={(cardDetails) => {
                                setPaymentFormData({
                                  cardNumber: cardDetails.cardNumber,
                                  expiryDate: `${cardDetails.expiryMonth}/${cardDetails.expiryYear}`,
                                  cvc: cardDetails.cvc,
                                  nameOnCard: cardDetails.nameOnCard
                                })
                              }}
                              onError={(error) => toast.error(error)}
                              disabled={isLoading}
                            />
                          ) : cardGateway === 'square' ? (
                            squareCredentials ? (
                              <SquareCardForm
                                ref={squareCardFormRef}
                                onCardDetails={(cardDetails) => {
                                  setPaymentFormData({
                                    cardNumber: cardDetails.cardNumber,
                                    expiryDate: `${cardDetails.expiryMonth}/${cardDetails.expiryYear}`,
                                    cvc: cardDetails.cvc,
                                    nameOnCard: cardDetails.nameOnCard
                                  })
                                }}
                                onError={(error) => toast.error(error)}
                                disabled={isLoading}
                              />
                            ) : (
                              <div className="p-4 text-center text-red-500 border border-red-200 rounded-lg">
                                <p className="font-medium">Square credentials not configured</p>
                                <p className="text-sm mt-1">Please configure Square credentials in the admin panel</p>
                              </div>
                            )
                          ) : (
                            <StripeCardForm
                              ref={stripeCardFormRef}
                              onCardDetails={(cardDetails) => {
                                setPaymentFormData({
                                  cardNumber: cardDetails.cardNumber,
                                  expiryDate: `${cardDetails.expiryMonth}/${cardDetails.expiryYear}`,
                                  cvc: cardDetails.cvc,
                                  nameOnCard: cardDetails.nameOnCard
                                })
                              }}
                              onError={(error) => toast.error(error)}
                              disabled={isLoading}
                            />
                          )}
                          <div className='mt-3 sm:mt-4 flex space-x-2 sm:space-x-3'>
                            <Image
                              src='/images/checkout/visa.svg'
                              alt='Visa'
                              width={40}
                              height={25}
                              className='h-4 w-auto sm:h-5 opacity-80 hover:opacity-100 transition-opacity'
                            />

                            <Image
                              src='/images/checkout/mastercard.svg'
                              alt='mastercard'
                              width={40}
                              height={25}
                              className='h-4 w-auto sm:h-5 opacity-80 hover:opacity-100 transition-opacity'
                            />

                            <Image
                              src='/images/checkout/amex.svg'
                              alt='amex'
                              width={40}
                              height={25}
                              className='h-4 w-auto sm:h-5 opacity-80 hover:opacity-100 transition-opacity'
                            />
                          </div>
                        </div>
                      </label>
                    )}
                    {isPayPalEnabled && (
                      <label className="block cursor-pointer group">
                        <div className={`relative p-4 sm:p-5 rounded-xl bg-white border transition-all duration-300
                          peer-checked:border-blue-500 peer-checked:shadow-lg
                          group-hover:border-blue-400 group-hover:shadow-md
                          ${paymentMethod === 'paypal' ? 'border-blue-500 shadow-lg scale-[1.03]' : 'border-gray-200'}`}
                        >
                          <input
                            type="radio"
                            id="paypal"
                            name="payment-method"
                            checked={paymentMethod === 'paypal'}
                            onChange={() => setPaymentMethod('paypal')}
                            className="peer absolute top-4 sm:top-5 right-4 sm:right-5 h-5 w-5 opacity-0 z-10 cursor-pointer"
                          />
                          <span className={`absolute top-4 sm:top-5 right-4 sm:right-5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
                            ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-100 shadow-lg' : 'border-gray-300 bg-white'}
                            group-hover:border-blue-400`}
                          >
                            {paymentMethod === 'paypal' && (
                              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                            )}
                          </span>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="block text-sm font-medium text-gray-900">PayPal</span>
                              <span className="block text-xs text-gray-500 mt-1">Pay securely with your PayPal account</span>
                            </div>
                            <Image src='/images/checkout/paypal.png' alt='PayPal' width={80} height={20} className='h-4 w-auto sm:h-5 opacity-80 hover:opacity-100 transition-opacity' />
                          </div>
                        </div>
                      </label>
                    )}
                    {isKlarnaEnabled && (
                      <label className="block cursor-pointer group">
                        <div className={`relative p-4 sm:p-5 rounded-xl bg-white border transition-all duration-300
                          peer-checked:border-pink-500 peer-checked:shadow-lg
                          group-hover:border-pink-400 group-hover:shadow-md
                          ${paymentMethod === 'klarna' ? 'border-pink-500 shadow-lg scale-[1.03]' : 'border-gray-200'}`}
                        >
                          <input
                            type="radio"
                            id="klarna"
                            name="payment-method"
                            checked={paymentMethod === 'klarna'}
                            onChange={() => setPaymentMethod('klarna')}
                            className="peer absolute top-4 sm:top-5 right-4 sm:right-5 h-5 w-5 opacity-0 z-10 cursor-pointer"
                          />
                          <span className={`absolute top-4 sm:top-5 right-4 sm:right-5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
                            ${paymentMethod === 'klarna' ? 'border-pink-500 bg-pink-100 shadow-lg' : 'border-gray-300 bg-white'}
                            group-hover:border-pink-400`}
                          >
                            {paymentMethod === 'klarna' && (
                              <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                            )}
                          </span>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="block text-sm font-medium text-pink-700">Klarna</span>
                              <span className="block text-xs mt-1 text-pink-500">Buy now, pay later with Klarna</span>
                            </div>
                            <span className="ml-4 px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">Klarna</span>
                          </div>
                        </div>
                      </label>
                    )}
                    {isCodEnabled && (
                      <label className="block cursor-pointer group">
                        <div className={`relative p-4 sm:p-5 rounded-xl bg-white border transition-all duration-300
                          peer-checked:border-green-600 peer-checked:shadow-lg
                          group-hover:border-green-400 group-hover:shadow-md
                          ${paymentMethod === 'cod' ? 'border-green-600 shadow-lg scale-[1.03]' : 'border-gray-200'}`}
                        >
                          <input
                            type="radio"
                            id="cod"
                            name="payment-method"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            className="peer absolute top-4 sm:top-5 right-4 sm:right-5 h-5 w-5 opacity-0 z-10 cursor-pointer"
                          />
                          <span className={`absolute top-4 sm:top-5 right-4 sm:right-5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
                            ${paymentMethod === 'cod' ? 'border-green-600 bg-green-100 shadow-lg' : 'border-gray-300 bg-white'}
                            group-hover:border-green-400`}
                          >
                            {paymentMethod === 'cod' && (
                              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                            )}
                          </span>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="block text-sm font-medium text-green-700">Cash on Delivery (COD)</span>
                              <span className="block text-xs mt-1 text-green-500">Pay with cash when your order is delivered</span>
                            </div>
                            <span className="ml-4 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">COD</span>
                          </div>
                          {paymentMethod === 'cod' && codInstructions && (
                            <div className="mt-3 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">{codInstructions}</div>
                          )}
                          {paymentMethod === 'cod' && codRequirePhone && (
                            <div className="mt-3">
                              <label htmlFor="cod-phone" className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number (required for COD)</label>
                              <input
                                type="tel"
                                id="cod-phone"
                                name="cod-phone"
                                value={codPhone}
                                onChange={e => {
                                  setCodPhone(e.target.value);
                                  setCodPhoneError('');
                                }}
                                className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-600 focus:ring-green-600 text-sm px-3 py-2.5 transition-all duration-300 ${codPhoneError ? 'border-red-500' : ''}`}
                                placeholder="e.g. +1 555 123 4567"
                                required
                              />
                              {codPhoneError && <p className="mt-1 text-xs text-red-500">{codPhoneError}</p>}
                            </div>
                          )}
                        </div>
                      </label>
                    )}
                  </div>

                  <div className='rounded-xl bg-gray-50 p-3 sm:p-4 border border-gray-200'>
                    <div className='flex items-start'>
                      <div className='flex-shrink-0 p-1.5 bg-gray-200 rounded-lg'>
                        <LockClosedIcon className='h-3 w-3 sm:h-4 sm:w-4 text-gray-700' />
                      </div>
                      <div className='ml-3'>
                        <h3 className='text-xs font-medium text-gray-800'>
                          Secure payment
                        </h3>
                        <p className='mt-1 text-xs text-gray-600'>
                          Your payment information is processed securely. We do
                          not store credit card details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons - Responsive */}
        <div className='mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0'>
          <button
            type='button'
            onClick={() => {
              if (currentStep === 'Payment') setCurrentStep('Shipping')
              else if (currentStep === 'Shipping') setCurrentStep('Billing')
            }}
            className={`flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 ${
              currentStep === 'Billing' ? 'invisible' : ''
            }`}
          >
            <ArrowLeftIcon className='w-4 h-4 mr-2' />
            Back
          </button>

          <div
            className='relative inline-block w-full sm:w-auto'
            onMouseEnter={() => {
              if (currentStep === 'Payment' && paymentMethod === 'credit-card' && !isCardEnabled) setShowTooltip(true)
            }}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button
              type='button'
              onClick={handleNextStep}
              disabled={isLoading || isBillingAddressLoading || (currentStep === 'Payment' && paymentMethod === 'credit-card' && !isCardEnabled)}
              className='w-full sm:w-auto flex items-center justify-center bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed relative'
            >
              {isLoading ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : currentStep === 'Payment' ? (
                'Place Order'
              ) : (
                'Next'
              )}
            </button>
            {/* Tooltip for disabled payment methods */}
            {showTooltip && currentStep === 'Payment' && paymentMethod === 'credit-card' && !isCardEnabled && (
              <span className='absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-3 py-1 shadow-lg z-10 whitespace-nowrap'>
                Credit/Debit Card is currently disabled. Please use PayPal.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
