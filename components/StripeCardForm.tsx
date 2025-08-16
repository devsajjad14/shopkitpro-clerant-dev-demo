'use client'

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StripeCardFormProps {
  onCardDetails: (cardDetails: {
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvc: string
    nameOnCard: string
  }) => void
  onError?: (error: string) => void
  disabled?: boolean
}

export interface StripeCardFormRef {
  getCardDetails: () => {
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvc: string
    nameOnCard: string
  } | null
}

const StripeCardForm = forwardRef<StripeCardFormRef, StripeCardFormProps>(({ 
  onCardDetails, 
  onError,
  disabled = false 
}, ref) => {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cvc, setCvc] = useState('')
  const [nameOnCard, setNameOnCard] = useState('')
  const [lastValidatedData, setLastValidatedData] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [focusedField, setFocusedField] = useState<string>('')
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Expose current card details to parent component
  useImperativeHandle(ref, () => ({
    getCardDetails: () => {
      if (cardNumber && expiryMonth && expiryYear && cvc && nameOnCard) {
        const cleanCardNumber = cardNumber.replace(/\s/g, '')
        if (/^\d{13,19}$/.test(cleanCardNumber) && 
            /^\d{2}$/.test(expiryMonth) && 
            /^\d{4}$/.test(expiryYear) && 
            /^\d{3,4}$/.test(cvc)) {
          return {
            cardNumber: cleanCardNumber,
            expiryMonth,
            expiryYear,
            cvc,
            nameOnCard
          }
        }
      }
      return null
    }
  }), [cardNumber, expiryMonth, expiryYear, cvc, nameOnCard])

  // Clear validation errors when user starts typing
  const clearErrors = () => {
    setValidationErrors([])
  }

  // Memoize the validation function to prevent infinite loops
  const validateAndSendCardDetails = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a timeout to validate after user stops typing
    timeoutRef.current = setTimeout(() => {
      const errors: string[] = []

      if (cardNumber && expiryMonth && expiryYear && cvc && nameOnCard) {
        // More flexible card number validation for Stripe
        const cleanCardNumber = cardNumber.replace(/\s/g, '')
        if (!/^\d{13,19}$/.test(cleanCardNumber)) {
          errors.push('Please enter a valid card number')
        }

        if (!/^\d{2}$/.test(expiryMonth) || !/^\d{4}$/.test(expiryYear)) {
          errors.push('Please enter a valid expiry date')
        }

        if (!/^\d{3,4}$/.test(cvc)) {
          errors.push('Please enter a valid CVC')
        }

        // Only proceed if no validation errors
        if (errors.length === 0) {
          // Create a unique key for the current card data
          const currentData = `${cleanCardNumber}-${expiryMonth}-${expiryYear}-${cvc}-${nameOnCard}`
          
          // Only send if data has changed
          if (currentData !== lastValidatedData) {
            setLastValidatedData(currentData)
            
            // Send card details to parent component
            onCardDetails({
              cardNumber: cleanCardNumber,
              expiryMonth,
              expiryYear,
              cvc,
              nameOnCard
            })
          }
        }
      }

      // Update validation errors
      setValidationErrors(errors)
      
      // Show first error if any
      if (errors.length > 0) {
        onError?.(errors[0])
      }
    }, 500) // 500ms delay after user stops typing
  }, [cardNumber, expiryMonth, expiryYear, cvc, nameOnCard, lastValidatedData, onCardDetails, onError])

  // Use useEffect with proper dependencies
  useEffect(() => {
    validateAndSendCardDetails()
  }, [validateAndSendCardDetails])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    
    // Handle different card number lengths
    if (v.length <= 4) {
      return v
    } else if (v.length <= 8) {
      return v.substring(0, 4) + ' ' + v.substring(4)
    } else if (v.length <= 12) {
      return v.substring(0, 4) + ' ' + v.substring(4, 8) + ' ' + v.substring(8)
    } else if (v.length <= 16) {
      return v.substring(0, 4) + ' ' + v.substring(4, 8) + ' ' + v.substring(8, 12) + ' ' + v.substring(12)
    } else {
      // For longer card numbers (like some test cards)
      return v.substring(0, 4) + ' ' + v.substring(4, 8) + ' ' + v.substring(8, 12) + ' ' + v.substring(12, 16) + ' ' + v.substring(16)
    }
  }

  const getCardType = (number: string) => {
    const clean = number.replace(/\s/g, '')
    if (/^4/.test(clean)) return 'visa'
    if (/^5[1-5]/.test(clean)) return 'mastercard'
    if (/^3[47]/.test(clean)) return 'amex'
    if (/^6/.test(clean)) return 'discover'
    return 'generic'
  }

  const cardType = getCardType(cardNumber)

  return (
    <div className="space-y-6">
      {/* Premium Card Preview */}
      <motion.div 
        className="relative h-48 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl p-6 text-white overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        {/* Card content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full"></div>
              </div>
              <span className="text-sm font-medium opacity-80">Premium Card</span>
            </div>
            <div className="flex items-center space-x-2">
              {cardType === 'visa' && (
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">VISA</span>
                </div>
              )}
              {cardType === 'mastercard' && (
                <div className="w-12 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">MC</span>
                </div>
              )}
              {cardType === 'amex' && (
                <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AMEX</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-mono tracking-wider">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs opacity-60 mb-1">CARD HOLDER</div>
                <div className="text-sm font-medium">
                  {nameOnCard || 'YOUR NAME'}
                </div>
              </div>
              <div>
                <div className="text-xs opacity-60 mb-1">EXPIRES</div>
                <div className="text-sm font-medium">
                  {(expiryMonth && expiryYear) ? `${expiryMonth}/${expiryYear.slice(-2)}` : 'MM/YY'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Form Fields */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(formatCardNumber(e.target.value))
                clearErrors()
              }}
              onFocus={() => setFocusedField('cardNumber')}
              onBlur={() => setFocusedField('')}
              className={`block w-full rounded-xl border-2 shadow-sm text-lg px-4 py-4 transition-all duration-300 font-mono ${
                focusedField === 'cardNumber' 
                  ? 'border-purple-500 shadow-purple-100 bg-purple-50' 
                  : 'border-gray-200 focus:border-purple-500 focus:shadow-purple-100 focus:bg-purple-50'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="0000 0000 0000 0000"
              maxLength={25}
              disabled={disabled}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-1">
                <div className="w-6 h-4 bg-indigo-600 rounded-sm"></div>
                <div className="w-6 h-4 bg-purple-500 rounded-sm"></div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Name on Card
          </label>
          <input
            type="text"
            value={nameOnCard}
            onChange={(e) => {
              setNameOnCard(e.target.value)
              clearErrors()
            }}
            onFocus={() => setFocusedField('nameOnCard')}
            onBlur={() => setFocusedField('')}
            className={`block w-full rounded-xl border-2 shadow-sm text-lg px-4 py-4 transition-all duration-300 ${
              focusedField === 'nameOnCard' 
                ? 'border-purple-500 shadow-purple-100 bg-purple-50' 
                : 'border-gray-200 focus:border-purple-500 focus:shadow-purple-100 focus:bg-purple-50'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="John Smith"
            disabled={disabled}
          />
        </motion.div>
        
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="col-span-1"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Month
            </label>
            <input
              type="text"
              value={expiryMonth}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                setExpiryMonth(value)
                clearErrors()
              }}
              onFocus={() => setFocusedField('expiryMonth')}
              onBlur={() => setFocusedField('')}
              className={`block w-full rounded-xl border-2 shadow-sm text-lg px-4 py-4 text-center transition-all duration-300 ${
                focusedField === 'expiryMonth' 
                  ? 'border-purple-500 shadow-purple-100 bg-purple-50' 
                  : 'border-gray-200 focus:border-purple-500 focus:shadow-purple-100 focus:bg-purple-50'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="MM"
              maxLength={2}
              disabled={disabled}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="col-span-1"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Year
            </label>
            <input
              type="text"
              value={expiryYear}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                setExpiryYear(value)
                clearErrors()
              }}
              onFocus={() => setFocusedField('expiryYear')}
              onBlur={() => setFocusedField('')}
              className={`block w-full rounded-xl border-2 shadow-sm text-lg px-4 py-4 text-center transition-all duration-300 ${
                focusedField === 'expiryYear' 
                  ? 'border-purple-500 shadow-purple-100 bg-purple-50' 
                  : 'border-gray-200 focus:border-purple-500 focus:shadow-purple-100 focus:bg-purple-50'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="YYYY"
              maxLength={4}
              disabled={disabled}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="col-span-1"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CVC
            </label>
            <input
              type="text"
              value={cvc}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                setCvc(value)
                clearErrors()
              }}
              onFocus={() => setFocusedField('cvc')}
              onBlur={() => setFocusedField('')}
              className={`block w-full rounded-xl border-2 shadow-sm text-lg px-4 py-4 text-center transition-all duration-300 ${
                focusedField === 'cvc' 
                  ? 'border-purple-500 shadow-purple-100 bg-purple-50' 
                  : 'border-gray-200 focus:border-purple-500 focus:shadow-purple-100 focus:bg-purple-50'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="123"
              maxLength={4}
              disabled={disabled}
            />
          </motion.div>
        </div>
      </div>

      {/* Validation Errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {validationErrors.map((error, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-2 text-red-600 text-sm"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{error}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex items-center justify-center space-x-2 text-gray-500 text-sm"
      >
        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <span>Secure payment powered by Stripe</span>
      </motion.div>
    </div>
  )
})

StripeCardForm.displayName = 'StripeCardForm'

export default StripeCardForm 