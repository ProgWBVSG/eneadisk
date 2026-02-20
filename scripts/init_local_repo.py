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
    os.chdir(repo_path)

    # 1. Update .gitignore
    gitignore_content = """# Envs & Temp
.env
.tmp/
__pycache__/
.vscode/
*.log
.DS_Store

# Web App Dependencies & Builds
eneadisc/node_modules/
eneadisc/dist/
eneadisc/dist-ssr/
eneadisc/build.log
eneadisc/build_error.log

# Other
*.local
"""
    with open(".gitignore", "w") as f:
        f.write(gitignore_content)
    print("Updated .gitignore")

    # 2. Check if git is already initialized
    if not os.path.exists(".git"):
        run_git_command(['init'])
        run_git_command(['branch', '-M', 'main'])
    else:
        print("Git already initialized.")

    # 3. Add files and commit
    run_git_command(['add', '.'])
    run_git_command(['commit', '-m', 'Initial commit: EneaDisk workspace structure'])

if __name__ == "__main__":
    main()
