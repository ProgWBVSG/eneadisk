// Solicitudes de ingreso (admisión con aprobación del admin)
import { supabase } from '../lib/supabase';

export interface PendingRequest { id: string; userId: string; fullName: string | null; email: string | null; createdAt: string; }

// El operario pide unirse con el código. Devuelve 'pending' | 'approved'.
export const requestToJoin = async (code: string): Promise<string> => {
  const { data, error } = await supabase.rpc('request_to_join', { p_code: code });
  if (error) throw error;
  return data as string;
};

// Estado de mi solicitud (para la pantalla de espera)
export const myJoinStatus = async (): Promise<{ status: string; companyName: string } | null> => {
  const { data } = await supabase.rpc('my_join_status');
  const row = Array.isArray(data) ? data[0] : null;
  return row ? { status: row.status, companyName: row.company_name } : null;
};

export const getPendingRequests = async (): Promise<PendingRequest[]> => {
  const { data, error } = await supabase.rpc('get_pending_join_requests');
  if (error) throw error;
  return (data || []).map((r: any) => ({ id: r.id, userId: r.user_id, fullName: r.full_name, email: r.email, createdAt: r.created_at }));
};

export const approveRequest = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('approve_join_request', { p_req: id });
  if (error) throw error;
};

export const rejectRequest = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('reject_join_request', { p_req: id });
  if (error) throw error;
};
