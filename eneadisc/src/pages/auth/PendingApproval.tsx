import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { myJoinStatus } from '../../utils/joinRequests';

export const PendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'loading'>('loading');
  const [company, setCompany] = useState<string>('');

  const check = useCallback(async () => {
    // Si el usuario ya tiene empresa (aprobado), adentro.
    if (user?.companyId) { navigate('/questionnaire', { replace: true }); return; }
    const s = await myJoinStatus();
    if (!s) { setStatus('pending'); return; }
    setCompany(s.companyName || '');
    if (s.status === 'approved') {
      await refreshUser();
      navigate('/questionnaire', { replace: true });
    } else {
      setStatus(s.status as 'pending' | 'rejected');
    }
  }, [user?.companyId, navigate, refreshUser]);

  useEffect(() => {
    check();
    const t = setInterval(check, 6000); // poll cada 6s
    return () => clearInterval(t);
  }, [check]);

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-[#ECE3D8] p-8 text-center">
        {status === 'rejected' ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="text-red-500" size={32} />
            </div>
            <h1 className="text-xl font-display font-bold text-[#3A332E] mb-2">Solicitud no aprobada</h1>
            <p className="text-[#8A8079] text-sm mb-6">
              El administrador de <strong>{company || 'la empresa'}</strong> no aprobó tu ingreso.
              Si creés que es un error, contactá a tu empresa.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FCF1EC]">
              <Clock className="text-[#C9624A]" size={32} />
            </div>
            <h1 className="text-xl font-display font-bold text-[#3A332E] mb-2">Esperando aprobación</h1>
            <p className="text-[#8A8079] text-sm mb-6">
              Tu solicitud para unirte a <strong>{company || 'la empresa'}</strong> fue enviada.
              El administrador tiene que aprobarla para que puedas entrar. Te avisamos apenas suceda —
              esta pantalla se actualiza sola.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-[#8A8079] mb-6">
              <CheckCircle size={14} className="text-[#5F7A68]" /> Revisando estado automáticamente…
            </div>
          </>
        )}
        <button
          onClick={async () => { await logout(); navigate('/'); }}
          className="text-sm text-[#8A8079] hover:text-[#3A332E] underline"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
