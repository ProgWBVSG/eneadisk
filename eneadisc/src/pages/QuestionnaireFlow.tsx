import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QUESTIONNAIRE, QUESTION_OPTIONS } from '../data/questionnaireData';
import { calculateEnneagram, saveEnneagramResult, type QuestionnaireResponse } from '../utils/calculateEnneagram';
import { ENNEAGRAM_TYPES } from '../data/enneagramData';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const QuestionnaireFlow: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const question = QUESTIONNAIRE[currentQuestion];
    const options = QUESTION_OPTIONS[question.id] || [];
    const progress = ((currentQuestion + 1) / QUESTIONNAIRE.length) * 100;

    const handleNext = () => {
        if (selectedOption === null) return;

        const newResponse: QuestionnaireResponse = {
            questionId: question.id,
            selectedType: selectedOption
        };

        const newResponses = [...responses, newResponse];
        setResponses(newResponses);

        if (currentQuestion < QUESTIONNAIRE.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedOption(null);
        } else {
            // Finalizar cuestionario
            const result = calculateEnneagram(newResponses);
            if (user) {
                saveEnneagramResult(user.id, result);
            }

            const resultType = ENNEAGRAM_TYPES[result.primaryType];
            alert(`¡Test completado!\\n\\nTu eneatipo es: Tipo ${result.primaryType} - ${resultType.name}\\n\\n${resultType.description}`);

            if (user?.role === 'employee') {
                navigate('/dashboard/employee');
            } else {
                navigate('/dashboard/company');
            }
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            const previousResponse = responses[currentQuestion - 1];
            setSelectedOption(previousResponse.selectedType);
            setResponses(responses.slice(0, -1));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-medium text-slate-600">Descubre tu Eneatipo</h2>
                        <span className="text-sm text-slate-500">{currentQuestion + 1} de {QUESTIONNAIRE.length}</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
                        {question.text}
                    </h1>

                    {/* Options */}
                    <div className="space-y-3 mb-8">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedOption(option.type)}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedOption === option.type
                                    ? 'border-purple-500 bg-purple-50 shadow-md'
                                    : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                                    }`}
                            >
                                <span className="text-slate-700 font-medium">{option.text}</span>
                            </button>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-4">
                        {currentQuestion > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex-1"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            disabled={selectedOption === null}
                            className={`${currentQuestion === 0 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700`}
                        >
                            {currentQuestion === QUESTIONNAIRE.length - 1 ? 'Finalizar' : 'Siguiente'}
                            {currentQuestion < QUESTIONNAIRE.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Bottom Info */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    Responde con sinceridad. No hay respuestas correctas o incorrectas.
                </p>
            </div>
        </div>
    );
};
