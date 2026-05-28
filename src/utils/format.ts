export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "0 đ";
  const num = Number(amount);
  if (isNaN(num)) return "0 đ";
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}
