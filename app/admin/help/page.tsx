'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiPlus, 
  FiUpload, 
  FiFileText, 
  FiCode, 
  FiCopy, 
  FiCheck,
  FiExternalLink,
  FiShoppingBag,
  FiUsers,
  FiShoppingCart,
  FiTag,
  FiSettings,
  FiTruck,
  FiCreditCard,
  FiBarChart2,
  FiMonitor,
  FiDatabase,
  FiArrowRight,
  FiInfo,
  FiAlertCircle,
  FiHelpCircle
} from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function HelpPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (code: string, identifier: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(identifier)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const tableExamples = [
    {
      name: 'admin_users',
      title: 'Admin Users',
      description: 'Administrator accounts for the system',
      icon: <FiUsers className="w-5 h-5" />,
      example: `{
  "name": "John Doe",
  "email": "admin@example.com",
  "passwordHash": "hashed_password_here",
  "role": "admin",
  "status": "active",
  "phoneNumber": "+1234567890",
  "address": "123 Admin Street, City, State 12345",
  "emailVerified": true
}`
    },
    {
      name: 'products',
      title: 'Products',
      description: 'Main product catalog items',
      icon: <FiShoppingBag className="w-5 h-5" />,
      example: `{
  "styleId": 1001,
  "name": "Premium Cotton T-Shirt",
  "style": "Classic Fit",
  "quantityAvailable": 50,
  "onSale": "N",
  "isNew": "Y",
  "smallPicture": "https://example.com/small.jpg",
  "mediumPicture": "https://example.com/medium.jpg",
  "largePicture": "https://example.com/large.jpg",
  "department": "Clothing",
  "type": "Apparel",
  "subType": "T-Shirts",
  "brand": "FashionBrand",
  "sellingPrice": "29.99",
  "regularPrice": "39.99",
  "longDescription": "Premium cotton t-shirt with classic fit...",
  "tags": "cotton,comfortable,classic",
  "urlHandle": "premium-cotton-tshirt",
  "barcode": "1234567890123",
  "sku": "TSH-001",
  "trackInventory": true,
  "stockQuantity": 50,
  "continueSellingOutOfStock": false,
  "lowStockThreshold": 10
}`
    },
    {
      name: 'product_variations',
      title: 'Product Variations',
      description: 'Product variants (colors, sizes, etc.)',
      icon: <FiTag className="w-5 h-5" />,
      example: `{
  "productId": 1,
  "skuId": 1001,
  "quantity": 25,
  "colorImage": "https://example.com/red-tshirt.jpg",
  "sku": "TSH-001-RED-M",
  "barcode": "1234567890124",
  "price": "29.99",
  "available": true
}`
    },
    {
      name: 'categories',
      title: 'Categories',
      description: 'Product categories and classifications',
      icon: <FiTag className="w-5 h-5" />,
      example: `{
  "id": "clothing",
  "name": "Clothing",
  "slug": "clothing",
  "description": "All clothing items",
  "parentId": null
}`
    },
    {
      name: 'attributes',
      title: 'Attributes',
      description: 'Product attributes (color, size, etc.)',
      icon: <FiSettings className="w-5 h-5" />,
      example: `{
  "name": "Color",
  "display": "Color",
  "status": "active",
  "showOnCategory": true,
  "showOnProduct": true
}`
    },
    {
      name: 'attribute_values',
      title: 'Attribute Values',
      description: 'Values for product attributes',
      icon: <FiSettings className="w-5 h-5" />,
      example: `{
  "attributeId": "uuid-here",
  "value": "Red"
}`
    },
    {
      name: 'users',
      title: 'Users',
      description: 'Customer accounts',
      icon: <FiUsers className="w-5 h-5" />,
      example: `{
  "name": "Jane Customer",
  "email": "jane@example.com",
  "password": "hashed_password_here",
  "image": "https://example.com/avatar.jpg"
}`
    },
    {
      name: 'addresses',
      title: 'Addresses',
      description: 'Customer shipping and billing addresses',
      icon: <FiTruck className="w-5 h-5" />,
      example: `{
  "userId": "user-uuid-here",
  "type": "shipping",
  "isDefault": true,
  "street": "123 Main Street",
  "street2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA"
}`
    },
    {
      name: 'orders',
      title: 'Orders',
      description: 'Customer orders',
      icon: <FiShoppingCart className="w-5 h-5" />,
      example: `{
  "userId": "user-uuid-here",
  "guestEmail": "guest@example.com",
  "status": "pending",
  "paymentStatus": "pending",
  "totalAmount": "99.99",
  "subtotal": "89.99",
  "tax": "10.00",
  "shippingFee": "0.00",
  "discount": "0.00",
  "paymentMethod": "credit_card",
  "note": "Please deliver after 6 PM"
}`
    },
    {
      name: 'order_items',
      title: 'Order Items',
      description: 'Individual items within orders',
      icon: <FiShoppingCart className="w-5 h-5" />,
      example: `{
  "orderId": "order-uuid-here",
  "productId": 1,
  "variationId": 1,
  "name": "Premium Cotton T-Shirt",
  "sku": "TSH-001-RED-M",
  "color": "Red",
  "size": "M",
  "quantity": 2,
  "unitPrice": "29.99",
  "totalPrice": "59.98"
}`
    },
    {
      name: 'shipping_methods',
      title: 'Shipping Methods',
      description: 'Available shipping options',
      icon: <FiTruck className="w-5 h-5" />,
      example: `{
  "name": "Standard Shipping",
  "description": "5-7 business days",
  "price": "5.99",
  "estimatedDays": 5,
  "isActive": true
}`
    },
    {
      name: 'discounts',
      title: 'Discounts',
      description: 'Promotional codes and discounts',
      icon: <FiTag className="w-5 h-5" />,
      example: `{
  "code": "SAVE20",
  "description": "20% off all items",
  "type": "percentage",
  "value": "20.00",
  "minPurchaseAmount": "50.00",
  "maxDiscountAmount": "100.00",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "usageLimit": 1000,
  "usageCount": 0,
  "isActive": true
}`
    },
    {
      name: 'reviews',
      title: 'Reviews',
      description: 'Product reviews and ratings',
      icon: <FiBarChart2 className="w-5 h-5" />,
      example: `{
  "userId": "user-uuid-here",
  "productId": "product-id-here",
  "rating": 5,
  "title": "Excellent Quality",
  "content": "This t-shirt is amazing! Great fit and comfortable material.",
  "images": ["https://example.com/review1.jpg"],
  "verifiedPurchase": true,
  "helpfulVotes": 12
}`
    },
    {
      name: 'main_banners',
      title: 'Main Banners',
      description: 'Homepage banner images',
      icon: <FiMonitor className="w-5 h-5" />,
      example: `{
  "title": "Summer Sale",
  "subtitle": "Up to 50% off",
  "imageUrl": "https://example.com/banner1.jpg",
  "linkUrl": "/sale",
  "isActive": true,
  "order": 1
}`
    },
    {
      name: 'mini_banners',
      title: 'Mini Banners',
      description: 'Small promotional banners',
      icon: <FiMonitor className="w-5 h-5" />,
      example: `{
  "title": "Free Shipping",
  "subtitle": "On orders over $50",
  "imageUrl": "https://example.com/mini-banner.jpg",
  "linkUrl": "/shipping",
  "isActive": true,
  "order": 1
}`
    },
    {
      name: 'pages',
      title: 'Pages',
      description: 'CMS pages and content',
      icon: <FiFileText className="w-5 h-5" />,
      example: `{
  "title": "About Us",
  "slug": "about-us",
  "content": "<h1>About Our Company</h1><p>We are dedicated to quality...</p>",
  "metaTitle": "About Us - Company Name",
  "metaDescription": "Learn about our company and mission",
  "status": "published",
  "isHomepage": false
}`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
                                <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#00437f] rounded-xl flex items-center justify-center mr-6 shadow-sm">
              <FiHelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-semibold text-[#00437f]">
              Help Center
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Get started with your store by adding products and importing data. Follow our comprehensive guides below.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#00437f] rounded-lg flex items-center justify-center">
                  <FiPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Add Products Manually</CardTitle>
                  <CardDescription className="text-gray-600">
                    Create products one by one through the admin interface
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Use our intuitive product creation form to add individual products with all their details, variations, and images.
              </p>
              <Button 
                className="w-full bg-[#00437f] hover:bg-[#003366]"
                onClick={() => window.open('/admin/catalog/products', '_blank')}
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add a Product
                <FiExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#00437f] rounded-lg flex items-center justify-center">
                  <FiUpload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Import Data</CardTitle>
                  <CardDescription className="text-gray-600">
                    Bulk import products and other data using JSON files
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Import large amounts of data quickly using our data manager with proper JSON formatting.
              </p>
              <Button 
                className="w-full bg-[#00437f] hover:bg-[#003366]"
                onClick={() => window.open('/admin/data-manager/import', '_blank')}
              >
                <FiUpload className="w-4 h-4 mr-2" />
                Import Data
                <FiExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Import Order Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Alert className="border-gray-200 bg-gray-50">
            <FiInfo className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700">
              <strong>Important:</strong> When importing data, follow the correct order to maintain referential integrity. 
              Import tables in the order shown below to avoid foreign key constraint errors.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Data Import Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#00437f] rounded-lg flex items-center justify-center">
                  <FiDatabase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">Data Import Guide</CardTitle>
                  <CardDescription className="text-gray-600">
                    Complete reference for importing data with proper JSON structure
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="import-order" className="w-full">
                                  <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                    <TabsTrigger value="import-order" className="data-[state=active]:bg-[#00437f] data-[state=active]:text-white">Import Order</TabsTrigger>
                    <TabsTrigger value="examples" className="data-[state=active]:bg-[#00437f] data-[state=active]:text-white">JSON Examples</TabsTrigger>
                  </TabsList>

                <TabsContent value="import-order" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Import Order</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { step: 1, name: 'admin_users', title: 'Admin Users' },
                        { step: 2, name: 'categories', title: 'Categories' },
                        { step: 3, name: 'attributes', title: 'Attributes' },
                        { step: 4, name: 'attribute_values', title: 'Attribute Values' },
                        { step: 5, name: 'products', title: 'Products' },
                        { step: 6, name: 'product_variations', title: 'Product Variations' },
                        { step: 7, name: 'users', title: 'Users' },
                        { step: 8, name: 'addresses', title: 'Addresses' },
                        { step: 9, name: 'shipping_methods', title: 'Shipping Methods' },
                        { step: 10, name: 'discounts', title: 'Discounts' },
                        { step: 11, name: 'orders', title: 'Orders' },
                        { step: 12, name: 'order_items', title: 'Order Items' },
                        { step: 13, name: 'reviews', title: 'Reviews' },
                        { step: 14, name: 'main_banners', title: 'Main Banners' },
                        { step: 15, name: 'mini_banners', title: 'Mini Banners' },
                        { step: 16, name: 'pages', title: 'Pages' }
                      ].map((item) => (
                                                <div key={item.step} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="w-8 h-8 bg-[#00437f] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {item.step}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="examples" className="mt-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">JSON Data Examples</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {tableExamples.map((table) => (
                        <Card key={table.name} className="border border-gray-200 hover:border-gray-300 transition-colors">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                                                                                 <div className="w-10 h-10 bg-[#00437f] rounded-lg flex items-center justify-center">
                                  <div className="text-white">
                                    {table.icon}
                                  </div>
                                </div>
                                <div>
                                  <CardTitle className="text-lg font-semibold text-gray-900">{table.title}</CardTitle>
                                  <CardDescription className="text-gray-600">{table.description}</CardDescription>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">{table.name}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="relative">
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                <code>{table.example}</code>
                              </pre>
                                                             <Button
                                 size="sm"
                                 variant="outline"
                                 className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
                                 onClick={() => copyToClipboard(table.example, table.name)}
                               >
                                 {copiedCode === table.name ? (
                                   <FiCheck className="w-4 h-4 text-green-600" />
                                 ) : (
                                   <FiCopy className="w-4 h-4" />
                                 )}
                               </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips and Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                                                 <div className="w-10 h-10 bg-[#00437f] rounded-lg flex items-center justify-center">
                  <FiAlertCircle className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Import Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#00437f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">Always import tables in the correct order to avoid foreign key errors</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#00437f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">Use valid UUIDs for ID fields that reference other tables</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#00437f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">Ensure all required fields are provided in your JSON data</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#00437f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">Test with small datasets before importing large amounts</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                                                 <div className="w-10 h-10 bg-[#00437f] rounded-lg flex items-center justify-center">
                  <FiArrowRight className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Next Steps</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#00437f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">Start by adding a few products manually to understand the structure</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#00437f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">Prepare your JSON data following the examples above</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#00437f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">Use the Data Manager to import your prepared data</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#00437f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">Configure your store settings and start selling!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 