# Inicialización de Proyecto - Protocolo de Ejecución (SOP)

**Objetivo:** Configurar la estructura base del proyecto y generar archivos de configuración esenciales.
**Scope:** Creación de `.gitignore`, `.env`, `requirements.txt` y validación de carpetas.

## 1. Entradas y Configuración
*   **Directorio raíz:** El script debe ejecutarse desde la raíz del proyecto.
*   **No requiere variables de entorno previas.**

## 2. Pasos Lógicos (Algoritmo)
1.  **Verificar/Crear Directorios:**
    *   Asegurar existencia de: `directivas/`, `scripts/`, `.tmp/`.
2.  **Generar `.gitignore`:**
    *   Contenido: `.env`, `.tmp/`, `__pycache__/`, `.vscode/`, `*.log`.
3.  **Generar `.env` (si no existe):**
    *   Contenido base: `# Variables de entorno\nENV_TYPE=development`.
4.  **Generar `requirements.txt`:**
    *   Contenido inicial: `python-dotenv`, `requests`. (Agregar otros comunes si es necesario).
5.  **Validación:**
    *   Verificar que los archivos existan después de la escritura.

## 3. Salidas Esperadas
*   **Archivos generados:**
    *   `.gitignore`
    *   `.env`
    *   `requirements.txt`
*   **Logs:**
    *   "Estructura de proyecto inicializada correctamente."
    *   "Archivo [X] creado/ya existe."

## 4. Restricciones y Casos Borde (Memoria)
*   **Nota:** No sobrescribir `.env` si ya existe para no perder config del usuario.
*   **Nota:** Asegurar codificación UTF-8 al escribir archivos.
