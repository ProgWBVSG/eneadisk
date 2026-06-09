import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: string; // emoji opcional (ej: bandera)
  keywords?: string; // texto extra para mejorar el match
}

interface ComboboxProps {
  label?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  allowCustom?: boolean; // permite escribir un valor que no está en la lista
  emptyMessage?: string;
}

// Normaliza texto (saca tildes, minúsculas) para búsqueda flexible.
// Usa rango Unicode ̀-ͯ (marcas diacríticas combinantes) vía RegExp string
// para evitar incrustar caracteres combinantes literales en el código fuente.
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '');
}

export const Combobox: React.FC<ComboboxProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  error,
  allowCustom = false,
  emptyMessage = 'Sin resultados',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Label del valor seleccionado actual
  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  // Texto que se muestra en el input
  const displayValue = isOpen
    ? query
    : selectedOption
      ? `${selectedOption.icon ? selectedOption.icon + '  ' : ''}${selectedOption.label}`
      : allowCustom && value
        ? value
        : '';

  // Opciones filtradas según query
  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = normalize(query);
    return options.filter((o) => {
      const haystack = normalize(`${o.label} ${o.keywords || ''}`);
      return haystack.includes(q);
    });
  }, [options, query]);

  // Cerrar al clickear fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset highlighted al cambiar el filtro
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Scroll al elemento resaltado
  useEffect(() => {
    if (isOpen && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const openDropdown = () => {
    setIsOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const selectOption = (opt: ComboboxOption) => {
    onChange(opt.value);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightedIndex]) {
          selectOption(filtered[highlightedIndex]);
        } else if (allowCustom && query.trim()) {
          onChange(query.trim());
          setIsOpen(false);
          setQuery('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  // Si allowCustom y el usuario escribe algo no listado, guardarlo al perder foco
  const handleBlurCommit = () => {
    if (allowCustom && query.trim() && !filtered.some((o) => normalize(o.label) === normalize(query))) {
      onChange(query.trim());
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}

      <div className="relative">
        {/* Campo principal */}
        <div
          className={cn(
            'flex h-12 w-full items-center rounded-md border bg-white px-3 transition-all cursor-text',
            isOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-300',
            error && 'border-red-500'
          )}
          onClick={openDropdown}
        >
          {isOpen ? (
            <Search size={18} className="text-slate-400 shrink-0 mr-2" />
          ) : null}
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlurCommit}
            placeholder={selectedOption ? selectedOption.label : placeholder}
            className="flex-1 bg-transparent text-base placeholder:text-slate-400 focus:outline-none"
            readOnly={!isOpen}
          />
          <ChevronDown
            size={18}
            className={cn(
              'text-slate-400 shrink-0 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
            <ul ref={listRef} className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-slate-400 text-center">
                  {allowCustom && query.trim() ? (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onChange(query.trim());
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Usar "{query.trim()}"
                    </button>
                  ) : (
                    emptyMessage
                  )}
                </li>
              ) : (
                filtered.map((opt, i) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectOption(opt);
                      }}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                        i === highlightedIndex ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {opt.icon && <span className="text-lg shrink-0">{opt.icon}</span>}
                      <span className="flex-1">{opt.label}</span>
                      {opt.value === value && <Check size={16} className="text-blue-600 shrink-0" />}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
