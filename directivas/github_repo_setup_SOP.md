# Directiva: Configuración de Repositorio GitHub (SOP)

Este SOP describe los pasos para inicializar un repositorio Git local y subir el proyecto al repositorio de GitHub.

## Objetivo
Asegurar que todo el espacio de trabajo `EneaDisk`, incluyendo la aplicación (`eneadisc/`), las directivas y los scripts, esté respaldado en GitHub.

## Entradas
- URL del repositorio de GitHub (proporcionada por el usuario o creada a través de la interfaz).
- Archivo `.gitignore` configurado.

## Lógica y Pasos
1. **Verificación de Entorno**:
   - Comprobar que Git esté instalado.
   - Comprobar si ya existe un repositorio Git (`.git`).
2. **Configuración de .gitignore**:
   - Asegurarse de que carpetas como `node_modules`, `dist`, `.env` y archivos temporales estén ignorados en el nivel raíz.
3. **Inicialización Local**:
   - Ejecutar `git init`.
   - Ejecutar `git add .`.
   - Realizar el commit inicial: `git commit -m "Initial commit: EneaDisk workspace structure"`.
4. **Vinculación Remota**:
   - Añadir el origen remoto: `git remote add origin [REPO_URL]`.
   - Asegurarse de que la rama principal sea `main`.
5. **Carga (Push)**:
   - Subir los cambios: `git push -u origin main`.

## Restricciones / Casos Borde
- **Credenciales**: Si el sistema pide credenciales, el script fallará. Se debe asegurar que el usuario tenga configurado el acceso (SSH o token).
- **Repositorio Existente**: Si ya hay un repositorio remoto con contenido, el push fallará si no se sincroniza primero.
- **Tamaño de Archivos**: Evitar subir archivos grandes (videos, binarios pesados) si no es necesario.

## Observaciones
- Si `gh` CLI no está disponible, el usuario debe crear el repositorio manualmente en GitHub antes de que el script pueda vincularlo.
