import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, type Step, type EventData } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

interface Props {
  forceRun?: boolean;
  onResetComplete?: () => void;
}

export const LibraryTutorial: React.FC<Props> = ({ forceRun = false, onResetComplete }) => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `tutorial_library_completed_${user.id}`;
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
      title: 'Biblioteca de Eneatipos 📚',
      content: 'El Eneagrama se basa en 9 estilos fundamentales de personalidad. Aquí puedes estudiarlos todos.',
    },
    {
      target: '#tour-lib-header',
      content: 'Esta es tu herramienta de estudio diario para comprender por qué tus empleados actúan de ciertas maneras.',
    },
    {
      target: '#tour-lib-card-0',
      content: 'Haz clic en cualquiera de estos tipos para desplegar sus miedos, motivaciones y áreas de desarrollo exactas. ¡Empieza por el Tipo 1!',
    }
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`tutorial_library_completed_${user.id}`, 'true');
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
