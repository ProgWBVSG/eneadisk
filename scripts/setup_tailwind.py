import os
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

def create_file(filepath, content):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created file: {filepath}")

def main():
    project_root = os.path.join(os.getcwd(), "eneadisc")
    if not os.path.exists(project_root):
        print("Error: 'eneadisc' directory not found.")
        sys.exit(1)

    print("Installing Tailwind V4 Vite Plugin...")
    run_command("npm install -D @tailwindcss/vite", cwd=project_root)

    print("Configuring Vite...")
    create_file(os.path.join(project_root, "vite.config.ts"), """
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
""")

    print("Configuring CSS...")
    create_file(os.path.join(project_root, "src/index.css"), """
@import "tailwindcss";

@theme {
  --color-gold: #D4AF37;
  --color-gold-light: #F4E4C1;
  --color-deep-blue: #1A3A52;
  --color-emerald: #2C7873;

  --font-sans: 'Poppins', ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

/* Base Styles */
@layer base {
  html {
    font-family: var(--font-sans);
  }
}
""")
    
    # Add font import to index.html HEAD
    index_html_path = os.path.join(project_root, "index.html")
    if os.path.exists(index_html_path):
        with open(index_html_path, "r", encoding="utf-8") as f:
            html = f.read()
        
        if "Poppins" not in html:
            font_link = '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
            html = html.replace("</head>", f"    {font_link}\n  </head>")
            with open(index_html_path, "w", encoding="utf-8") as f:
                f.write(html)
            print("Added Poppins font to index.html")

    print("Tailwind setup complete.")

if __name__ == "__main__":
    main()
