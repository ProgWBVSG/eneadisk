import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, type Step, type EventData } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

interface Props {
  forceRun?: boolean;
  onResetComplete?: () => void;
}

export const AITutorial: React.FC<Props> = ({ forceRun = false, onResetComplete }) => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `tutorial_ai_completed_${user.id}`;
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
      title: '¡Conoce a tu Asistente de IA! 🤖',
      content: 'Este asistente lee todas las dinámicas y eneatipos de tu empresa de forma privada para darte consejos.',
    },
    {
      target: '#tour-ai-header',
      content: 'Desde aquí puedes comprobar si la conexión con la Inteligencia Artificial está en línea y lista para ayudarte.',
    },
    {
      target: '#tour-ai-chat',
      placement: 'top',
      content: 'Este es el espacio conversacional. El asistente te enviará reportes analíticos, advertencias y leerá en tiempo real el ritmo de trabajo.',
    },
    {
      target: '#tour-ai-prompts',
      placement: 'top',
      content: '¿No sabes qué preguntar? Usa estas sugerencias rápidas diseñadas por psicólogos para obtener insights inmediatos del equipo.',
    },
    {
      target: '#tour-ai-input',
      placement: 'top',
      content: 'O simplemente consúltale tus propias dudas específicas. El modelo está entrenado en la teoría del Eneagrama corporativo.',
    }
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`tutorial_ai_completed_${user.id}`, 'true');
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
