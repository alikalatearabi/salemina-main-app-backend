import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  for (const illness of illnesses) {
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
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 