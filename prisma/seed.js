const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seed illnesses
  const illnesses = [
    {
      name: 'Thyroid',
      persianName: 'تیروئید',
      levels: [
        { name: 'Hypothyroidism', persianName: 'کم کاری' },
        { name: 'Hyperthyroidism', persianName: 'پر کاری' },
        { name: 'Normal', persianName: 'نرمال' },
        { name: 'Unknown', persianName: 'نامشخص' },
      ],
    },
    {
      name: 'BloodPressure',
      persianName: 'فشارخون',
      levels: [
        { name: 'Low', persianName: 'پایین' },
        { name: 'Normal', persianName: 'نرمال' },
        { name: 'High', persianName: 'بالا' },
        { name: 'Unknown', persianName: 'نامشخص' },
      ],
    },
    {
      name: 'Diabetes',
      persianName: 'دیابت',
      levels: [
        { name: 'Healthy', persianName: 'سالم' },
        { name: 'PreDiabetes', persianName: 'پیش دیابت' },
        { name: 'Diabetes', persianName: 'دیابت' },
      ],
    },
    {
      name: 'CardiovascularDisease',
      persianName: 'بیماری قلبی عروقی',
      levels: [
        { name: 'Yes', persianName: 'دارم' },
        { name: 'No', persianName: 'ندارم' },
      ],
    },
    {
      name: 'FattyLiver',
      persianName: 'کبد چرب',
      levels: [
        { name: 'Yes', persianName: 'دارم' },
        { name: 'No', persianName: 'ندارم' },
      ],
    },
    {
      name: 'PCOS',
      persianName: 'سندرم تخمدان پلی کیستیک',
      levels: [
        { name: 'Yes', persianName: 'دارم' },
        { name: 'No', persianName: 'ندارم' },
      ],
    },
    {
      name: 'AbdominalObesity',
      persianName: 'چاقی شکمی',
      levels: [
        { name: 'Yes', persianName: 'دارم' },
        { name: 'No', persianName: 'ندارم' },
      ],
    },
    {
      name: 'Triglycerides',
      persianName: 'تری گلیسیرید',
      levels: [
        { name: 'Normal', persianName: 'نرمال' },
        { name: 'High', persianName: 'بالا' },
        { name: 'Unknown', persianName: 'نامشخص' },
      ],
    },
    {
      name: 'Cholesterol',
      persianName: 'کلسترول',
      levels: [
        { name: 'Normal', persianName: 'نرمال' },
        { name: 'High', persianName: 'بالا' },
        { name: 'Unknown', persianName: 'نامشخص' },
      ],
    },
    {
      name: 'UricAcid',
      persianName: 'اسید اوریک',
      levels: [
        { name: 'Normal', persianName: 'نرمال' },
        { name: 'High', persianName: 'بالا' },
        { name: 'Unknown', persianName: 'نامشخص' },
      ],
    },
    {
      name: 'Creatinine',
      persianName: 'کراتینین',
      levels: [
        { name: 'Normal', persianName: 'نرمال' },
        { name: 'High', persianName: 'بالا' },
        { name: 'Unknown', persianName: 'نامشخص' },
      ],
    },
    {
      name: 'AppetiteStatus',
      persianName: 'وضعیت اشتها',
      levels: [
        { name: 'Low', persianName: 'کم' },
        { name: 'Normal', persianName: 'معمولی' },
        { name: 'High', persianName: 'زیاد' },
      ],
    },
    {
      name: 'AcidReflux',
      persianName: 'ریفلاکس معده',
      levels: [
        { name: 'Yes', persianName: 'دارم' },
        { name: 'No', persianName: 'ندارم' },
      ],
    },
    {
      name: 'Heartburn',
      persianName: 'سوزش معده',
      levels: [
        { name: 'Yes', persianName: 'دارم' },
        { name: 'No', persianName: 'ندارم' },
      ],
    },
    {
      name: 'Anemia',
      persianName: 'کم خونی',
      levels: [
        { name: 'Yes', persianName: 'دارم' },
        { name: 'No', persianName: 'ندارم' },
      ],
    },
  ];

  console.log('Seeding illnesses...');
  for (const illness of illnesses) {
    try {
      const createdIllness = await prisma.illness.create({
        data: {
          name: illness.name,
          persianName: illness.persianName,
          levels: {
            create: illness.levels,
          },
        },
      });
      console.log(`Created illness: ${createdIllness.name}`);
    } catch (error) {
      console.error(`Error creating illness ${illness.name}:`, error.message);
    }
  }

  // Seed allergies
  const allergies = [
    { name: 'Nuts', description: 'Allergy to nuts including almonds, walnuts, hazelnuts, pistachios, pine nuts', persianName: 'آجیل‌ها' },
    { name: 'Peanuts', description: 'Allergy to peanuts', persianName: 'بادام زمینی' },
    { name: 'OilSeeds', description: 'Allergy to oil seeds such as sesame seeds, sunflower seeds, pumpkin seeds', persianName: 'دانه‌های روغنی' },
    { name: 'Gluten', description: 'Allergy to gluten-containing grains like wheat, barley, rye', persianName: 'غلات حاوی گلوتن' },
    { name: 'Eggs', description: 'Allergy to eggs', persianName: 'تخم‌مرغ' },
    { name: 'Dairy', description: 'Allergy to dairy products', persianName: 'شیر و لبنیات' },
    { name: 'Seafood', description: 'Allergy to fish and shellfish', persianName: 'ماهی و صدف‌های دریایی' },
    { name: 'Soy', description: 'Allergy to soy products', persianName: 'سویا و محصولات سویا' },
    { name: 'Corn', description: 'Allergy to corn and corn products', persianName: 'ذرت و فرآورده های حاوی ذرت' },
    { name: 'Potato', description: 'Allergy to potatoes', persianName: 'سیب زمینی' },
    { name: 'Tomato', description: 'Allergy to tomatoes', persianName: 'گوجه فرنگی' },
    { name: 'Eggplant', description: 'Allergy to eggplant', persianName: 'بادمجان' },
    { name: 'Peppers', description: 'Allergy to peppers', persianName: 'فلفل' },
    { name: 'Onion', description: 'Allergy to onions', persianName: 'پیاز' },
    { name: 'Cabbage', description: 'Allergy to cabbage family including cauliflower, broccoli, cabbage', persianName: 'کلم‌ها' },
    { name: 'Leek', description: 'Allergy to leeks', persianName: 'تره فرنگی' },
    { name: 'Lettuce', description: 'Allergy to lettuce', persianName: 'کاهو' },
    { name: 'Celery', description: 'Allergy to celery', persianName: 'کرفس' },
    { name: 'Spinach', description: 'Allergy to spinach', persianName: 'اسفناج' }
  ];

  console.log('Seeding allergies...');
  for (const allergy of allergies) {
    try {
      await prisma.allergy.upsert({
        where: { name: allergy.name },
        update: allergy,
        create: allergy,
      });
      console.log(`Created/updated allergy: ${allergy.name}`);
    } catch (error) {
      console.error(`Error creating allergy ${allergy.name}:`, error.message);
    }
  }

  // Seed food preferences
  const foodPreferences = [
    { name: 'Vegetarian', description: 'No meat, fish, or poultry', persianName: 'گیاهی‌خوار' },
    { name: 'LactoVegetarian', description: 'Vegetarian diet that includes dairy products', persianName: 'گیاهی‌خوار با مصرف لبنیات' },
    { name: 'LactoOvoVegetarian', description: 'Vegetarian diet that includes dairy and eggs', persianName: 'گیاهی‌خوار با مصرف لبنیات و تخم‌مرغ' },
    { name: 'Pescatarian', description: 'Vegetarian diet that includes fish', persianName: 'گیاهی‌خوار با مصرف ماهی' },
    { name: 'Omnivore', description: 'Diet that includes both plant and animal foods', persianName: 'همه چیز خوار' },
    { name: 'Keto', description: 'Low carb, high fat diet', persianName: 'کتوژنیک' },
    { name: 'SensitivityBased', description: 'Avoiding specific foods that cause negative reactions', persianName: 'رژیم غذایی مبتنی بر حساسیت‌های غذایی' },
    { name: 'GlutenFree', description: 'No gluten-containing foods', persianName: 'بدون گلوتن' },
    { name: 'DairyFree', description: 'No dairy products', persianName: 'بدون لبنیات' },
    { name: 'LowCarb', description: 'Reduced carbohydrate intake', persianName: 'کم کربوهیدرات' },
    { name: 'Mediterranean', description: 'Based on traditional foods from Mediterranean countries', persianName: 'مدیترانه‌ای' },
    { name: 'Halal', description: 'Foods permissible under Islamic law', persianName: 'حلال' },
    { name: 'Kosher', description: 'Foods that adhere to Jewish dietary laws', persianName: 'کوشر' }
  ];

  console.log('Seeding food preferences...');
  for (const preference of foodPreferences) {
    try {
      await prisma.foodPreference.upsert({
        where: { name: preference.name },
        update: preference,
        create: preference,
      });
      console.log(`Created/updated food preference: ${preference.name}`);
    } catch (error) {
      console.error(`Error creating food preference ${preference.name}:`, error.message);
    }
  }

  // Seed sample product
  console.log('Seeding sample product...');
  await prisma.product.upsert({
    where: { barcode: '6260152300531' },
    update: {
      mainDataStatus: 2,
      cluster: 'روغن',
      childCluster: 'روغن آفتابگردان',
      productName: 'روغن آفتابگردان آفتاب 1.5 لیتر',
      brand: 'آفتاب',
      pictureOld: 'https://dkstatics-public.digikala.com/digikala-products/112753704.jpg',
      productDescription: 'روغن آفتابگردان آفتاب 1.5 لیتر',
      stateOfMatter: 0,
      per: 15,
      calorie: 124,
      sugar: 0,
      fat: 14,
      salt: 0,
      transfattyAcids: 0.14,
      monitor: 'admin'
    },
    create: {
      barcode: '6260152300531',
      mainDataStatus: 2,
      cluster: 'روغن',
      childCluster: 'روغن آفتابگردان',
      productName: 'روغن آفتابگردان آفتاب 1.5 لیتر',
      brand: 'آفتاب',
      pictureOld: 'https://dkstatics-public.digikala.com/digikala-products/112753704.jpg',
      productDescription: 'روغن آفتابگردان آفتاب 1.5 لیتر',
      stateOfMatter: 0,
      per: 15,
      calorie: 124,
      sugar: 0,
      fat: 14,
      salt: 0,
      transfattyAcids: 0.14,
      monitor: 'admin'
    }
  });

  // Seed activity level translations
  const activityLevels = [
    { level: 'SEDENTARY', persianName: 'فعالیت کم (بدون تحرک بدون پیاده روی و راه رفتن)' },
    { level: 'LOW', persianName: 'فعالیت کم' },
    { level: 'MODERATE', persianName: 'فعالیت متوسط (تحرک نسبی و راه رفتن)' },
    { level: 'HIGH', persianName: 'فعالیت زیاد (برنامه ورزشی و پیاده روی)' },
    { level: 'VERY_HIGH', persianName: 'فعالیت خیلی زیاد (کار سنگین و ورزش حرفه ای)' }
  ];

  console.log('Seeding activity level translations...');
  for (const activity of activityLevels) {
    try {
      await prisma.activityLevelTranslation.upsert({
        where: { level: activity.level },
        update: activity,
        create: activity,
      });
      console.log(`Created/updated activity level translation: ${activity.level}`);
    } catch (error) {
      console.error(`Error creating activity level translation ${activity.level}:`, error.message);
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 