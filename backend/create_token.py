from datetime import datetime, timedelta
import jwt
from app.config import settings

# JWT settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Create admin token
admin_token = create_access_token(
    data={"sub": "admin@upm.edu.ph", "role": "admin"},
    expires_delta=timedelta(days=30)  # Long expiration for testing
)

# Create faculty token
faculty_token = create_access_token(
    data={"sub": "faculty@upm.edu.ph", "role": "faculty"},
    expires_delta=timedelta(days=30)
)

print("\n=== JWT TOKENS ===")
print(f"Admin Token (valid for 30 days):\n{admin_token}\n")
print(f"Faculty Token (valid for 30 days):\n{faculty_token}\n")
print("To use these tokens:")
print("1. Copy the token")
print("2. In your browser's developer tools, run:")
print("   localStorage.setItem('token', 'PASTE_TOKEN_HERE')")
print("3. Refresh the page")
