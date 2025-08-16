'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FiCreditCard,
  FiDollarSign,
  FiShoppingBag,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiSettings,
  FiZap,
  FiShield,
  FiLock,
  FiGlobe,
  FiSmartphone,
  FiAlertCircle,
  FiInfo,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheck,
  FiChevronUp,
  FiChevronDown,
  FiArrowLeft,
  FiBarChart2,
  FiActivity,
  FiTarget,
  FiTrendingUp,
  FiUserCheck,
  FiX,
  FiRefreshCw,
  FiDownload,
  FiUsers,
  FiMessageSquare,
  FiPhone,
  FiStar,
} from 'react-icons/fi'
import { useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface PaymentGateway {
  id: string
  name: string
  fields: string[]
  supportsDigitalWallets: boolean
  description?: string // Add description property
}

const paymentGateways: PaymentGateway[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    fields: ['Publishable Key', 'Secret Key'],
    supportsDigitalWallets: true,
  },
  {
    id: 'square',
    name: 'Square',
    fields: ['Application ID', 'Access Token', 'Location ID'],
    supportsDigitalWallets: false,
  },
  {
    id: 'authorize',
    name: 'Authorize.Net',
    fields: ['API Login ID', 'Transaction Key'],
    supportsDigitalWallets: false,
  },
  {
    id: 'paypal-commerce',
    name: 'PayPal Commerce',
    fields: ['Client ID', 'Client Secret'],
    supportsDigitalWallets: true,
    // Add a custom description property
    description: 'Supports digital wallets. Your PayPal account must be enabled for card transactions (Advanced Credit and Debit Card Payments) to accept card payments.'
  },
]

