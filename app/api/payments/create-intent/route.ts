import { NextRequest, NextResponse } from "next/server";
import { getStripeInstance } from "@/app/lib/stripe";

// POST /api/payments/create-intent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "pkr", customer, card, metadata = {} } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    const amountInCents = Math.round(Number(amount) * 100);
    const curr = (currency || "pkr").toLowerCase();
    const stripeInstance = getStripeInstance();

    if (stripeInstance) {
      try {
        let paymentMethodId: string | null = null;

        // If card details provided in test mode, map to safe Stripe token
        const cleanCard = (card?.number || "").replace(/\s/g, "");
        if (cleanCard) {
          let token = "tok_visa";
          if (cleanCard.startsWith("5")) token = "tok_mastercard";
          else if (cleanCard.startsWith("3")) token = "tok_amex";
          else if (cleanCard.startsWith("tok_")) token = cleanCard;

          try {
            const pm = await stripeInstance.paymentMethods.create({
              type: "card",
              card: { token } as any,
              billing_details: {
                name: card?.name || `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() || undefined,
                email: customer?.email || undefined,
                phone: customer?.phone || undefined,
              },
            });
            paymentMethodId = pm.id;
          } catch (pmErr: any) {
            console.warn("Could not create payment method token:", pmErr.message);
          }
        }

        const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";
        const intentParams: any = {
          amount: amountInCents,
          currency: curr,
          description: `Sillhouete Boutique Order - ${customer?.email || "Guest"}`,
          receipt_email: customer?.email,
          metadata: {
            customer_name: `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim(),
            customer_email: customer?.email || "",
            ...metadata,
          },
        };

        if (paymentMethodId) {
          intentParams.payment_method = paymentMethodId;
          intentParams.confirm = true;
          intentParams.return_url = `${origin}/order-success`;
        } else {
          intentParams.automatic_payment_methods = { enabled: true };
        }

        const paymentIntent = await stripeInstance.paymentIntents.create(intentParams);

        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          isMock: false,
        });
      } catch (stripeErr: any) {
        console.error("Stripe API error:", stripeErr.message);
        return NextResponse.json(
          {
            error: stripeErr.message || "Payment processing failed. Please check your card details and try again.",
          },
          { status: 400 }
        );
      }
    }

    // Sandboxed Test Payment Mode (Fallback when Stripe key is not live)
    const mockIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const mockClientSecret = `${mockIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`;

    return NextResponse.json({
      clientSecret: mockClientSecret,
      paymentIntentId: mockIntentId,
      amount: amountInCents,
      currency: curr,
      status: "succeeded",
      isMock: true,
      message: "Test payment intent created successfully",
    });
  } catch (err: any) {
    console.error("Error creating payment intent:", err);
    return NextResponse.json({ error: err.message || "Failed to initialize payment" }, { status: 500 });
  }
}

