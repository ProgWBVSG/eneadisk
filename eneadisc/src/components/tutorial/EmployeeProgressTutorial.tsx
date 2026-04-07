import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, type Step, type EventData } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

interface Props {
  forceRun?: boolean;
  onResetComplete?: () => void;
}

export const EmployeeProgressTutorial: React.FC<Props> = ({ forceRun = false, onResetComplete }) => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `tutorial_employee_progress_${user.id}`;
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
      title: '📈 Tu Proceso de Crecimiento',
      content: 'Esta sección consolida en un solo lugar todas las métricas que reflejan tu evolución: bienestar emocional, productividad y colaboración.',
    },
    {
      target: '#tour-emp-progress-stats',
      content: 'Estas 4 tarjetas muestran un resumen rápido: tus check-ins registrados, tareas completadas, score de colaboración con tu equipo y tu nivel de energía promedio.',
    },
    {
      target: '#tour-emp-progress-checkin-btn',
      content: 'Con el botón "Nuevo Check-in" podés registrar cómo te sentís hoy: tu estado de ánimo, energía y nivel de estrés. ¡Hacerlo regularmente mejora mucho la precisión de tus métricas!',
    },
    {
      target: '#tour-emp-progress-mood',
      content: 'Acá se grafica tu historial emocional de los últimos 30 días. Podés ver patrones en tu bienestar y detectar cuándo necesitás apoyo.',
    },
    {
      target: '#tour-emp-progress-tasks',
      content: 'Este panel mide tu productividad. Muestra el porcentaje de tareas completadas y el detalle de cuántas están en progreso o pendientes.',
    },
    {
      target: '#tour-emp-progress-radar',
      content: 'El radar muestra tu distribución de puntaje entre los 9 eneatipos. Tu tipo dominante siempre será el más pronunciado, pero los secundarios revelan facetas de tu personalidad.',
    }
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`tutorial_employee_progress_${user.id}`, 'true');
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
