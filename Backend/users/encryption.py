from cryptography.fernet import Fernet
from django.conf import settings

# Initialize Fernet cipher using the key from settings
# This is used to encrypt/decrypt sensitive payment data like phone numbers
def get_cipher():
    return Fernet(settings.ENCRYPTION_KEY.encode())

def encrypt(value: str) -> str:
    """Encrypts a plain text string and returns an encrypted string."""
    if not value:
        return value
    cipher = get_cipher()
    return cipher.encrypt(value.encode()).decode()

def decrypt(value: str) -> str:
    """Decrypts an encrypted string back to plain text."""
    if not value:
        return value
    cipher = get_cipher()
    return cipher.decrypt(value.encode()).decode()

def mask_phone(phone: str) -> str:
    """Returns a masked version of the phone number e.g. +254 7** *** 890
       Used for display — never expose full number in API responses."""
    if not phone or len(phone) < 6:
        return phone
    return phone[:5] + '*' * (len(phone) - 8) + phone[-3:]