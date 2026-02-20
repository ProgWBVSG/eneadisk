import os
import shutil
import subprocess
import sys

def run_command(command, cwd=None):
    try:
        subprocess.run(command, check=True, shell=True, cwd=cwd)
        print(f"Successfully ran: {command}")
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(e)
        sys.exit(1)

def main():
    project_root = os.path.join(os.getcwd(), "eneadisc")
    if not os.path.exists(project_root):
        print("Error: 'eneadisc' directory not found.")
        sys.exit(1)

    node_modules = os.path.join(project_root, "node_modules")
    package_lock = os.path.join(project_root, "package-lock.json")

    print(f"Removing {node_modules}...")
    if os.path.exists(node_modules):
        shutil.rmtree(node_modules)
    
    print(f"Removing {package_lock}...")
    if os.path.exists(package_lock):
        os.remove(package_lock)

    print("Reinstalling dependencies...")
    run_command("npm install", cwd=project_root)
    
    print("Clean install complete.")

if __name__ == "__main__":
    main()
