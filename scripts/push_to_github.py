import os
import subprocess

def run_git_command(command):
    print(f"Running: git {' '.join(command)}")
    result = subprocess.run(['git'] + command, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
    else:
        print(result.stdout)
    return result

def main():
    repo_path = r"C:\Users\benja\EneaDisk"
    repo_url = "https://github.com/ProgWBVSG/eneadisk.git"
    os.chdir(repo_path)

    # 1. Add remote origin
    # Check if remote already exists
    remotes = subprocess.run(['git', 'remote'], capture_output=True, text=True).stdout
    if 'origin' in remotes:
        run_git_command(['remote', 'set-url', 'origin', repo_url])
    else:
        run_git_command(['remote', 'add', 'origin', repo_url])

    # 2. Push to main
    # We use -u to set upstream
    print("Intentando subir los archivos a GitHub...")
    result = run_git_command(['push', '-u', 'origin', 'main'])
    
    if result.returncode != 0:
        print("\nFALLO EN EL PUSH: Probablemente se necesite autenticación manual o el repo no está vacío.")
    else:
        print("\n¡ÉXITO! El repositorio se ha actualizado correctamente en GitHub.")

if __name__ == "__main__":
    main()
