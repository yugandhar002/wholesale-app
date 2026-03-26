import { supabase } from './src/lib/supabase';

const MOCK_PRODUCTS = [
  { name: 'Basmati Rice (5kg)', category: 'Grains', mrp: 380, wholesale_rate: 320, unit: 'Bag' },
  { name: 'Whole Wheat Flour (10kg)', category: 'Grains', mrp: 340, wholesale_rate: 280, unit: 'Bag' },
  { name: 'Toor Dal (1kg)', category: 'Pulses', mrp: 175, wholesale_rate: 145, unit: 'Kg' },
  { name: 'Chana Dal (1kg)', category: 'Pulses', mrp: 135, wholesale_rate: 110, unit: 'Kg' },
  { name: 'Moong Dal (1kg)', category: 'Pulses', mrp: 155, wholesale_rate: 130, unit: 'Kg' },
  { name: 'Refined Sunflower Oil (1L)', category: 'Oils', mrp: 150, wholesale_rate: 125, unit: 'Bottle' },
  { name: 'Mustard Oil (1L)', category: 'Oils', mrp: 170, wholesale_rate: 140, unit: 'Bottle' },
  { name: 'Groundnut Oil (1L)', category: 'Oils', mrp: 200, wholesale_rate: 165, unit: 'Bottle' },
  { name: 'Sugar (1kg)', category: 'Essentials', mrp: 50, wholesale_rate: 42, unit: 'Kg' },
  { name: 'Salt (1kg)', category: 'Essentials', mrp: 22, wholesale_rate: 18, unit: 'Kg' },
  { name: 'Turmeric Powder (100g)', category: 'Spices', mrp: 35, wholesale_rate: 28, unit: 'Pack' },
  { name: 'Red Chilli Powder (100g)', category: 'Spices', mrp: 45, wholesale_rate: 35, unit: 'Pack' },
  { name: 'Coriander Powder (100g)', category: 'Spices', mrp: 30, wholesale_rate: 22, unit: 'Pack' },
  { name: 'Cumin Seeds (100g)', category: 'Spices', mrp: 55, wholesale_rate: 45, unit: 'Pack' },
  { name: 'Black Pepper (50g)', category: 'Spices', mrp: 70, wholesale_rate: 55, unit: 'Pack' },
  { name: 'Tea (250g)', category: 'Beverages', mrp: 105, wholesale_rate: 85, unit: 'Pack' },
  { name: 'Coffee (100g)', category: 'Beverages', mrp: 145, wholesale_rate: 120, unit: 'Pack' },
  { name: 'Poha (500g)', category: 'Breakfast', mrp: 48, wholesale_rate: 38, unit: 'Pack' },
  { name: 'Vermicelli (200g)', category: 'Breakfast', mrp: 28, wholesale_rate: 22, unit: 'Pack' },
  { name: 'Semolina / Rava (500g)', category: 'Grains', mrp: 40, wholesale_rate: 32, unit: 'Pack' },
];

async function seed() {
  console.log('Starting seed...');
  const { data, error } = await supabase.from('products').insert(MOCK_PRODUCTS);
  if (error) {
    console.error('Error seeding products:', error);
  } else {
    console.log('Successfully seeded products!');
  }
}

seed();
