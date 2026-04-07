import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, type Step, type EventData } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

interface Props {
  forceRun?: boolean;
  onResetComplete?: () => void;
}

export const EmployeeTasksTutorial: React.FC<Props> = ({ forceRun = false, onResetComplete }) => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `tutorial_employee_tasks_${user.id}`;
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
      title: '✅ Tus Tareas',
      content: 'Acá gestionás todas tus tareas: tanto las que creás vos mismo como las que te asigna tu empresa. ¡Mantenerlas actualizadas impacta directamente en tu score de progreso!',
    },
    {
      target: '#tour-emp-tasks-new-btn',
      content: 'Con este botón creás una nueva tarea personal. Podés asignarle prioridad (Alta, Media, Baja), categoría y fecha de vencimiento.',
    },
    {
      target: '#tour-emp-tasks-stats',
      content: 'Estas tarjetas muestran un resumen rápido de tu gestión: cuántas tareas tenés en total, completadas, en progreso y pendientes.',
    },
    {
      target: '#tour-emp-tasks-filters',
      content: 'Usá los filtros para ver sólo tus tareas personales, las asignadas por el equipo, o filtrá por estado. Muy útil cuando tenés muchas tareas acumuladas.',
    },
    {
      target: '#tour-emp-tasks-list',
      content: 'Acá aparecen tus tareas. Las tareas personales podés editarlas, eliminarlas y marcarlas como completadas o en progreso. Las asignadas por la empresa son de sólo lectura.',
    }
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`tutorial_employee_tasks_${user.id}`, 'true');
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
