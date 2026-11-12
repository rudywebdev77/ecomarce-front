import { PATCH as updateOrder, PUT as putOrder } from "../route";

export const dynamic = "force-dynamic";

// PATCH/PUT /api/orders/:id/status
export const PATCH = updateOrder;
export const PUT = putOrder;

