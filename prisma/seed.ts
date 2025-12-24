import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed data configuration
const PRODUCTS = [
  { name: 'Premium Wireless Headphones', category: 'Electronics', price: 299.99, isTopPerformer: true },
  { name: 'Smart Fitness Watch', category: 'Electronics', price: 249.99, isTopPerformer: true },
  { name: 'Organic Coffee Blend', category: 'Food & Beverage', price: 24.99, isTopPerformer: false },
  { name: 'Yoga Mat Pro', category: 'Sports', price: 49.99, isTopPerformer: false },
  { name: 'Stainless Steel Water Bottle', category: 'Sports', price: 29.99, isTopPerformer: false },
  { name: 'Ergonomic Desk Chair', category: 'Furniture', price: 399.99, isTopPerformer: false },
  { name: 'LED Desk Lamp', category: 'Home', price: 59.99, isTopPerformer: false },
  { name: 'Bamboo Cutting Board Set', category: 'Kitchen', price: 39.99, isTopPerformer: false },
];

const CUSTOMER_NAMES = [
  'John Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Davis',
  'James Wilson', 'Emily Martinez', 'David Anderson', 'Sophia Taylor',
  'Robert Thomas', 'Olivia Garcia', 'William Rodriguez', 'Ava Lopez',
  'Richard Lee', 'Isabella White', 'Joseph Harris', 'Mia Clark',
];

// Generate realistic order distribution
function generateOrders(products: any[], startDate: Date, endDate: Date) {
  const orders: any[] = [];
  let orderCounter = 1000;

  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Base orders per day: weekdays 3-4, weekends 1-2
    let ordersPerDay = isWeekend 
      ? Math.floor(Math.random() * 2) + 1 
      : Math.floor(Math.random() * 2) + 3;
    
    // Random sales drops (10% chance)
    if (Math.random() < 0.1) {
      ordersPerDay = Math.max(1, Math.floor(ordersPerDay * 0.5));
    }
    
    // Slight increase in recent week (growth trend)
    const daysFromStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysFromStart > 23) {
      ordersPerDay += 1;
    }

    for (let i = 0; i < ordersPerDay; i++) {
      const orderNumber = `ORD-${orderCounter++}`;
      const customerId = `CUST-${Math.floor(Math.random() * 1000)}`;
      const customerName = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
      
      // Random time during the day
      const orderTime = new Date(currentDate);
      orderTime.setHours(Math.floor(Math.random() * 14) + 8); // 8am - 10pm
      orderTime.setMinutes(Math.floor(Math.random() * 60));
      
      // 1-3 items per order
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const orderItems: any[] = [];
      let orderTotal = 0;

      for (let j = 0; j < itemCount; j++) {
        // Increase probability for top performers
        let product;
        if (Math.random() < 0.6) {
          // 60% chance to pick a top performer
          const topPerformers = products.filter(p => p.isTopPerformer);
          product = topPerformers[Math.floor(Math.random() * topPerformers.length)];
        } else {
          product = products[Math.floor(Math.random() * products.length)];
        }
        
        const quantity = Math.floor(Math.random() * 2) + 1;
        const subtotal = product.price * quantity;
        orderTotal += subtotal;

        orderItems.push({
          productId: product.id,
          quantity,
          price: product.price,
          subtotal,
        });
      }

      orders.push({
        orderNumber,
        customerId,
        customerName,
        total: orderTotal,
        status: 'completed',
        orderDate: orderTime,
        orderItems,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return orders;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.aIInsight.deleteMany();

  // Seed products
  console.log('📦 Seeding products...');
  const createdProducts = [];
  for (const product of PRODUCTS) {
    const { isTopPerformer, ...productData } = product;
    const created = await prisma.product.create({
      data: productData,
    });
    createdProducts.push({ ...created, isTopPerformer });
  }
  console.log(`✅ Created ${createdProducts.length} products`);

  // Generate orders for last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  console.log('🛒 Generating orders...');
  const orders = generateOrders(createdProducts, startDate, endDate);
  
  let orderCount = 0;
  for (const orderData of orders) {
    const { orderItems, ...order } = orderData;
    
    await prisma.order.create({
      data: {
        ...order,
        orderItems: {
          create: orderItems,
        },
      },
    });
    orderCount++;
  }
  
  console.log(`✅ Created ${orderCount} orders`);
  
  // Calculate some stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = totalRevenue / orders.length;
  
  console.log('\n📊 Seed Summary:');
  console.log(`   Orders: ${orders.length}`);
  console.log(`   Total Revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`   Average Order Value: $${avgOrderValue.toFixed(2)}`);
  console.log(`   Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
  
  console.log('\n✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

