import { supabase, IS_MOCK } from '../lib/supabase';

const MOCK_BILLS = [];

export async function saveBill({ customerName, items, subtotal, discount, total, billNumber }) {
  if (IS_MOCK) {
    const bill = {
      id: String(Date.now()),
      bill_number: billNumber,
      customer_name: customerName,
      subtotal,
      discount,
      total_amount: total,
      created_at: new Date().toISOString(),
      bill_items: items.map(i => ({
        product_name: i.product.name,
        mrp: i.product.mrp,
        rate: i.product.wholesale_rate,
        quantity: i.quantity,
        subtotal: i.product.wholesale_rate * i.quantity,
        unit: i.product.unit,
      })),
    };
    MOCK_BILLS.unshift(bill);
    return { data: bill, error: null };
  }

  // Save the bill header
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .insert([{ customer_name: customerName, bill_number: billNumber, subtotal, discount, total_amount: total }])
    .select()
    .single();

  if (billError) return { data: null, error: billError };

  // Save the line items
  const lineItems = items.map(i => ({
    bill_id: bill.id,
    product_id: i.product.id,
    product_name: i.product.name,
    mrp: i.product.mrp,
    rate: i.product.wholesale_rate,
    unit: i.product.unit,
    quantity: i.quantity,
    subtotal: i.product.wholesale_rate * i.quantity,
  }));

  const { error: itemsError } = await supabase.from('bill_items').insert(lineItems);
  if (itemsError) return { data: null, error: itemsError };

  return { data: bill, error: null };
}

export async function getRecentBills(limit = 10) {
  if (IS_MOCK) {
    return { data: MOCK_BILLS.slice(0, limit), error: null };
  }
  return await supabase
    .from('bills')
    .select('*, bill_items(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function getSalesStats() {
  if (IS_MOCK) {
    const today = new Date().toISOString().split('T')[0];
    const todayBills = MOCK_BILLS.filter(b => b.created_at.startsWith(today));
    const todaySales = todayBills.reduce((sum, b) => sum + b.total_amount, 0);
    return {
      data: {
        todaySales,
        billsToday: todayBills.length,
        recentBillsCount: MOCK_BILLS.length,
      },
      error: null,
    };
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's bills for totals
    const { data: todayData, error: todayError } = await supabase
      .from('bills')
      .select('total_amount')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (todayError) throw todayError;

    // Get total count of all bills
    const { count, error: countError } = await supabase
      .from('bills')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const todaySales = todayData.reduce((sum, b) => sum + (b.total_amount || 0), 0);

    return {
      data: {
        todaySales,
        billsToday: todayData.length,
        recentBillsCount: count || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    return { data: { todaySales: 0, billsToday: 0, recentBillsCount: 0 }, error };
  }
}

export function generateBillNumber() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `BILL-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${String(Date.now()).slice(-4)}`;
}
