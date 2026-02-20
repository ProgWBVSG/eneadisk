
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const signupSchema = z.object({
  code: z.string().min(6, "El código debe tener al menos 6 caracteres"),
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type SignupData = z.infer<typeof signupSchema>;

export const EmployeeSignup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupData) => {
    console.log("Employee signup with data:", data);
    await new Promise(resolve => setTimeout(resolve, 800));

    // In real app, validate code against backend
    const newUser = {
      id: 'emp-' + Math.random().toString(36).substring(7),
      role: 'employee' as const,
      companyId: 'mock-company-id',
      name: data.name,
      email: data.email
    };

    login(newUser);
    navigate('/questionnaire');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Users size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Crear Cuenta</h1>
        <p className="text-slate-500 mb-8">Ingresa el código de invitación de tu empresa</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <Input
            label="Código de Empresa"
            {...register("code")}
            placeholder="ENEA-1234"
            className="text-center uppercase"
            error={errors.code?.message}
          />
          <Input label="Nombre Completo" {...register("name")} error={errors.name?.message} />
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Teléfono" type="tel" {...register("phone")} error={errors.phone?.message} />
          <Input label="Contraseña" type="password" {...register("password")} error={errors.password?.message} />
          <Input label="Confirmar Contraseña" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />

          <Button type="submit" size="lg" className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white mt-6" isLoading={isSubmitting}>
            Crear Cuenta
          </Button>
        </form>

        <button onClick={() => navigate('/auth/employee/login')} className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline">
          ¿Ya tenés cuenta? Inicia sesión
        </button>
      </div>
    </div>
  );
};
