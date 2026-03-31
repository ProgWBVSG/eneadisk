import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, type Step, type EventData } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

interface Props {
  forceRun?: boolean;
  onResetComplete?: () => void;
}

export const TeamsTutorial: React.FC<Props> = ({ forceRun = false, onResetComplete }) => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `tutorial_teams_completed_${user.id}`;
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
      title: 'Gestión de Equipos 👥',
      content: 'Bienvenido al creador de grupos. Aquí agruparás a tus empleados por departamentos o proyectos.',
    },
    {
      target: '#tour-teams-header',
      content: 'En esta sección podrás visualizar de un vistazo el recuento y estado general de tus miembros agrupados.',
    },
    {
      target: '#tour-create-team',
      content: '¡Crea tu primer equipo aquí! Asignale un nombre y luego podrás añadir a los empleados que se vayan registrando.',
    },
    {
      target: '#tour-teams-list',
      placement: 'top',
      content: 'Aquí aparecerán las tarjetas de tus equipos formados. Podrás entrar a ver métricas específicas de cada uno, editarlos o borrarlos.',
    }
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`tutorial_teams_completed_${user.id}`, 'true');
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
        skip: 'Saltar'
      }}
    />
  );
};