export default function PaymentMethodsPage() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [cardEnabled, setCardEnabled] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState('')
  const [cardEnvironment, setCardEnvironment] = useState<'sandbox' | 'live'>('sandbox')
  const [digitalWalletsEnabled, setDigitalWalletsEnabled] = useState(false)
  const [cardConnected, setCardConnected] = useState(false)
  
  const [paypalEnabled, setPaypalEnabled] = useState(false)
  const [reuseCredentials, setReuseCredentials] = useState(false)
  const [paypalClientId, setPaypalClientId] = useState('')
  const [paypalClientSecret, setPaypalClientSecret] = useState('')
  const [paypalMode, setPaypalMode] = useState<'sandbox' | 'live'>('sandbox')
  const [paypalConnected, setPaypalConnected] = useState(false)
  
  const [klarnaEnabled, setKlarnaEnabled] = useState(false)
  const [klarnaMerchantId, setKlarnaMerchantId] = useState('')
  const [klarnaUsername, setKlarnaUsername] = useState('')
  const [klarnaPassword, setKlarnaPassword] = useState('')
  const [klarnaConnected, setKlarnaConnected] = useState(false)
  const [klarnaRegion, setKlarnaRegion] = useState<'North America' | 'Europe' | 'Oceania'>('North America');
  
  const [codEnabled, setCodEnabled] = useState(false)
  const [codInstructions, setCodInstructions] = useState('')
  const [requirePhone, setRequirePhone] = useState(false)
  
  // Card credentials state
  const [cardCredentials, setCardCredentials] = useState<Record<string, string>>({})

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Secret field visibility states
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Section expand/collapse states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    card: false,
    paypal: false,
    klarna: false,
    cod: false,
  })

  const selectedGatewayData = paymentGateways.find(g => g.id === selectedGateway)

  // Secret Input Component (moved inside so it has access to hooks)
  const SecretInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    fieldName 
  }: { 
    label: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    fieldName: string
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Label>
      <div className="relative">
        <Input
          type={showSecrets[fieldName] ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => toggleSecretVisibility(fieldName)}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {showSecrets[fieldName] ? (
              <FiEyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <FiEye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(value, fieldName)}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {copiedField === fieldName ? (
              <FiCheck className="h-4 w-4 text-green-500" />
            ) : (
              <FiCopy className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  // Sync PayPal Commerce card credentials with main PayPal credentials
  useEffect(() => {
    if (selectedGateway === 'paypal-commerce') {
      setCardCredentials(prev => ({
        ...prev,
        'Client ID': paypalClientId,
        'Client Secret': paypalClientSecret,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGateway, paypalClientId, paypalClientSecret])

  // Load existing settings on component mount
  useEffect(() => {
    loadPaymentSettings()
  }, [])

  const loadPaymentSettings = async () => {
    try {
      
      // Load payment settings (general flags)
      const response = await fetch('/api/admin/payment-settings')
      const settings = await response.json()
      
      if (settings) {
        setCardEnabled(settings.cardEnabled || false)
        setPaypalEnabled(settings.paypalEnabled || false)
        setKlarnaEnabled(settings.klarnaEnabled || false)
        setCodEnabled(settings.codEnabled || false)
        
        setKlarnaMerchantId(settings.klarnaMerchantId || '')
        setKlarnaUsername(settings.klarnaUsername || '')
        setKlarnaPassword(settings.klarnaPassword || '')
        setKlarnaConnected(settings.klarnaConnectionStatus === 'connected')
        setKlarnaRegion(settings.klarnaRegion || 'North America');
        
        setCodInstructions(settings.codInstructions || '')
        setRequirePhone(settings.codRequirePhone || false)
      }
      
      // For now, use the legacy structure from payment_settings
      // In the future, this will be replaced with the new gateway structure
      setSelectedGateway(settings.cardGateway || '')
      setCardEnvironment(settings.cardEnvironment || 'sandbox')
      setDigitalWalletsEnabled(settings.cardDigitalWalletsEnabled || false)
      setCardConnected(settings.cardConnectionStatus === 'connected')
      
      setReuseCredentials(settings.paypalReuseCredentials || false)
      setPaypalClientId(settings.paypalClientId || '')
      setPaypalClientSecret(settings.paypalClientSecret || '')
      setPaypalMode(settings.paypalMode || 'sandbox')
      setPaypalConnected(settings.paypalConnectionStatus === 'connected')
      
      // Load credentials from cardCredentials object (includes all gateways)
      if (settings.cardCredentials) {
        try {
          const credentials = typeof settings.cardCredentials === 'string' 
            ? JSON.parse(settings.cardCredentials) 
            : settings.cardCredentials
          
          setCardCredentials(credentials || {})
          
          // Set the selected gateway based on saved cardGateway setting first, then fall back to credential detection
          if (settings.cardGateway) {
            setSelectedGateway(settings.cardGateway)
          } else {
            // Fallback: detect gateway from credentials
            if (credentials['Publishable Key'] && credentials['Secret Key']) {
              setSelectedGateway('stripe')
            } else if (credentials['Application ID'] && credentials['Access Token']) {
              setSelectedGateway('square')
            } else if (credentials['API Login ID'] && credentials['Transaction Key']) {
              setSelectedGateway('authorize')
            } else if (credentials['Client ID'] && credentials['Client Secret']) {
              setSelectedGateway('paypal-commerce')
            } else {
              // No valid credentials found for any gateway
            }
          }
        } catch (error) {
          setCardCredentials({})
        }
      } else {
        setCardCredentials({})
      }
    } catch (error) {
      // Removed: console.error('Error loading payment settings:', error)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      
      // Save payment settings (including legacy fields for backward compatibility)
      const settings = {
        cardEnabled,
        cardGateway: selectedGateway, // This ensures the correct gateway is saved
        cardEnvironment,
        cardDigitalWalletsEnabled: digitalWalletsEnabled,
        cardConnectionStatus: cardConnected ? 'connected' : 'not_connected',
        cardCredentials: JSON.stringify(cardCredentials),
        
        paypalEnabled,
        paypalReuseCredentials: reuseCredentials,
        paypalClientId,
        paypalClientSecret,
        paypalMode,
        paypalConnectionStatus: paypalConnected ? 'connected' : 'not_connected',
        
        klarnaEnabled,
        klarnaMerchantId,
        klarnaUsername,
        klarnaPassword,
        klarnaConnectionStatus: klarnaConnected ? 'connected' : 'not_connected',
        klarnaRegion,
        codEnabled,
        codInstructions,
        codRequirePhone: requirePhone,
      }
      
      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save payment settings')
      }
      
      toast({
        title: 'Payment Settings Saved',
        description: 'Your payment settings have been saved successfully.',
      })
      
    } catch (error) {
      console.error('Error saving payment settings:', error)
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestCardConnection = async () => {
    if (!selectedGateway) {
      alert('Please select a payment gateway first')
      return
    }
    
    if (!selectedGatewayData) {
      alert('Invalid gateway selection')
      return
    }
    
    // Check if all required fields for the selected gateway are filled
    const requiredFields = selectedGatewayData.fields
    const missingFields = requiredFields.filter(field => !cardCredentials[field] || cardCredentials[field].trim() === '')
    
    if (selectedGateway === 'klarna') {
      if (!klarnaUsername || !klarnaPassword) {
        alert('Please enter both Klarna API Username and Password');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch('/api/checkout/test-klarna-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: klarnaUsername,
            password: klarnaPassword,
            environment: cardEnvironment === 'live' ? 'live' : 'playground'
          }),
        });
        const result = await response.json();
        if (result.success) {
          setKlarnaConnected(true);
          alert('Klarna connection test successful!');
        } else {
          setKlarnaConnected(false);
          alert(`Klarna connection test failed: ${result.message || result.error || 'Unknown error'}`);
        }
      } catch (error) {
        setKlarnaConnected(false);
        alert('Klarna connection test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    setIsLoading(true)
    try {
      
      // Filter credentials to only include relevant fields for the selected gateway
      const relevantCredentials: Record<string, string> = {}
      
      switch (selectedGateway) {
        case 'stripe':
          if (cardCredentials['Publishable Key']) relevantCredentials['Publishable Key'] = cardCredentials['Publishable Key']
          if (cardCredentials['Secret Key']) relevantCredentials['Secret Key'] = cardCredentials['Secret Key']
          break

        case 'square':
          if (cardCredentials['Application ID']) relevantCredentials['Application ID'] = cardCredentials['Application ID']
          if (cardCredentials['Access Token']) relevantCredentials['Access Token'] = cardCredentials['Access Token']
          if (cardCredentials['Location ID']) relevantCredentials['Location ID'] = cardCredentials['Location ID']
          break
        case 'authorize':
          if (cardCredentials['API Login ID']) relevantCredentials['API Login ID'] = cardCredentials['API Login ID']
          if (cardCredentials['Transaction Key']) relevantCredentials['Transaction Key'] = cardCredentials['Transaction Key']
          break
        case 'paypal-commerce':
          if (cardCredentials['Client ID']) relevantCredentials['Client ID'] = cardCredentials['Client ID']
          if (cardCredentials['Client Secret']) relevantCredentials['Client Secret'] = cardCredentials['Client Secret']
          break
      }
      
      const response = await fetch('/api/admin/test-card-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: selectedGateway,
          credentials: relevantCredentials,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setCardConnected(true)
        alert('Card gateway connection test successful!')
      } else {
        setCardConnected(false)
        const errorMessage = result.message || result.error || 'Unknown error occurred'
        alert(`Card gateway connection test failed: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Card gateway connection test error:', error)
      setCardConnected(false)
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed'
      alert(`Card gateway connection test failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSecretVisibility = (fieldName: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  const handleTestPayPalConnection = async () => {
    setIsLoading(true)
    try {
      // Test PayPal connection by making a request to the backend
      const response = await fetch('/api/admin/test-paypal-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: paypalClientId,
          clientSecret: paypalClientSecret,
          mode: paypalMode,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setPaypalConnected(true)
        alert('PayPal connection test successful!')
      } else {
        setPaypalConnected(false)
        const errorMessage = result.message || result.error || 'Unknown error occurred'
        alert(`PayPal connection test failed: ${errorMessage}`)
      }
    } catch (error) {
      console.error('PayPal connection test error:', error)
      setPaypalConnected(false)
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed'
      alert(`PayPal connection test failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()}
                  className="p-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl hover:from-[#003366] hover:to-[#002855] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-[#00437f] to-[#003366] dark:from-white dark:via-blue-200 dark:to-blue-300 bg-clip-text text-transparent">
                    Payment Settings
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Configure payment gateways and methods for your store
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-medium shadow-lg">
                  <FiCheckCircle className="h-4 w-4" />
                  Live Mode
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:shadow-md transition-all duration-300"
                >
                  <FiRefreshCw className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Grid */}
        <div className="space-y-8">
        
          {/* Credit/Debit Card Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <FiCreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Credit/Debit Card</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Process card payments securely</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={cardEnabled}
                    onChange={(e) => setCardEnabled(e.target.checked)}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('card')}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                  >
                    <div className={`transition-transform duration-300 ease-in-out ${
                      expandedSections.card ? 'rotate-180' : 'rotate-0'
                    }`}>
                      <FiChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </Button>
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedSections.card ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-8">
                  {/* Gateway Selection */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-xl border border-blue-200 dark:border-blue-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          <FiCreditCard className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Gateway Selection</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <FiSettings className="h-4 w-4 text-blue-500" />
                          Choose Your Gateway
                        </Label>
                        <div className="space-y-3">
                          {paymentGateways.map((gateway) => (
                            <div key={gateway.id} className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                              <div className="relative flex items-center space-x-3">
                                <input
                                  type="radio"
                                  id={gateway.id}
                                  name="payment-gateway"
                                  value={gateway.id}
                                  checked={selectedGateway === gateway.id}
                                  onChange={(e) => setSelectedGateway(e.target.value)}
                                  className="w-5 h-5 text-blue-600 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
                                />
                                <Label 
                                  htmlFor={gateway.id} 
                                  className="flex items-center justify-between w-full cursor-pointer p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                      <FiCreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 dark:text-white text-lg">
                                        {gateway.name}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {gateway.description || (gateway.supportsDigitalWallets ? 'Supports digital wallets' : 'Standard payment processing')}
                                      </div>
                                    </div>
                                  </div>
                                  {gateway.supportsDigitalWallets && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-medium shadow-lg">
                                      <FiSmartphone className="h-4 w-4" />
                                      Digital Wallets
                                    </div>
                                  )}
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedGateway === 'paypal-commerce' && (
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                            <div className="relative p-4 bg-blue-100/80 dark:bg-blue-900/30 backdrop-blur-xl border-2 border-blue-300 dark:border-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                                  <FiInfo className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                  <strong className="font-semibold">Important Note:</strong> The PayPal Commerce Platform card option uses the same credentials as the PayPal button above. You only need to configure them once for both services.
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Fields */}
                  {selectedGateway && selectedGatewayData && (
                    <div className="space-y-6">
                      {/* Configuration Section */}
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-green-50/80 dark:bg-green-900/20 backdrop-blur-xl border border-green-200 dark:border-green-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                              <FiSettings className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedGatewayData.name} Configuration</h3>
                          </div>
                          <div className="space-y-4">
                            {selectedGatewayData.fields.map((field) => (
                              <SecretInput
                                key={field}
                                label={field}
                                value={cardCredentials[field] || ''}
                                onChange={(value) => setCardCredentials(prev => ({
                                  ...prev,
                                  [field]: value
                                }))}
                                placeholder={`Enter your ${field.toLowerCase()}`}
                                fieldName={`card-${field.toLowerCase().replace(/\s+/g, '-')}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Environment Selection */}
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-xl border border-purple-200 dark:border-purple-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                              <FiGlobe className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Environment Settings</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                              <div className="relative">
                                <input
                                  type="radio"
                                  name="card-environment"
                                  value="sandbox"
                                  checked={cardEnvironment === 'sandbox'}
                                  onChange={(e) => setCardEnvironment(e.target.value as 'sandbox' | 'live')}
                                  className="sr-only"
                                />
                                <div className={`cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm ${
                                  cardEnvironment === 'sandbox'
                                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        cardEnvironment === 'sandbox'
                                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                          : 'bg-gray-200 dark:bg-gray-600'
                                      }`}>
                                        <FiSettings className={`h-4 w-4 ${
                                          cardEnvironment === 'sandbox' ? 'text-white' : 'text-gray-500'
                                        }`} />
                                      </div>
                                      <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">Sandbox</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">Testing environment</div>
                                      </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                      cardEnvironment === 'sandbox'
                                        ? 'border-blue-500 bg-blue-500 shadow-lg'
                                        : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                      {cardEnvironment === 'sandbox' && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </label>
                            
                            <label className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                              <div className="relative">
                                <input
                                  type="radio"
                                  name="card-environment"
                                  value="live"
                                  checked={cardEnvironment === 'live'}
                                  onChange={(e) => setCardEnvironment(e.target.value as 'sandbox' | 'live')}
                                  className="sr-only"
                                />
                                <div className={`cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm ${
                                  cardEnvironment === 'live'
                                    ? 'border-green-500 bg-green-50/80 dark:bg-green-900/30 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-green-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        cardEnvironment === 'live'
                                          ? 'bg-gradient-to-br from-green-500 to-green-600'
                                          : 'bg-gray-200 dark:bg-gray-600'
                                      }`}>
                                        <FiGlobe className={`h-4 w-4 ${
                                          cardEnvironment === 'live' ? 'text-white' : 'text-gray-500'
                                        }`} />
                                      </div>
                                      <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">Live</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">Production environment</div>
                                      </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                      cardEnvironment === 'live'
                                        ? 'border-green-500 bg-green-500 shadow-lg'
                                        : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                      {cardEnvironment === 'live' && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Digital Wallets */}
                      {selectedGatewayData.supportsDigitalWallets && selectedGateway !== 'paypal-commerce' && (
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                          <div className="relative bg-orange-50/80 dark:bg-orange-900/20 backdrop-blur-xl border border-orange-200 dark:border-orange-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                                  <FiSmartphone className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Digital Wallets</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">Enable Apple Pay and Google Pay</p>
                                </div>
                              </div>
                              <Checkbox
                                id="digital-wallets"
                                checked={digitalWalletsEnabled}
                                onCheckedChange={(checked) => setDigitalWalletsEnabled(checked === true)}
                                className="h-6 w-6 text-orange-600 focus:ring-orange-500 border-2 border-gray-300 dark:border-gray-600 rounded-lg data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Test Connection */}
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-pink-50/80 dark:bg-pink-900/20 backdrop-blur-xl border border-pink-200 dark:border-pink-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                                <FiZap className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connection Test</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Verify your gateway configuration</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Button
                                onClick={handleTestCardConnection}
                                disabled={isLoading}
                                variant="outline"
                                className="flex items-center gap-2 h-11 px-6 border-2 border-gray-300 dark:border-gray-600 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                              >
                                {isLoading ? (
                                  <div className="w-5 h-5 border-2 border-pink-600/20 border-t-pink-600 rounded-full animate-spin"></div>
                                ) : (
                                  <FiZap className="h-5 w-5" />
                                )}
                                {isLoading ? 'Testing...' : 'Test Connection'}
                              </Button>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium shadow-lg ${
                                  cardConnected 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                }`}>
                                  {cardConnected ? (
                                    <>
                                      <FiCheckCircle className="h-4 w-4" />
                                      Connected
                                    </>
                                  ) : (
                                    <>
                                      <FiXCircle className="h-4 w-4" />
                                      Not Connected
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PayPal Commerce Platform Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl">
                    <FiDollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">PayPal Commerce Platform</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">PayPal, Venmo, Pay Later, and Credit/Debit Cards</p>
                    {!paypalEnabled && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        ⚠️ Disabled - Credentials are preserved
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={paypalEnabled}
                    onChange={(e) => setPaypalEnabled(e.target.checked)}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('paypal')}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                  >
                    <div className={`transition-transform duration-300 ease-in-out ${
                      expandedSections.paypal ? 'rotate-180' : 'rotate-0'
                    }`}>
                      <FiChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </Button>
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedSections.paypal ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-8">
                  {/* Features Overview */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-xl border border-blue-200 dark:border-blue-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          <FiInfo className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">PayPal Commerce Platform Features</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-700/30">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                              <FiDollarSign className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">PayPal Checkout</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Secure payment processing</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-700/30">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                              <FiSmartphone className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Venmo (US)</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Social payment platform</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-700/30">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                              <FiCreditCard className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Pay Later</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">PayPal Credit & Pay in 4</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-700/30">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                              <FiShield className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Fraud Protection</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Advanced security features</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!paypalEnabled && (
                        <div className="mt-4 p-4 bg-orange-100/80 dark:bg-orange-900/30 border-2 border-orange-300 dark:border-orange-600 rounded-xl">
                          <div className="flex items-center gap-2">
                            <FiInfo className="h-5 w-5 text-orange-600" />
                            <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                              💡 Your credentials are safely stored and will be restored when you re-enable PayPal
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Configuration Section */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-green-50/80 dark:bg-green-900/20 backdrop-blur-xl border border-green-200 dark:border-green-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                          <FiSettings className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">PayPal Configuration</h3>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Credential Reuse */}
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                          <div className="relative flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                <FiRefreshCw className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <Label htmlFor="reuse-credentials" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                  Reuse Credit Card Credentials
                                </Label>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Use same credentials as Credit Card section</p>
                              </div>
                            </div>
                            <Checkbox
                              id="reuse-credentials"
                              checked={reuseCredentials}
                              onCheckedChange={(checked) => setReuseCredentials(checked === true)}
                              className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-2 border-gray-300 dark:border-gray-600 rounded-lg data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </div>
                        </div>

                        {/* Disabled Notice */}
                        {!paypalEnabled && (
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                            <div className="relative p-4 bg-gray-100/80 dark:bg-gray-800/60 rounded-xl border-2 border-gray-300 dark:border-gray-600">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
                                  <FiLock className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                    🔒 Credentials are preserved but PayPal is currently disabled
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Secret Inputs */}
                        <div className="space-y-4">
                          <SecretInput
                            label="Client ID"
                            value={paypalClientId}
                            onChange={setPaypalClientId}
                            placeholder="Enter your PayPal Client ID"
                            fieldName="paypal-client-id"
                          />
                          <SecretInput
                            label="Client Secret"
                            value={paypalClientSecret}
                            onChange={setPaypalClientSecret}
                            placeholder="Enter your PayPal Client Secret"
                            fieldName="paypal-client-secret"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Environment Selection */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-xl border border-purple-200 dark:border-purple-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                          <FiGlobe className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Environment Settings</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                          <div className="relative">
                            <input
                              type="radio"
                              name="paypal-mode"
                              value="sandbox"
                              checked={paypalMode === 'sandbox'}
                              onChange={(e) => setPaypalMode(e.target.value as 'sandbox' | 'live')}
                              className="sr-only"
                            />
                            <div className={`cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm ${
                              paypalMode === 'sandbox'
                                ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 shadow-lg'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    paypalMode === 'sandbox'
                                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                      : 'bg-gray-200 dark:bg-gray-600'
                                  }`}>
                                    <FiSettings className={`h-4 w-4 ${
                                      paypalMode === 'sandbox' ? 'text-white' : 'text-gray-500'
                                    }`} />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">Sandbox</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">Testing environment</div>
                                  </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  paypalMode === 'sandbox'
                                    ? 'border-blue-500 bg-blue-500 shadow-lg'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {paypalMode === 'sandbox' && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                        
                        <label className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                          <div className="relative">
                            <input
                              type="radio"
                              name="paypal-mode"
                              value="live"
                              checked={paypalMode === 'live'}
                              onChange={(e) => setPaypalMode(e.target.value as 'sandbox' | 'live')}
                              className="sr-only"
                            />
                            <div className={`cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm ${
                              paypalMode === 'live'
                                ? 'border-green-500 bg-green-50/80 dark:bg-green-900/30 shadow-lg'
                                : 'border-gray-200 dark:border-gray-600 hover:border-green-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    paypalMode === 'live'
                                      ? 'bg-gradient-to-br from-green-500 to-green-600'
                                      : 'bg-gray-200 dark:bg-gray-600'
                                  }`}>
                                    <FiGlobe className={`h-4 w-4 ${
                                      paypalMode === 'live' ? 'text-white' : 'text-gray-500'
                                    }`} />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">Live</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">Production environment</div>
                                  </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  paypalMode === 'live'
                                    ? 'border-green-500 bg-green-500 shadow-lg'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {paypalMode === 'live' && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Test Connection */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-pink-50/80 dark:bg-pink-900/20 backdrop-blur-xl border border-pink-200 dark:border-pink-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                            <FiZap className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connection Test</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Verify your PayPal configuration</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={handleTestPayPalConnection}
                            variant="outline"
                            disabled={isLoading || !paypalClientId || !paypalClientSecret}
                            className="flex items-center gap-2 h-11 px-6 border-2 border-gray-300 dark:border-gray-600 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                          >
                            <FiZap className="h-5 w-5" />
                            {isLoading ? 'Testing...' : 'Test Connection'}
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium shadow-lg ${
                              paypalConnected 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            }`}>
                              {paypalConnected ? (
                                <>
                                  <FiCheckCircle className="h-4 w-4" />
                                  Connected
                                </>
                              ) : (
                                <>
                                  <FiXCircle className="h-4 w-4" />
                                  Not Connected
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Klarna Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl">
                    <FiShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Klarna</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Buy Now, Pay Later</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={klarnaEnabled}
                    onChange={(e) => setKlarnaEnabled(e.target.checked)}
                    className="data-[state=checked]:bg-pink-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('klarna')}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                  >
                    <div className={`transition-transform duration-300 ease-in-out ${
                      expandedSections.klarna ? 'rotate-180' : 'rotate-0'
                    }`}>
                      <FiChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </Button>
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedSections.klarna ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-8">
                  {/* Klarna Overview */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-pink-50/80 dark:bg-pink-900/20 backdrop-blur-xl border border-pink-200 dark:border-pink-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                          <FiInfo className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Klarna Buy Now, Pay Later</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200 dark:border-pink-700/30">
                            <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                              <FiShoppingBag className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Buy Now, Pay Later</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Flexible payment options</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200 dark:border-pink-700/30">
                            <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                              <FiUsers className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Eligible Customers</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Shows only to qualified users</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200 dark:border-pink-700/30">
                            <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                              <FiGlobe className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Global Coverage</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Multiple regions supported</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200 dark:border-pink-700/30">
                            <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                              <FiShield className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Secure Integration</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Bank-level security</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-pink-100/80 dark:bg-pink-900/30 border-2 border-pink-300 dark:border-pink-600 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FiInfo className="h-5 w-5 text-pink-600" />
                          <p className="text-sm text-pink-800 dark:text-pink-200 font-medium">
                            Klarna shows only to eligible customers during checkout based on their location and credit assessment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Section */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-xl border border-purple-200 dark:border-purple-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                          <FiSettings className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Klarna Configuration</h3>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Region Selection */}
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                          <div className="relative space-y-3">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <FiGlobe className="h-4 w-4 text-purple-500" />
                              Service Region
                            </Label>
                            <select
                              value={klarnaRegion}
                              onChange={e => setKlarnaRegion(e.target.value as 'North America' | 'Europe' | 'Oceania')}
                              className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-400 hover:bg-white/80 dark:hover:bg-gray-700/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md"
                            >
                              <option value="North America">North America</option>
                              <option value="Europe">Europe</option>
                              <option value="Oceania">Oceania</option>
                            </select>
                          </div>
                        </div>

                        {/* Credentials */}
                        <div className="space-y-4">
                          <SecretInput
                            label="Username"
                            value={klarnaUsername}
                            onChange={setKlarnaUsername}
                            placeholder="Enter your Klarna Username"
                            fieldName="klarna-username"
                          />
                          <SecretInput
                            label="Password"
                            value={klarnaPassword}
                            onChange={setKlarnaPassword}
                            placeholder="Enter your Klarna Password"
                            fieldName="klarna-password"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Environment Selection */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-xl border border-blue-200 dark:border-blue-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          <FiGlobe className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Environment Settings</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-pink-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                          <div className="relative">
                            <input
                              type="radio"
                              name="klarna-environment"
                              value="sandbox"
                              checked={cardEnvironment === 'sandbox'}
                              onChange={() => setCardEnvironment('sandbox')}
                              className="sr-only"
                            />
                            <div className={`cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm ${
                              cardEnvironment === 'sandbox'
                                ? 'border-pink-500 bg-pink-50/80 dark:bg-pink-900/30 shadow-lg'
                                : 'border-gray-200 dark:border-gray-600 hover:border-pink-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    cardEnvironment === 'sandbox'
                                      ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                                      : 'bg-gray-200 dark:bg-gray-600'
                                  }`}>
                                    <FiSettings className={`h-4 w-4 ${
                                      cardEnvironment === 'sandbox' ? 'text-white' : 'text-gray-500'
                                    }`} />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">Sandbox</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">Testing environment</div>
                                  </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  cardEnvironment === 'sandbox'
                                    ? 'border-pink-500 bg-pink-500 shadow-lg'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {cardEnvironment === 'sandbox' && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                        
                        <label className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                          <div className="relative">
                            <input
                              type="radio"
                              name="klarna-environment"
                              value="live"
                              checked={cardEnvironment === 'live'}
                              onChange={() => setCardEnvironment('live')}
                              className="sr-only"
                            />
                            <div className={`cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm ${
                              cardEnvironment === 'live'
                                ? 'border-green-500 bg-green-50/80 dark:bg-green-900/30 shadow-lg'
                                : 'border-gray-200 dark:border-gray-600 hover:border-green-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    cardEnvironment === 'live'
                                      ? 'bg-gradient-to-br from-green-500 to-green-600'
                                      : 'bg-gray-200 dark:bg-gray-600'
                                  }`}>
                                    <FiGlobe className={`h-4 w-4 ${
                                      cardEnvironment === 'live' ? 'text-white' : 'text-gray-500'
                                    }`} />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">Live</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">Production environment</div>
                                  </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  cardEnvironment === 'live'
                                    ? 'border-green-500 bg-green-500 shadow-lg'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {cardEnvironment === 'live' && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Test Connection */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-orange-50/80 dark:bg-orange-900/20 backdrop-blur-xl border border-orange-200 dark:border-orange-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                            <FiZap className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connection Test</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Verify your Klarna configuration</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={async () => {
                              if (!klarnaUsername || !klarnaPassword) {
                                toast({
                                  title: 'Missing Credentials',
                                  description: 'Please enter both Klarna API Username and Password.',
                                  variant: 'destructive'
                                })
                                return;
                              }
                              setIsLoading(true);
                              try {
                                const response = await fetch('/api/checkout/test-klarna-connection', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    username: klarnaUsername,
                                    password: klarnaPassword,
                                    environment: cardEnvironment === 'sandbox' ? 'playground' : 'live',
                                    region: klarnaRegion,
                                  }),
                                });
                                const result = await response.json();
                                if (result.success) {
                                  setKlarnaConnected(true);
                                  toast({
                                    title: 'Klarna Connected',
                                    description: 'Klarna connection test successful!'
                                  })
                                } else {
                                  setKlarnaConnected(false);
                                  if (result.details && result.details.status_code === 403) {
                                    toast({
                                      title: 'Network not allowed',
                                      description: 'Your country or IP may not be allowed by Klarna. Try using a VPN from a supported region.',
                                      variant: 'destructive'
                                    })
                                  } else {
                                    toast({
                                      title: 'Klarna Connection Failed',
                                      description: result.message || result.error || 'Unknown error',
                                      variant: 'destructive'
                                    })
                                  }
                                }
                              } catch (error) {
                                setKlarnaConnected(false);
                                toast({
                                  title: 'Klarna Connection Failed',
                                  description: error instanceof Error ? error.message : 'Unknown error',
                                  variant: 'destructive'
                                })
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            variant="outline"
                            disabled={isLoading || !klarnaMerchantId || !klarnaUsername || !klarnaPassword}
                            className="flex items-center gap-2 h-11 px-6 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                          >
                            <FiZap className="h-5 w-5" />
                            {isLoading ? 'Testing...' : 'Test Connection'}
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium shadow-lg ${
                              klarnaConnected 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            }`}>
                              {klarnaConnected ? (
                                <>
                                  <FiCheckCircle className="h-4 w-4" />
                                  Connected
                                </>
                              ) : (
                                <>
                                  <FiXCircle className="h-4 w-4" />
                                  Not Connected
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cash on Delivery Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                    <FiTruck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cash on Delivery</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Pay when you receive</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('cod')}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                  >
                    <div className={`transition-transform duration-300 ease-in-out ${
                      expandedSections.cod ? 'rotate-180' : 'rotate-0'
                    }`}>
                      <FiChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </Button>
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedSections.cod ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-8">
                  {/* Cash on Delivery Overview */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-green-50/80 dark:bg-green-900/20 backdrop-blur-xl border border-green-200 dark:border-green-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                          <FiInfo className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash on Delivery Service</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-green-200 dark:border-green-700/30">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                              <FiTruck className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Pay on Delivery</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Cash payment upon receipt</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-green-200 dark:border-green-700/30">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                              <FiShield className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Secure Delivery</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Verified delivery process</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-green-200 dark:border-green-700/30">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                              <FiUsers className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">Customer Trust</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Builds customer confidence</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-green-200 dark:border-green-700/30">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                              <FiDollarSign className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">No Online Payment</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Traditional payment method</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-green-100/80 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FiInfo className="h-5 w-5 text-green-600" />
                          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            Cash on Delivery allows customers to pay with cash when they receive their order, providing a trusted payment option for those who prefer not to pay online.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Section */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-xl border border-blue-200 dark:border-blue-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          <FiSettings className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">COD Configuration</h3>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Instruction Text */}
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                          <div className="relative space-y-3">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <FiMessageSquare className="h-4 w-4 text-blue-500" />
                              Delivery Instructions
                            </Label>
                            <Input
                              type="text"
                              placeholder="e.g., Pay cash to the delivery person upon receipt"
                              value={codInstructions}
                              onChange={(e) => setCodInstructions(e.target.value)}
                              className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-400 hover:bg-white/80 dark:hover:bg-gray-700/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md"
                            />
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              This text will be displayed to customers during checkout to explain the COD process.
                            </p>
                          </div>
                        </div>

                        {/* Phone Requirement */}
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                          <div className="relative flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-green-400 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                                <FiPhone className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <Label htmlFor="require-phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                  Require Phone Number
                                </Label>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Mandatory phone number for COD orders</p>
                              </div>
                            </div>
                            <Checkbox
                              id="require-phone"
                              checked={requirePhone}
                              onCheckedChange={(checked) => setRequirePhone(checked === true)}
                              className="h-6 w-6 text-green-600 focus:ring-green-500 border-2 border-gray-300 dark:border-gray-600 rounded-lg data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benefits Section */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-xl border border-purple-200 dark:border-purple-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                          <FiStar className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">COD Benefits</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200 dark:border-purple-700/30">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FiTrendingUp className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Higher Conversion</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Increases checkout completion rates</p>
                        </div>
                        <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200 dark:border-purple-700/30">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FiShield className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Trust Building</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Builds customer confidence</p>
                        </div>
                        <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200 dark:border-purple-700/30">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FiUsers className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Wider Reach</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Access to cash-only customers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 