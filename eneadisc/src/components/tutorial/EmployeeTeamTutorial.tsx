import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, type Step, type EventData } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

interface Props {
  forceRun?: boolean;
  onResetComplete?: () => void;
}

export const EmployeeTeamTutorial: React.FC<Props> = ({ forceRun = false, onResetComplete }) => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `tutorial_employee_team_${user.id}`;
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
      title: '👥 Tu Equipo',
      content: 'En esta sección podés conocer mejor a tus compañeros de equipo: su eneatipo, su nivel de energía reciente y qué tan compatibles son sus estilos de trabajo con el tuyo.',
    },
    {
      target: '#tour-emp-team-list',
      content: 'Cada tarjeta representa a un compañero. Podés ver su eneatipo, cuántas tareas completó esta semana y su último estado de ánimo registrado.',
    },
    {
      target: '#tour-emp-team-dynamics',
      content: 'Aquí se analiza la dinámica global del equipo: qué tan diversa es la combinación de eneatipos, cuáles son las fortalezas colectivas y recomendaciones para colaborar mejor.',
    },
    {
      target: '#tour-emp-team-compatibility',
      content: 'Este panel muestra tu nivel de compatibilidad natural con cada compañero según sus eneatipos. ¡Úsalo para entender mejor las fricciones o sinergias que ya existían intuitivamente!',
    },
    {
      target: '#tour-emp-team-tasks',
      content: 'Acá ves las últimas tareas asignadas a tu equipo por la empresa. Es útil para saber en qué están trabajando los demás y cómo podés colaborar.',
    }
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`tutorial_employee_team_${user.id}`, 'true');
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
