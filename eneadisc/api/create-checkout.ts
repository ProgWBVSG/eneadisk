export const config = { runtime: 'edge' };

const CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        return new Response(JSON.stringify({ error: 'Stripe no está configurado. Agregá STRIPE_SECRET_KEY en Vercel.' }), { status: 500, headers: CORS });
    }

    try {
        const { priceId, companyId, planId, successUrl, cancelUrl } = await req.json() as {
            priceId: string;
            companyId: string;
            planId: string;
            successUrl: string;
            cancelUrl: string;
        };

        if (!priceId || !companyId) {
            return new Response(JSON.stringify({ error: 'Faltan parámetros requeridos' }), { status: 400, headers: CORS });
        }

        // Crear sesión de Stripe Checkout
        const checkoutRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                mode: 'subscription',
                'line_items[0][price]': priceId,
                'line_items[0][quantity]': '1',
                success_url: successUrl,
                cancel_url: cancelUrl,
                'metadata[company_id]': companyId,
                'metadata[plan_id]': planId,
                'subscription_data[metadata][company_id]': companyId,
                'subscription_data[metadata][plan_id]': planId,
                allow_promotion_codes: 'true',
            }).toString(),
        });

        if (!checkoutRes.ok) {
            const err = await checkoutRes.json() as { error?: { message?: string } };
            const msg = err?.error?.message || `Stripe error ${checkoutRes.status}`;
            return new Response(JSON.stringify({ error: msg }), { status: 502, headers: CORS });
        }

        const session = await checkoutRes.json() as { url: string; id: string };

        return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), { status: 200, headers: CORS });

    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        return new Response(JSON.stringify({ error: msg }), { status: 500, headers: CORS });
    }
}
