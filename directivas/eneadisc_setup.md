# DIRECTIVA: ENEADISC_SETUP

> **ID:** ENEA-INIT-001
> **Script Asociado:** `scripts/init_eneadisc.py`
> **Última Actualización:** 2026-01-25
> **Estado:** ACTIVO

---

## 1. Objetivos y Alcance
- **Objetivo Principal:** Inicializar la PWA ENEADISC con el stack definido (Vite + React + TS, Tailwind).
- **Criterio de Éxito:** El proyecto `eneadisc` existe, compila sin errores (`npm run build`) y tiene la estructura de carpetas definida.

## 2. Especificaciones de Entrada/Salida (I/O)

### Entradas (Inputs)
- **Argumentos Requeridos:** Ninguno (Script autónomo).
- **Directorio Raíz:** El script se ejecuta desde `c:/Users/benja/EneaDisk`.

### Salidas (Outputs)
- **Artefactos Generados:**
  - `eneadisc/`: Directorio del proyecto.
  - `eneadisc/tailwind.config.js`: Configurado con paleta ENEADISC.
  - `eneadisc/src/`: Estructura de carpetas (`components`, `pages`, etc.).
- **Retorno de Consola:**
  - Mensaje: "ENEADISC Initialization Complete. Ready to start dev server."

## 3. Flujo Lógico (Algoritmo)

1.  **Validación de Entorno:** Verificar que `node` y `npm` estén accesibles. Verificar que el directorio `eneadisc` no exista (o pedir confirmación para limpiar).
2.  **Generación del Proyecto:** Ejecutar `npm create vite@latest eneadisc -- --template react-ts`.
3.  **Instalación de Dependencias:**
    *   Entrar a `eneadisc`.
    *   Ejecutar `npm install`.
    *   Instalar libs Core: `react-router-dom`, `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge`, `react-hook-form`, `zod`.
4.  **Configuración de Tailwind:**
    *   Instalar devDeps: `tailwindcss`, `postcss`, `autoprefixer`.
    *   Inicializar: `npx tailwindcss init -p`.
    *   **Sobreescribir** `tailwind.config.js` con:
        *   Colores: Gold `#D4AF37`, LightGold `#F4E4C1`, DeepBlue `#1A3A52`, Emerald `#2C7873`.
        *   Fuentes: `Poppins`.
5.  **Estructura de Carpetas:**
    *   Crear `src/components/{common,layout}`.
    *   Crear `src/pages/{auth,admin,colaborador}`.
    *   Crear `src/hooks`, `src/context`, `src/types`, `src/utils`.
6.  **Estilos Globales:**
    *   Crear `src/index.css` importando directivas de Tailwind y fuente Poppins.

## 4. Herramientas y Librerías
- **Lenguaje Script:** Python (`subprocess` para comandos de shell).
- **CLI Tools:** `npm`, `npx`.

## 5. Restricciones y Casos Borde (Edge Cases)
- **Conexión a Internet:** Requerida para `npm install`. Capturar error si falla.
- **Permisos de Escritura:** Script debe tener permisos para crear carpetas en el root.
- **Tiempos de Espera:** `npm install` puede tardar. No establecer timeout corto.

## 6. Protocolo de Errores y Aprendizajes (Memoria Viva)

| Fecha | Error Detectado | Causa Raíz | Solución/Parche Aplicado |
|-------|-----------------|------------|--------------------------|
| N/A | N/A | N/A | N/A |

## 7. Ejemplos de Uso

```bash
python scripts/init_eneadisc.py
```

## 8. Checklist de Pre-Ejecución
- [ ] Node.js instalado.
- [ ] Conexión a internet estable.

## 9. Checklist Post-Ejecución
- [ ] Carpeta `eneadisc` creada.
- [ ] `npm run build` exitoso dentro de `eneadisc`.
- [ ] `tailwind.config.js` contiene colotres personalizados.

## 10. Notas Adicionales
- Usar `subprocess.run(..., shell=True, check=True)` para manejar errores de comandos npm.
