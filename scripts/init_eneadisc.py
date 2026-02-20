import os
import subprocess
import shutil
import sys

def run_command(command, cwd=None, shell=True):
    """Ejecuta un comando de shell y maneja errores."""
    print(f"[EXEC] {command}")
    try:
        result = subprocess.run(
            command, 
            cwd=cwd, 
            shell=shell, 
            check=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Falló el comando: {command}")
        print(e.stderr)
        sys.exit(1)

def setup_eneadisc():
    print("Iniciando inicialización de ENEADISC (ENEA-INIT-001)...")
    
    ROOT_DIR = os.getcwd() # c:/Users/benja/EneaDisk
    PROJECT_DIR = os.path.join(ROOT_DIR, "eneadisc")

    # 1. Validación de Entorno
    if os.path.exists(PROJECT_DIR):
        print(f"[WARN] El directorio {PROJECT_DIR} ya existe.")
        # Por seguridad no lo borramos automáticamente en este script sin confirmación interactiva, 
        # pero para el agente asumimos que si existe y está vacío o queremos re-crearlo, podríamos necesitar acción manual.
        # Para este script, continuaremos si existe para permitir re-entrancia, o fallaremos si `create vite` falla.
    
    # 2. Generación del Proyecto (Vite)
    if not os.path.exists(PROJECT_DIR):
        print("[INFO] Creando proyecto Vite...")
        # create vite requiere interactividad si la carpeta existe y no está vacía. 
        # Usamos --yes para defaults si aplica, y definimos el nombre.
        run_command(f"npm create vite@latest eneadisc -- --template react-ts", cwd=ROOT_DIR)
    else:
        print("[INFO] Proyecto Vite parece ya existir. Saltando creación.")

    # 3. Instalación de Dependencias
    print("[INFO] Instalando dependencias...")
    run_command("npm install", cwd=PROJECT_DIR)
    
    libs = "react-router-dom lucide-react framer-motion clsx tailwind-merge react-hook-form zod"
    run_command(f"npm install {libs}", cwd=PROJECT_DIR)

    # 4. Configuración de Tailwind
    print("[INFO] Configurando Tailwind CSS...")
    run_command("npm install -D tailwindcss@latest postcss@latest autoprefixer@latest", cwd=PROJECT_DIR)
    
    # Init tailwind si no existe config - usar npx con -y para auto-instalación
    if not os.path.exists(os.path.join(PROJECT_DIR, "tailwind.config.js")):
        run_command("npx -y tailwindcss init -p", cwd=PROJECT_DIR)

    # Sobreescribir tailwind.config.js
    tailwind_config_content = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F4E4C1',
        },
        blue: {
          deep: '#1A3A52',
        },
        emerald: {
          DEFAULT: '#2C7873',
        },
        gray: {
          charcoal: '#2D3436',
          light: '#F8F9FA',
        },
        coral: '#FF6B6B',
        violet: '#6C5CE7',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        alt: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
"""
    with open(os.path.join(PROJECT_DIR, "tailwind.config.js"), "w", encoding="utf-8") as f:
        f.write(tailwind_config_content)
    print("[OK] tailwind.config.js actualizado.")

    # 5. Estructura de Carpetas
    print("[INFO] Creando estructura de directorios src/...")
    src_dirs = [
        "components/common",
        "components/layout",
        "pages/auth",
        "pages/admin",
        "pages/colaborador",
        "hooks",
        "context",
        "types",
        "utils"
    ]
    for d in src_dirs:
        os.makedirs(os.path.join(PROJECT_DIR, "src", d), exist_ok=True)

    # 6. Estilos Globales
    index_css_content = """@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Poppins:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Poppins', sans-serif;
  background-color: #F8F9FA;
  color: #2D3436;
}
"""
    with open(os.path.join(PROJECT_DIR, "src", "index.css"), "w", encoding="utf-8") as f:
        f.write(index_css_content)
    print("[OK] src/index.css actualizado.")

    print("ENEADISC Initialization Complete. Ready to start dev server.")

if __name__ == "__main__":
    setup_eneadisc()
