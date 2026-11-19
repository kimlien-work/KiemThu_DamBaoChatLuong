export function calculateLoyaltyPoints(orderTotal: number): number {
  if (!Number.isFinite(orderTotal) || orderTotal <= 0) return 0;
  return Math.floor(orderTotal / 10000);
}
