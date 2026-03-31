import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, type Step, type EventData } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

interface Props {
  forceRun?: boolean;
  onResetComplete?: () => void;
}

export const AdminTutorial: React.FC<Props> = ({ forceRun = false, onResetComplete }) => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `tutorial_completed_${user.id}`;
    const hasCompleted = localStorage.getItem(key);
    
    if (forceRun) {
      setRun(true);
      return;
    }

    if (!hasCompleted && user.role === 'company_admin') {
      setRun(true);
    }
  }, [user, forceRun]);

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: '¡Bienvenido a Eneateams!',
      content: 'Vamos a darte un rápido recorrido por el Panel de Administración para que descubras cómo potenciar a tu equipo.',
    },
    {
      target: '#tour-stats',
      content: 'Aquí verás un resumen en tiempo real: empleados registrados, porcentaje de tests completados y tu código de invitación.',
    },
    {
      target: '#tour-invite-btn',
      content: 'Con este botón generarás un enlace automático para invitar a tus colaboradores. ¡Compártelo por el canal que prefieras!',
    },
    {
      target: '#tour-library-btn',
      content: 'Nuestra Biblioteca te enseña a fondo sobre los 9 eneatipos, perfecto para entender la dinámica de cada personalidad de tu equipo.',
    },
    {
      target: '#tour-sidebar',
      placement: 'right',
      content: 'Utiliza el menú lateral para acceder a la gestión detallada, gráficos de análisis y a nuestro Asistente de IA. ¡Eso es todo, a trabajar!',
    }
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`tutorial_completed_${user.id}`, 'true');
      }
      if (onResetComplete) {
        onResetComplete();
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleJoyrideEvent}
      options={{
        primaryColor: '#9333ea',
        showProgress: true,
        buttons: ['back', 'primary', 'skip']
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar Tutorial'
      }}
    />
  );
};
