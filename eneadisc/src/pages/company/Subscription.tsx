import React, { useState, useEffect } from 'react';
import { Check, Zap, Building2, Rocket, Crown, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useSearchParams } from 'react-router-dom';

// ── Planes ────────────────────────────────────────────────────
interface Plan {
  id: 'free' | 'starter' | 'growth' | 'enterprise';
  name: string;
  price: number;
  priceLabel: string;
  employeeLimit: number | null;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  features: string[];
  priceId: string; // Stripe Price ID
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    priceLabel: '$0',
    employeeLimit: 3,
    icon: <Zap size={24} />,
    color: 'slate',
    features: [
      'Hasta 3 empleados',
      'Cuestionario de eneagrama',
      'Perfil individual',
      'Dashboard básico',
    ],
    priceId: '',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceLabel: '$29 / mes',
    employeeLimit: 10,
    icon: <Building2 size={24} />,
    color: 'blue',
    features: [
      'Hasta 10 empleados',
      'Todo del plan Gratis',
      'Gestión de equipos',
      'Analytics de productividad',
      'Check-ins emocionales',
      'Asistente IA básico',
    ],
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || '',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 79,
    priceLabel: '$79 / mes',
    employeeLimit: 50,
    icon: <Rocket size={24} />,
    color: 'purple',
    badge: 'Más popular',
    features: [
      'Hasta 50 empleados',
      'Todo del plan Starter',
      'Analytics avanzados',
      'Seguimiento y evolución',
      'Exportación de datos',
      'Asistente IA completo',
      'Soporte prioritario',
    ],
    priceId: import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID || '',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceLabel: '$199 / mes',
    employeeLimit: null,
    icon: <Crown size={24} />,
    color: 'amber',
    features: [
      'Empleados ilimitados',
      'Todo del plan Growth',
      'Múltiples admins',
      'API access',
      'Onboarding dedicado',
      'SLA garantizado',
      'Factura personalizada',
    ],
    priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID || '',
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; btn: string; badge: string }> = {
  slate:    { bg: 'bg-slate-50',  text: 'text-slate-700', border: 'border-slate-200', btn: 'bg-slate-700 hover:bg-slate-800', badge: 'bg-slate-100 text-slate-700' },
  blue:     { bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200',  btn: 'bg-blue-600 hover:bg-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  purple:   { bg: 'bg-purple-50', text: 'text-purple-700',border: 'border-purple-200',btn: 'bg-purple-600 hover:bg-purple-700',badge: 'bg-purple-600 text-white' },
  amber:    { bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-200', btn: 'bg-amber-500 hover:bg-amber-600',  badge: 'bg-amber-100 text-amber-700' },
};

// ── Component ─────────────────────────────────────────────────
export const Subscription: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Leer resultado de Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success === 'true') {
      setToast({ type: 'success', msg: '¡Pago exitoso! Tu plan fue actualizado.' });
      setTimeout(() => setToast(null), 6000);
    } else if (canceled === 'true') {
      setToast({ type: 'error', msg: 'El pago fue cancelado. Podés intentarlo de nuevo cuando quieras.' });
      setTimeout(() => setToast(null), 5000);
    }
  }, [searchParams]);

  // Cargar suscripción actual y conteo de empleados
  useEffect(() => {
    const load = async () => {
      if (!user?.companyId) return;
      setIsLoading(true);

      const [subRes, empRes] = await Promise.all([
        supabase.from('subscriptions').select('plan, status, current_period_end, employee_limit').eq('company_id', user.companyId).maybeSingle(),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('company_id', user.companyId).eq('role', 'employee'),
      ]);

      if (subRes.data) setCurrentPlan(subRes.data.plan);
      if (empRes.count !== null) setEmployeeCount(empRes.count);
      setIsLoading(false);
    };
    load();
  }, [user?.companyId]);

  const handleUpgrade = async (plan: Plan) => {
    if (plan.id === 'free' || plan.id === currentPlan) return;
    if (!plan.priceId) {
      setToast({ type: 'error', msg: 'Este plan no está disponible aún. Contactanos en hola@eneateams.com' });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          companyId: user?.companyId,
          planId: plan.id,
          successUrl: `${window.location.origin}/dashboard/company/suscripcion?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/company/suscripcion?canceled=true`,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'No se pudo iniciar el checkout');
      }
    } catch (err) {
      setToast({ type: 'error', msg: err instanceof Error ? err.message : 'Error al procesar el pago' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setLoadingPlanId(null);
    }
  };

  const currentPlanData = PLANS.find(p => p.id === currentPlan) || PLANS[0];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Planes y Suscripción</h1>
            <p className="text-slate-500 text-sm mt-0.5">Elegí el plan que mejor se adapte a tu equipo</p>
          </div>
        </div>

        {/* Estado actual */}
        {!isLoading && (
          <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${COLOR_MAP[currentPlanData.color].bg}`}>
                <span className={COLOR_MAP[currentPlanData.color].text}>{currentPlanData.icon}</span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Plan actual</p>
                <p className="text-lg font-bold text-slate-900">{currentPlanData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <span>👥 <strong>{employeeCount}</strong> empleados / {currentPlanData.employeeLimit ? currentPlanData.employeeLimit : '∞'}</span>
              {currentPlanData.employeeLimit && employeeCount >= currentPlanData.employeeLimit * 0.8 && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <AlertCircle size={14} /> Cerca del límite
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Planes */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const colors = COLOR_MAP[plan.color];
          const isCurrent = plan.id === currentPlan;
          const isUpgrade = PLANS.indexOf(plan) > PLANS.findIndex(p => p.id === currentPlan);

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 flex flex-col transition-shadow hover:shadow-lg ${
                isCurrent ? `${colors.border} shadow-md` : 'border-slate-200'
              } ${plan.badge ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
            >
              {/* Badge "Más popular" */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${colors.badge}`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan actual badge */}
              {isCurrent && (
                <div className="absolute -top-3.5 right-4">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200">
                    ✓ Plan actual
                  </span>
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Icono y nombre */}
                <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-4`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-extrabold text-slate-900">{plan.priceLabel.split(' / ')[0]}</span>
                  {plan.price > 0 && <span className="text-slate-500 text-sm ml-1">/ mes</span>}
                </div>
                <p className="text-sm text-slate-500 mb-5">
                  {plan.employeeLimit ? `Hasta ${plan.employeeLimit} empleados` : 'Empleados ilimitados'}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check size={15} className={`${colors.text} shrink-0 mt-0.5`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="w-full py-2.5 text-center text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
                    Plan activo
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={!!loadingPlanId || !isUpgrade}
                    className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors.btn}`}
                  >
                    {loadingPlanId === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Redirigiendo...
                      </span>
                    ) : isUpgrade ? (
                      `Actualizar a ${plan.name}`
                    ) : (
                      'Plan inferior'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ / Nota */}
      <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
        <h4 className="font-semibold text-slate-900 mb-3">Preguntas frecuentes</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-slate-800">¿Puedo cambiar de plan en cualquier momento?</p>
            <p className="mt-1">Sí. Podés actualizar tu plan cuando quieras. El costo se prorratea automáticamente.</p>
          </div>
          <div>
            <p className="font-medium text-slate-800">¿Qué pasa si supero el límite de empleados?</p>
            <p className="mt-1">Te avisamos cuando estés cerca del límite. Nuevos empleados no podrán unirse hasta que actualices el plan.</p>
          </div>
          <div>
            <p className="font-medium text-slate-800">¿Los pagos son seguros?</p>
            <p className="mt-1">Todos los pagos se procesan via Stripe, el estándar de la industria para pagos online.</p>
          </div>
          <div>
            <p className="font-medium text-slate-800">¿Hay período de prueba?</p>
            <p className="mt-1">El plan Gratis no expira. Para planes pagos, contactanos para un trial de 14 días.</p>
          </div>
        </div>
        <p className="mt-4 text-slate-500">Consultas: <a href="mailto:hola@eneateams.com" className="text-blue-600 underline">hola@eneateams.com</a></p>
      </div>
    </div>
  );
};
