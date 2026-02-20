import os

def setup_project():
    print("Iniciando configuración del proyecto...")

    # 1. Verificar/Crear Directorios
    directories = ["directivas", "scripts", ".tmp"]
    for d in directories:
        if not os.path.exists(d):
            os.makedirs(d)
            print(f"[OK] Directorio creado: {d}")
        else:
            print(f"[INFO] Directorio ya existe: {d}")

    # 2. Generar .gitignore
    gitignore_content = """# Ignorar
.env
.tmp/
__pycache__/
.vscode/
*.log
"""
    if not os.path.exists(".gitignore"):
        with open(".gitignore", "w", encoding="utf-8") as f:
            f.write(gitignore_content)
        print("[OK] Archivo creado: .gitignore")
    else:
        print("[INFO] Archivo ya existe: .gitignore")

    # 3. Generar .env
    env_content = """# Variables de entorno
ENV_TYPE=development
"""
    if not os.path.exists(".env"):
        with open(".env", "w", encoding="utf-8") as f:
            f.write(env_content)
        print("[OK] Archivo creado: .env")
    else:
        print("[INFO] Archivo ya existe: .env (No se sobrescribió)")

    # 4. Generar requirements.txt
    requirements_content = """python-dotenv
requests
"""
    if not os.path.exists("requirements.txt"):
        with open("requirements.txt", "w", encoding="utf-8") as f:
            f.write(requirements_content)
        print("[OK] Archivo creado: requirements.txt")
    else:
        print("[INFO] Archivo ya existe: requirements.txt")

    print("Estructura de proyecto inicializada correctamente.")

if __name__ == "__main__":
    setup_project()
