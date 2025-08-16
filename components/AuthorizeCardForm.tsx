import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

export interface AuthorizeCardFormRef {
  getCardDetails: () => {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    nameOnCard: string;
  } | null;
}

interface AuthorizeCardFormProps {
  onCardDetails: (cardDetails: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    nameOnCard: string;
  }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const AuthorizeCardForm = forwardRef<AuthorizeCardFormRef, AuthorizeCardFormProps>(({ onCardDetails, onError, disabled = false }, ref) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string>('');
  const [cvcTouched, setCvcTouched] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useImperativeHandle(ref, () => ({
    getCardDetails: () => {
      if (cardNumber && expiryMonth && expiryYear && cvc && nameOnCard) {
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (/^\d{13,19}$/.test(cleanCardNumber) && /^\d{2}$/.test(expiryMonth) && /^\d{4}$/.test(expiryYear) && /^\d{3,4}$/.test(cvc)) {
          return { cardNumber: cleanCardNumber, expiryMonth, expiryYear, cvc, nameOnCard };
        }
      }
      return null;
    }
  }), [cardNumber, expiryMonth, expiryYear, cvc, nameOnCard]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const errors: string[] = [];
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      // Only validate if all fields are filled
      if (cardNumber && expiryMonth && expiryYear && cvc && nameOnCard) {
        if (!/^\d{13,19}$/.test(cleanCardNumber)) {
          errors.push('Please enter a valid card number');
        }
        if (!/^\d{2}$/.test(expiryMonth) || !/^\d{4}$/.test(expiryYear)) {
          errors.push('Please enter a valid expiry date');
        }
        if ((!/^\d{3,4}$/.test(cvc)) && cvcTouched) {
          errors.push('Please enter a valid CVC');
        }
      }
      setValidationErrors(errors);
      if (errors.length > 0 && (cvcTouched || focusedField !== 'cvc')) onError?.(errors[0]);
      if (cardNumber && expiryMonth && expiryYear && cvc && nameOnCard && errors.length === 0) {
        onCardDetails({ cardNumber: cleanCardNumber, expiryMonth, expiryYear, cvc, nameOnCard });
      }
    }, 400);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [cardNumber, expiryMonth, expiryYear, cvc, nameOnCard, onCardDetails, onError, cvcTouched, focusedField]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length <= 4) return v;
    if (v.length <= 8) return v.substring(0, 4) + ' ' + v.substring(4);
    if (v.length <= 12) return v.substring(0, 4) + ' ' + v.substring(4, 8) + ' ' + v.substring(8);
    if (v.length <= 16) return v.substring(0, 4) + ' ' + v.substring(4, 8) + ' ' + v.substring(8, 12) + ' ' + v.substring(12);
    return v.substring(0, 4) + ' ' + v.substring(4, 8) + ' ' + v.substring(8, 12) + ' ' + v.substring(12, 16) + ' ' + v.substring(16);
  };

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
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-mono tracking-wider">{cardNumber || '•••• •••• •••• ••••'}</div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs opacity-60 mb-1">CARD HOLDER</div>
                <div className="text-sm font-medium">{nameOnCard || 'YOUR NAME'}</div>
              </div>
              <div>
                <div className="text-xs opacity-60 mb-1">EXPIRES</div>
                <div className="text-sm font-medium">{(expiryMonth && expiryYear) ? `${expiryMonth}/${expiryYear.slice(-2)}` : 'MM/YY'}</div>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              onFocus={() => setFocusedField('cardNumber')}
              onBlur={() => setFocusedField('')}
              disabled={disabled}
              maxLength={24}
              className={`block w-full rounded-xl border-2 shadow-sm text-lg px-4 py-4 transition-all duration-300 font-mono ${focusedField === 'cardNumber' ? 'border-purple-500 shadow-purple-100 bg-purple-50' : 'border-gray-200 focus:border-purple-500 focus:shadow-purple-100 focus:bg-purple-50'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="1234 5678 9012 3456"
              autoComplete="cc-number"
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Name on Card</label>
          <input
            type="text"
            value={nameOnCard}
            onChange={e => setNameOnCard(e.target.value)}
            onFocus={() => setFocusedField('nameOnCard')}
            onBlur={() => setFocusedField('')}
            disabled={disabled}
            maxLength={32}
            className={`block w-full rounded-xl border-2 shadow-sm text-lg px-4 py-4 transition-all duration-300 ${focusedField === 'nameOnCard' ? 'border-purple-500 shadow-purple-100 bg-purple-50' : 'border-gray-200 focus:border-purple-500 focus:shadow-purple-100 focus:bg-purple-50'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Name on card"
            autoComplete="cc-name"
          />
        </motion.div>
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="col-span-1"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
            <input
              type="text"
              value={expiryMonth}
              onChange={e => setExpiryMonth(e.target.value.replace(/[^0-9]/g, '').slice(0,2))}
              onFocus={() => setFocusedField('expiryMonth')}
              onBlur={() => setFocusedField('')}
              disabled={disabled}
              maxLength={2}
              className={`block w-full rounded-xl border-2 shadow-sm text-lg px-4 py-4 text-center transition-all duration-300 ${focusedField === 'expiryMonth' ? 'border-purple-500 shadow-purple-100 bg-purple-50' : 'border-gray-200 focus:border-purple-500 focus:shadow-purple-100 focus:bg-purple-50'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="MM"
              autoComplete="cc-exp-month"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="col-span-1"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
            <input
              type="text"
              value={expiryYear}
              onChange={e => setExpiryYear(e.target.value.replace(/[^0-9]/g, '').slice(0,4))}
              onFocus={() => setFocusedField('expiryYear')}
              onBlur={() => setFocusedField('')}
              disabled={disabled}
              maxLength={4}
              className={`block w-full rounded-xl border-2 shadow-sm text-lg px-4 py-4 text-center transition-all duration-300 ${focusedField === 'expiryYear' ? 'border-purple-500 shadow-purple-100 bg-purple-50' : 'border-gray-200 focus:border-purple-500 focus:shadow-purple-100 focus:bg-purple-50'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="YYYY"
              autoComplete="cc-exp-year"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="col-span-1"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">CVC</label>
            <input
              type="text"
              value={cvc}
              onChange={e => setCvc(e.target.value.replace(/[^0-9]/g, '').slice(0,4))}
              onFocus={() => setFocusedField('cvc')}
              onBlur={() => { setFocusedField(''); setCvcTouched(true); }}
              disabled={disabled}
              maxLength={4}
              className={`block w-full rounded-xl border-2 shadow-sm text-lg px-4 py-4 text-center transition-all duration-300 ${focusedField === 'cvc' ? 'border-purple-500 shadow-purple-100 bg-purple-50' : 'border-gray-200 focus:border-purple-500 focus:shadow-purple-100 focus:bg-purple-50'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="CVC"
              autoComplete="cc-csc"
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
        <span>Secure payment powered by <span className="font-semibold text-indigo-700">Authorize.Net</span></span>
      </motion.div>
    </div>
  )
})

AuthorizeCardForm.displayName = 'AuthorizeCardForm'

export default AuthorizeCardForm 