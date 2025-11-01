import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)

from app.db.session import init_db


def main():
    print("Initializing database...")
    init_db()
    print("Database initialization complete.")


if __name__ == "__main__":
    main()
