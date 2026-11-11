import Stripe from "stripe";

export function parsePriceToNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let s = String(val).trim();
  s = s.replace(/^(Rs\.?|PKR|USD|\$|£|€|CAD\s*\$)\s*/i, "").trim();
  s = s.replace(/,/g, "");
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return 0;
  const n = parseFloat(m[0]);
  return isNaN(n) ? 0 : n;
}

export function getStripeInstance(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  if (secretKey && !secretKey.includes("MockTestKey")) {
    try {
      return new Stripe(secretKey, {
        apiVersion: "2025-02-24.acacia" as any,
      });
    } catch (err: any) {
      console.warn("Stripe initialization skipped:", err.message);
    }
  }
  return null;
}

