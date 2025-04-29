// scripts/importProducts.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// helper: snake_case → camelCase
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// helper: safe date parser
function parseDate(value) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// Prisma numeric field sets
const intFields = new Set([
  'mainDataStatus',
  'stateOfMatter'
]);
const floatFields = new Set([
  'per',
  'calorie',
  'sugar',
  'fat',
  'salt',
  'transfattyAcids'
]);

async function main() {
  // 1. Load your JSON
  const raw = fs.readFileSync(path.join(__dirname, './products_data.json'), 'utf-8').trim();
  const docs = raw.startsWith('[')
    ? JSON.parse(raw)
    : raw.split('\n').map(line => JSON.parse(line));

  // 2. Transform each doc into exactly what Prisma expects
  const products = docs.map(item => {
    const p = {};

    for (const [key, value] of Object.entries(item)) {
      // drop Mongo internals
      if (key === '_id' || key === 'Id') continue;

      // build the Prisma field name
      let field = snakeToCamel(key);
      // fix the one mismatch
      if (field === 'transFattyAcids') field = 'transfattyAcids';

      // Dates
      if (field === 'createdAt' || field === 'updatedAt') {
        const dt = parseDate(value);
        if (dt) p[field] = dt;
        continue;
      }

      // Integers
      if (intFields.has(field)) {
        const n = parseInt(value, 10);
        p[field] = isNaN(n) ? null : n;
        continue;
      }

      // Floats
      if (floatFields.has(field)) {
        const f = parseFloat(value);
        p[field] = isNaN(f) ? null : f;
        continue;
      }

      // Strings (everything else)
      // if null/undefined → null, else cast to String
      p[field] = value == null ? null : String(value);
    }

    return p;
  });

  // 3. Bulk‐insert in chunks
  const chunkSize = 500;
  for (let i = 0; i < products.length; i += chunkSize) {
    const batch = products.slice(i, i + chunkSize);
    await prisma.product.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`Inserted ${Math.min(i + chunkSize, products.length)} of ${products.length}`);
  }

  console.log('✅ Import complete');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
