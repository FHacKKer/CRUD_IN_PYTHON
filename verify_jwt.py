import jwt


def verify_jwt_token(token, secret_key):
    try:
        # Decode the token using the secret key and HS256 algorithm
        decoded_payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        return decoded_payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        print("Token expired")
        return None
    except jwt.InvalidTokenError:
        # Token is invalid
        print("Invalid token")
        return None
