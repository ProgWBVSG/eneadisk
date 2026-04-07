import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, type Step, type EventData } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

interface Props {
  forceRun?: boolean;
  onResetComplete?: () => void;
}

export const EmployeeTutorial: React.FC<Props> = ({ forceRun = false, onResetComplete }) => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `tutorial_employee_completed_${user.id}`;
    const hasCompleted = localStorage.getItem(key);

    if (forceRun) {
      setRun(true);
      return;
    }

    if (!hasCompleted && user.role === 'employee') {
      setRun(true);
    }
  }, [user, forceRun]);

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: '¡Bienvenido a Eneateams!',
      content: 'Esta es tu plataforma personal de autoconocimiento y crecimiento profesional. Te haremos un recorrido rápido para que saques el máximo provecho.',
    },
    {
      target: '#tour-emp-profile-header',
      content: 'Aquí aparece tu Eneatipo principal. Es la base de todo tu perfil: describe tu estilo de personalidad, cómo procesas el mundo y cómo te relacionás con los demás.',
    },
    {
      target: '#tour-emp-profile-motivation',
      content: 'Descubrí tu motivación más profunda y el miedo que impulsa muchas de tus decisiones. Entender esto es el primer paso para el crecimiento personal.',
    },
    {
      target: '#tour-emp-profile-strengths',
      content: 'Estas son tus fortalezas naturales. ¡Usá esto para identificar en qué rol podés brillar dentro de tu equipo!',
    },
    {
      target: '#tour-emp-profile-compatibility',
      content: 'Aquí ves con qué eneatipos trabajás mejor de forma natural. Te ayuda a entender las dinámicas con tus compañeros.',
    },
    {
      target: '#tour-sidebar',
      placement: 'right',
      content: 'Usá el menú lateral para explorar tu Progreso, Tareas, Equipo y Check-ins. Cada sección tiene su propio tour que se activará la primera vez que la visites. ¡Empezá a explorar!',
    }
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`tutorial_employee_completed_${user.id}`, 'true');
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
