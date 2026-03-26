-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  mrp NUMERIC NOT NULL DEFAULT 0,
  wholesale_rate NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);
CREATE POLICY "Public insert access for products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for products" ON products FOR UPDATE USING (true);
CREATE POLICY "Public delete access for products" ON products FOR DELETE USING (true);

-- Create Bills Table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_number TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for bills
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for bills" ON bills FOR SELECT USING (true);
CREATE POLICY "Public insert access for bills" ON bills FOR INSERT WITH CHECK (true);

-- Create Bill Items Table
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  product_id UUID, -- Optional link to product (UUID)
  product_name TEXT NOT NULL,
  mrp NUMERIC, -- Added for historical record
  rate NUMERIC NOT NULL,
  unit TEXT,
  quantity NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for bill_items
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for bill_items" ON bill_items FOR SELECT USING (true);
CREATE POLICY "Public insert access for bill_items" ON bill_items FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
