import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'analyst@datasentry.ai' },
    update: {},
    create: {
      email: 'analyst@datasentry.ai',
      passwordHash: hashedPassword,
      name: 'Demo Analyst',
      role: 'ANALYST',
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create sample datasets
  const dataset1 = await prisma.dataset.create({
    data: {
      userId: user.id,
      name: 'retail_sales_q3_2026.csv',
      sourceType: 'CSV',
      status: 'HEALTHY',
      s3Bucket: 'datasentry-datasets-dev',
      s3Key: 'raw/retail/retail_sales_q3_2026.csv',
      fileSize: BigInt(2458624),
      rowCount: 10000,
      columnCount: 8,
      schema: {
        date: 'datetime',
        product_id: 'text',
        store_id: 'text',
        quantity: 'numeric',
        price: 'numeric',
        discount: 'numeric',
        revenue: 'numeric',
        customer_id: 'text',
      },
    },
  });

  console.log('✅ Created sample dataset:', dataset1.name);

  // Create quality result
  await prisma.qualityResult.create({
    data: {
      datasetId: dataset1.id,
      overallScore: 78.5,
      completenessScore: 92.0,
      validityScore: 85.0,
      consistencyScore: 70.0,
      uniquenessScore: 95.0,
      timelinessScore: 88.0,
      distributionScore: 62.0,
      version: '1.0.0',
      issues: {
        completeness: [
          {
            column: 'quantity',
            issue: 'missing_values',
            count: 250,
          },
        ],
        validity: [
          {
            column: 'price',
            issue: 'invalid_range',
            count: 45,
          },
        ],
      },
    },
  });

  console.log('✅ Created quality results');

  // Create some alerts
  await prisma.alert.create({
    data: {
      datasetId: dataset1.id,
      category: 'QUALITY',
      severity: 'MEDIUM',
      title: 'Data Quality Warning',
      description: 'Quality score below threshold',
      explanation: 'Several quality issues detected in the dataset',
      recommendedAction: 'Review data source and fix quality issues',
      status: 'NEW',
    },
  });

  console.log('✅ Created sample alert');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
