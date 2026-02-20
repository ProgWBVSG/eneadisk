
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const joinSchema = z.object({
    code: z.string().length(6, "El código debe tener 6 caracteres"), // Adjusted validation for demo
});

type JoinData = z.infer<typeof joinSchema>;

export const EmployeeJoin: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JoinData>({
        resolver: zodResolver(joinSchema)
    });

    const onSubmit = async (data: JoinData) => {
        console.log("Joined with data:", data);
        // Mock validation
        await new Promise(resolve => setTimeout(resolve, 800));

        // In a real app, we would validate code against DB
        // Here we just accept mostly anything for demo, or could check localStorage if needed
        // But for "Entry Flow" demo, let's just succeed.

        const newUser = {
            id: 'emp-' + Math.random().toString(36).substring(7),
            role: 'employee' as const,
            companyId: 'mock-company-id'
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
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Unite a tu equipo</h1>
                <p className="text-slate-500 mb-8">Ingresa el código de invitación provisto por tu administrador.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        {...register("code")}
                        placeholder="Ej: ENEA-12"
                        className="text-center text-2xl tracking-widest uppercase"
                        // maxLength={6} 
                        error={errors.code?.message}
                    />
                    <Button type="submit" size="lg" className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white" isLoading={isSubmitting}>
                        Ingresar
                    </Button>
                </form>
                <button onClick={() => navigate('/')} className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline">
                    Volver al inicio
                </button>
            </div>
        </div>
    );
};
