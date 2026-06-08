// Stripe webhook handler — actualiza la suscripción en Supabase cuando se paga
export const config = { runtime: 'edge' };

const EMPLOYEE_LIMITS: Record<string, number | null> = {
    free: 3,
    starter: 10,
    growth: 50,
    enterprise: null,
};

async function updateSubscription(companyId: string, planId: string, stripeData: {
    customerId?: string;
    subscriptionId?: string;
    periodEnd?: number;
    status: string;
}) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase env vars not configured in webhook');
        return;
    }

    const employeeLimit = EMPLOYEE_LIMITS[planId] ?? 3;

    const body = {
        company_id: companyId,
        plan: planId,
        status: stripeData.status,
        stripe_customer_id: stripeData.customerId,
        stripe_subscription_id: stripeData.subscriptionId,
        current_period_end: stripeData.periodEnd ? new Date(stripeData.periodEnd * 1000).toISOString() : null,
        employee_limit: employeeLimit,
        updated_at: new Date().toISOString(),
    };

    await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(body),
    });
}

export default async function handler(req: Request): Promise<Response> {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return new Response('Webhook secret not configured', { status: 500 });
    }

    // Verificar firma de Stripe (usando Web Crypto API, compatible con Edge)
    const signature = req.headers.get('stripe-signature');
    if (!signature) return new Response('Missing signature', { status: 400 });

    const body = await req.text();

    try {
        // Extraer timestamp y signature de la cabecera
        const parts = signature.split(',');
        const tPart = parts.find(p => p.startsWith('t='));
        const v1Part = parts.find(p => p.startsWith('v1='));

        if (!tPart || !v1Part) return new Response('Invalid signature format', { status: 400 });

        const timestamp = tPart.slice(2);
        const expectedSig = v1Part.slice(3);
        const signedPayload = `${timestamp}.${body}`;

        // HMAC-SHA256 verification
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(webhookSecret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const sigBytes = Uint8Array.from(expectedSig.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
        const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(signedPayload));

        if (!isValid) return new Response('Invalid signature', { status: 400 });

        // Parsear evento
        const event = JSON.parse(body) as { type: string; data: { object: Record<string, unknown> } };

        // Manejar eventos relevantes
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as {
                metadata?: { company_id?: string; plan_id?: string };
                customer?: string;
                subscription?: string;
            };
            const companyId = session.metadata?.company_id;
            const planId = session.metadata?.plan_id || 'starter';

            if (companyId) {
                await updateSubscription(companyId, planId, {
                    customerId: session.customer as string,
                    subscriptionId: session.subscription as string,
                    status: 'active',
                });
            }
        }

        if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
            const sub = event.data.object as {
                metadata?: { company_id?: string; plan_id?: string };
                customer?: string;
                id?: string;
                status?: string;
                current_period_end?: number;
            };
            const companyId = sub.metadata?.company_id;
            const planId = sub.metadata?.plan_id || 'starter';

            if (companyId) {
                await updateSubscription(companyId, planId, {
                    customerId: sub.customer as string,
                    subscriptionId: sub.id,
                    periodEnd: sub.current_period_end,
                    status: sub.status === 'active' ? 'active' : (sub.status || 'active'),
                });
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            const sub = event.data.object as {
                metadata?: { company_id?: string };
                customer?: string;
                id?: string;
            };
            const companyId = sub.metadata?.company_id;
            if (companyId) {
                await updateSubscription(companyId, 'free', {
                    customerId: sub.customer as string,
                    subscriptionId: sub.id,
                    status: 'canceled',
                });
            }
        }

        if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object as {
                subscription_details?: { metadata?: { company_id?: string; plan_id?: string } };
                customer?: string;
                subscription?: string;
            };
            const companyId = invoice.subscription_details?.metadata?.company_id;
            const planId = invoice.subscription_details?.metadata?.plan_id || 'starter';
            if (companyId) {
                await updateSubscription(companyId, planId, {
                    customerId: invoice.customer as string,
                    subscriptionId: invoice.subscription as string,
                    status: 'past_due',
                });
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('Webhook error:', err);
        return new Response('Webhook processing failed', { status: 500 });
    }
}
