from getpass import getpass
from pwdlib import PasswordHash
from database import SessionLocal
import crud

"""
 Simple script to create an admin user from the command line.
"""

password_hash = PasswordHash.recommended()

def main():
    db = SessionLocal()
    try:
        email = input("Admin email: ").strip()
        if not email:
            print("Email required.")
            return

        if crud.get_user_by_email(db, email):
            print("User with that email already exists.")
            return

        name = input("Name (optional): ").strip() or None
        password = getpass("Password: ")
        password_confirm = getpass("Confirm password: ")
        if password != password_confirm:
            print("Passwords do not match.")
            return

        admin = crud.create_user(db, name, email, password_hash.hash(password), is_admin=True)
        print("Created admin:", admin.id, admin.email)
    finally:
        db.close()

if __name__ == "__main__":
    main()