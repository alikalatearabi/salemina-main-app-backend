const prisma = require('../config/db');
const { asyncHandler, AppError } = require('../utils/helpers');

/**
 * Get all products
 */
const getAllProducts = asyncHandler(async (req, res) => {
  // Allow filtering by various parameters
  const { brand, cluster, childCluster } = req.query;
  
  const filter = {};
  if (brand) filter.brand = brand;
  if (cluster) filter.cluster = cluster;
  if (childCluster) filter.childCluster = childCluster;
  
  const products = await prisma.product.findMany({
    where: filter,
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  res.status(200).json(products);
});

/**
 * Get product by barcode
 */
const getProductByBarcode = asyncHandler(async (req, res) => {
  const { barcode } = req.params;
  
  if (!barcode) {
    throw new AppError('Barcode is required', 400);
  }
  
  const product = await prisma.product.findUnique({
    where: { barcode }
  });
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  res.status(200).json(product);
});

/**
 * Create a new product
 */
const createProduct = asyncHandler(async (req, res) => {
  const { 
    barcode, productName, brand, cluster, childCluster, mainDataStatus,
    productDescription, pictureOld, stateOfMatter, per, calorie, sugar, 
    fat, salt, transfattyAcids, ...otherFields 
  } = req.body;
  
  if (!barcode || !productName) {
    throw new AppError('Barcode and product name are required', 400);
  }
  
  // Check if product with barcode already exists
  const existingProduct = await prisma.product.findUnique({
    where: { barcode }
  });
  
  if (existingProduct) {
    throw new AppError('Product with this barcode already exists', 400);
  }
  
  const newProduct = await prisma.product.create({
    data: {
      barcode,
      productName,
      brand,
      cluster,
      childCluster,
      mainDataStatus: mainDataStatus || 0,
      productDescription,
      pictureOld,
      stateOfMatter: stateOfMatter !== undefined ? stateOfMatter : null,
      per: per !== undefined ? parseFloat(per) : null,
      calorie: calorie !== undefined ? parseFloat(calorie) : null,
      sugar: sugar !== undefined ? parseFloat(sugar) : null,
      fat: fat !== undefined ? parseFloat(fat) : null,
      salt: salt !== undefined ? parseFloat(salt) : null,
      transfattyAcids: transfattyAcids !== undefined ? parseFloat(transfattyAcids) : null,
      ...otherFields
    }
  });
  
  res.status(201).json(newProduct);
});

/**
 * Update a product
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { barcode } = req.params;
  const updateData = req.body;
  
  if (!barcode) {
    throw new AppError('Barcode is required', 400);
  }
  
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { barcode }
  });
  
  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }
  
  // Convert numeric fields from strings to numbers
  const numericFields = ['per', 'calorie', 'sugar', 'fat', 'salt', 'transfattyAcids'];
  for (const field of numericFields) {
    if (updateData[field] !== undefined) {
      updateData[field] = parseFloat(updateData[field]);
    }
  }
  
  const updatedProduct = await prisma.product.update({
    where: { barcode },
    data: updateData
  });
  
  res.status(200).json(updatedProduct);
});

/**
 * Delete a product
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { barcode } = req.params;
  
  if (!barcode) {
    throw new AppError('Barcode is required', 400);
  }
  
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { barcode }
  });
  
  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }
  
  await prisma.product.delete({
    where: { barcode }
  });
  
  res.status(204).send();
});

/**
 * Search products by name, brand, or description
 */
const searchProducts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    throw new AppError('Search query is required', 400);
  }
  
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { productName: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { productDescription: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  res.status(200).json(products);
});

module.exports = {
  getAllProducts,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
}; 