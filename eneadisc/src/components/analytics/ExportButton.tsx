import React, { useState, useRef } from 'react';
import { Download, Image, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { CompanyWideAnalytics } from '../../utils/analytics';

interface ExportButtonProps {
    analytics: CompanyWideAnalytics;
    containerRef: React.RefObject<HTMLDivElement | null>;
    periodLabel: string;
    teamFilter: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
    analytics,
    containerRef,
    periodLabel,
    teamFilter
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    /**
     * Export dashboard as PNG image
     */
    const exportToPNG = async () => {
        if (!containerRef.current) {
            alert('No se pudo acceder al contenedor del dashboard');
            return;
        }

        setIsExporting(true);

        try {
            // Generate filename with date
            const date = new Date().toISOString().split('T')[0];
            const teamName = teamFilter === 'all' ? 'todos-equipos' : teamFilter;
            const filename = `analytics-${teamName}-${periodLabel}-${date}.png`;

            // Convert to PNG
            const dataUrl = await toPng(containerRef.current, {
                quality: 0.95,
                pixelRatio: 2, // Higher quality
                backgroundColor: '#ffffff'
            });

            // Download
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();

            setIsOpen(false);
        } catch (error) {
            console.error('Error al exportar PNG:', error);
            alert('Error al exportar la imagen. Por favor intenta de nuevo.');
        } finally {
            setIsExporting(false);
        }
    };

    /**
     * Export analytics data as CSV
     */
    const exportToCSV = () => {
        setIsExporting(true);

        try {
            // Build CSV content
            let csvContent = '';

            // Header
            csvContent += 'Reporte de Analytics EneaTeams\n';
            csvContent += `Período: ${periodLabel}\n`;
            csvContent += `Fecha de generación: ${new Date().toLocaleDateString()}\n\n`;

            // Company-wide metrics
            csvContent += 'MÉTRICAS GENERALES\n';
            csvContent += 'Métrica,Valor\n';
            csvContent += `Tasa de Completación General,${analytics.overallCompletionRate.toFixed(1)}%\n`;
            csvContent += `Mood Promedio General,${analytics.overallMoodScore.toFixed(1)}/5\n`;
            csvContent += `Total Tareas Completadas,${analytics.totalTasksCompleted}\n`;
            csvContent += `Total Check-ins,${analytics.totalCheckIns}\n`;
            csvContent += `Número de Equipos,${analytics.teams.length}\n\n`;

            // Team-by-team metrics
            csvContent += 'MÉTRICAS POR EQUIPO\n';
            csvContent += 'Equipo,Miembros,Completación %,Velocidad (tareas/sem),Mood Promedio,Tareas Atrasadas,Índice de Estrés %\n';

            analytics.teams.forEach(team => {
                csvContent += `${team.teamName},`;
                csvContent += `${team.memberCount},`;
                csvContent += `${team.completionRate.toFixed(1)},`;
                csvContent += `${team.velocityPerWeek.toFixed(1)},`;
                csvContent += `${team.avgMoodScore.toFixed(1)},`;
                csvContent += `${team.tasksOverdue},`;
                csvContent += `${team.stressIndex.toFixed(1)}\n`;
            });

            // Insights summary
            csvContent += '\nINSIGHTS PRINCIPALES\n';
            csvContent += 'Tipo,Prioridad,Título,Descripción\n';

            analytics.insights.slice(0, 10).forEach(insight => {
                const title = insight.title.replace(/,/g, ';'); // Avoid CSV comma issues
                const desc = insight.description.replace(/,/g, ';');
                csvContent += `${insight.type},${insight.priority},${title},${desc}\n`;
            });

            // Create download
            const date = new Date().toISOString().split('T')[0];
            const teamName = teamFilter === 'all' ? 'todos-equipos' : teamFilter;
            const filename = `analytics-data-${teamName}-${periodLabel}-${date}.csv`;

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.click();

            URL.revokeObjectURL(url);
            setIsOpen(false);
        } catch (error) {
            console.error('Error al exportar CSV:', error);
            alert('Error al exportar los datos. Por favor intenta de nuevo.');
        } finally {
            setIsExporting(false);
        }
    };

    /**
     * Copy metrics summary to clipboard
     */
    const copyToClipboard = async () => {
        setIsExporting(true);

        try {
            // Build text summary
            let text = '📊 RESUMEN DE ANALYTICS - EneaTeams\n\n';
            text += `📅 Período: ${periodLabel}\n`;
            text += `👥 Equipos analizados: ${analytics.teams.length}\n\n`;

            text += '📈 MÉTRICAS GENERALES:\n';
            text += `• Completación: ${analytics.overallCompletionRate.toFixed(1)}%\n`;
            text += `• Mood Promedio: ${analytics.overallMoodScore.toFixed(1)}/5\n`;
            text += `• Tareas Completadas: ${analytics.totalTasksCompleted}\n`;
            text += `• Check-ins: ${analytics.totalCheckIns}\n\n`;

            text += '🏢 EQUIPOS:\n';
            analytics.teams.forEach(team => {
                text += `\n${team.teamName}:\n`;
                text += `  • Completación: ${team.completionRate.toFixed(1)}%\n`;
                text += `  • Velocidad: ${team.velocityPerWeek.toFixed(1)} tareas/sem\n`;
                text += `  • Mood: ${team.avgMoodScore.toFixed(1)}/5\n`;
                text += `  • Atrasadas: ${team.tasksOverdue}\n`;
            });

            // Copy to clipboard
            await navigator.clipboard.writeText(text);

            // Show success briefly
            setTimeout(() => setIsOpen(false), 1000);
        } catch (error) {
            console.error('Error al copiar:', error);
            alert('Error al copiar al portapapeles. Por favor intenta de nuevo.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
            >
                {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Download className="w-4 h-4" />
                )}
                <span className="font-medium">Exportar</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && !isExporting && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <button
                        onClick={exportToPNG}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-3"
                    >
                        <Image className="w-4 h-4 text-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-slate-900">Exportar como PNG</p>
                            <p className="text-xs text-slate-500">Imagen del dashboard</p>
                        </div>
                    </button>

                    <button
                        onClick={exportToCSV}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-3"
                    >
                        <FileText className="w-4 h-4 text-green-600" />
                        <div>
                            <p className="text-sm font-medium text-slate-900">Exportar como CSV</p>
                            <p className="text-xs text-slate-500">Datos en tabla</p>
                        </div>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                        onClick={copyToClipboard}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-3"
                    >
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        <div>
                            <p className="text-sm font-medium text-slate-900">Copiar resumen</p>
                            <p className="text-xs text-slate-500">Al portapapeles</p>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};
