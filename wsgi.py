import sys
import os

# Ajouter le chemin du projet à PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import app

# Configuration pour PythonAnywhere
if __name__ == "__main__":
    app.run()
