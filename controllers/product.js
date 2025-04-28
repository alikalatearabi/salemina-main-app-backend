const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Find product by barcode
exports.findByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }
    
    const product = await prisma.product.findUnique({
      where: { barcode }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error finding product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const whereClause = search 
      ? {
          OR: [
            { productName: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search } }
          ]
        } 
      : {};
    
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { productName: 'asc' }
      }),
      prisma.product.count({ where: whereClause })
    ]);
    
    return res.status(200).json({
      products,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      totalCount
    });
  } catch (error) {
    console.error('Error getting products:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { barcode, productName, brand, cluster, childCluster, productDescription, 
            calorie, sugar, fat, salt, transfattyAcids, per, stateOfMatter } = req.body;
    
    // Validate required fields
    if (!barcode || !productName) {
      return res.status(400).json({ error: 'Barcode and product name are required' });
    }
    
    // Check if product with barcode already exists
    const existingProduct = await prisma.product.findUnique({
      where: { barcode }
    });
    
    if (existingProduct) {
      return res.status(409).json({ error: 'Product with this barcode already exists' });
    }
    
    const newProduct = await prisma.product.create({
      data: {
        barcode,
        productName,
        brand,
        cluster,
        childCluster,
        productDescription,
        calorie: calorie ? parseFloat(calorie) : null,
        sugar: sugar ? parseFloat(sugar) : null,
        fat: fat ? parseFloat(fat) : null,
        salt: salt ? parseFloat(salt) : null,
        transfattyAcids: transfattyAcids ? parseFloat(transfattyAcids) : null,
        per: per ? parseFloat(per) : null,
        stateOfMatter: stateOfMatter !== undefined ? parseInt(stateOfMatter) : 0,
        mainDataStatus: 1, // Default status for new products
        monitor: req.user?.email || 'system'
      }
    });
    
    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { barcode } = req.params;
    const updateData = req.body;
    
    // Validate barcode
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { barcode }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Convert numeric values
    if (updateData.calorie) updateData.calorie = parseFloat(updateData.calorie);
    if (updateData.sugar) updateData.sugar = parseFloat(updateData.sugar);
    if (updateData.fat) updateData.fat = parseFloat(updateData.fat);
    if (updateData.salt) updateData.salt = parseFloat(updateData.salt);
    if (updateData.transfattyAcids) updateData.transfattyAcids = parseFloat(updateData.transfattyAcids);
    if (updateData.per) updateData.per = parseFloat(updateData.per);
    if (updateData.stateOfMatter !== undefined) updateData.stateOfMatter = parseInt(updateData.stateOfMatter);
    
    // Add monitor information
    updateData.monitor = req.user?.email || 'system';
    
    const updatedProduct = await prisma.product.update({
      where: { barcode },
      data: updateData
    });
    
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { barcode }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await prisma.product.delete({
      where: { barcode }
    });
    
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 