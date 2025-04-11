require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/category');
const logger = require('../src/config/logger');
const fs = require('fs');


const categoriesData = `
Category,Subcategory
Agriculture and Food Industry,Agricultural Equipment
Agriculture and Food Industry,Food Grains
Agriculture and Food Industry,Dairy Products
Agriculture and Food Industry,Processed Foods
Apparel and Fashion,Men's Clothing
Apparel and Fashion,Women's Clothing
Apparel and Fashion,Footwear
Apparel and Fashion,Accessories
Automotive Industry,Vehicles
Automotive Industry,Auto Components
Automotive Industry,Garage Equipment
Construction and Real Estate,Building Materials
Construction and Real Estate,Construction Machinery
Construction and Real Estate,Real Estate Services
Electronics and Electrical,Consumer Electronics
Electronics and Electrical,Electrical Equipment
Electronics and Electrical,Electronic Components
Health and Medical,Medical Equipment
Health and Medical,Pharmaceuticals
Health and Medical,Healthcare Services
Industrial Machinery,Machinery
Industrial Machinery,Tools and Equipment
Industrial Machinery,Industrial Supplies
IT and Telecom,Software
IT and Telecom,Hardware
IT and Telecom,Telecommunication Services
Office Supplies,Furniture
Office Supplies,Stationery
Office Supplies,Office Automation
Packaging Industry,Packaging Materials
Packaging Industry,Packaging Machines
Chemical Industry,Industrial Chemicals
Chemical Industry,Agro Chemicals
Chemical Industry,Dyes & Pigments
Energy & Power,Renewable Energy
Energy & Power,Power Distribution Equipment
Energy & Power,Batteries & UPS
Education & Training,EdTech Solutions
Education & Training,Skill Development
Education & Training,Coaching & Tutoring
Printing & Publishing,Commercial Printing
Printing & Publishing,Publishing Services
Printing & Publishing,Packaging Design
Tourism & Hospitality,Hotels & Resorts
Tourism & Hospitality,Travel Agencies
Tourism & Hospitality,Catering Services
Security & Surveillance,CCTV & Surveillance
Security & Surveillance,Personal Security Services
Security & Surveillance,Safety Equipment
Beauty & Personal Care,Cosmetics
Beauty & Personal Care,Salon Equipment
Beauty & Personal Care,Skincare Products
Transportation & Logistics,Freight & Cargo Services
Transportation & Logistics,Vehicle Rentals
Transportation & Logistics,Warehousing Solutions
Environment & Waste Management,Recycling Equipment
Environment & Waste Management,Waste Disposal Services
Environment & Waste Management,Pollution Control Devices
Mining & Metals,Minerals & Ores
Mining & Metals,Metal Products
Mining & Metals,Mining Machinery
Handicrafts & Handlooms,Traditional Crafts
Handicrafts & Handlooms,Handmade Textiles
Handicrafts & Handlooms,Decor Items
Legal & Financial Services,Accounting & Taxation
Legal & Financial Services,Legal Consultancy
Legal & Financial Services,Investment & Insurance
Sports & Fitness,Gym Equipment
Sports & Fitness,Sports Gear
Sports & Fitness,Outdoor & Adventure
Events & Entertainment,Event Management
Events & Entertainment,Audio Visual Services
Events & Entertainment,Talent & Artist Booking
Pets & Animal Supplies,Pet Food & Accessories
Pets & Animal Supplies,Veterinary Products
Pets & Animal Supplies,Livestock Supplies
Home & Garden,Gardening Tools
Home & Garden,Home Decor
Home & Garden,Kitchen Essentials
Plastic & Rubber Industry,Plastic Raw Materials
Plastic & Rubber Industry,Molded Products
Plastic & Rubber Industry,Rubber Components
Advertising & Marketing,Digital Marketing Services
Advertising & Marketing,Printing & Signage
Advertising & Marketing,Market Research
Cleaning & Sanitation,Cleaning Chemicals
Cleaning & Sanitation,Housekeeping Services
Cleaning & Sanitation,Cleaning Machines
Toys & Baby Products,Educational Toys
Toys & Baby Products,Infant Products
Toys & Baby Products,Kids Apparel
`;

const seedCategories = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    console.log('Attempting to connect to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    });
    logger.info('Connected to MongoDB for seeding');

    await Category.deleteMany();
    logger.info('Cleared existing categories');

    const lines = categoriesData.trim().split('\n');
    if (lines.length < 2) throw new Error('No category data to seed');
    const headers = lines[0].split(',').map(header => header.trim());
    const data = lines.slice(1).map(line => {
      const [category, subcategory] = line.split(',').map(item => item.trim());
      return { category, subcategory: subcategory || null };
    });
  

    const categoryMap = new Map();

    for (const [index, item] of data.entries()) {
      if (item.category) {
        if (!categoryMap.has(item.category)) {
          const categoryDoc = new Category({ name: item.category });
          await categoryDoc.save();
          categoryMap.set(item.category, categoryDoc._id);
          logger.info('Seeded parent category', { index, name: item.category, id: categoryDoc._id });
        }
        if (item.subcategory) {
          const subCategoryDoc = new Category({
            name: item.subcategory,
            parentId: categoryMap.get(item.category),
          });
          await subCategoryDoc.save();
          logger.info('Seeded subcategory', { index, name: item.subcategory, parentId: categoryMap.get(item.category), id: subCategoryDoc._id });
        }
      }
    }

    logger.info('Categories seeding completed successfully', { totalCategories: categoryMap.size, totalSubcategories: data.length - categoryMap.size, totalEntries: data.length });
    process.exit(0);
  } catch (error) {
    logger.error('Seeding error:', { error: error.message, stack: error.stack });
    console.error('Seeding failed:', error.message, error.stack);
    process.exit(1);
  }
};

seedCategories();