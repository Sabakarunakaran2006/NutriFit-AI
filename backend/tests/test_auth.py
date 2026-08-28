import pytest
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token

def test_password_hashing():
    pwd = "SecurePassword@123"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_encoding_and_decoding():
    user_id = 42
    role = "EXPERT"
    token = create_access_token(subject=user_id, role=role)
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == str(user_id)
    assert payload["role"] == role
    assert "exp" in payload

def test_invalid_jwt_decoding():
    invalid_token = "invalid.token.payload"
    assert decode_token(invalid_token) is None
