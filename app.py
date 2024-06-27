from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import mysql.connector
from db import connect_to_db
import jwt
import datetime
from mysql.connector import Error
from verify_jwt import verify_jwt_token

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "http://127.0.0.1:5000"}},
    supports_credentials=True,
)


@app.route("/", methods=["GET"])
def main():
    return render_template("mainPage/index.html")


@app.route("/home", methods=["GET"])
def HOME_PAGE():
    return render_template("home/index.html")


def is_valid_field(s, min_length, max_length):
    """Validate if a string is non-empty and within a specified length range."""
    return s.strip() and min_length <= len(s.strip()) <= max_length


@app.route("/signin", methods=["POST"])
def sign_in():

    request_data = request.json
    if not request_data:
        return jsonify({"success": False, "message": "No JSON data received."}), 400

    username = request_data.get("username")
    password = request_data.get("password")

    if not is_valid_field(username, 5, 20):
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Invalid username. Username must be between 3 and 20 characters long.",
                }
            ),
            400,
        )

    if not is_valid_field(password, 5, 20):
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Invalid password. Password must be between 6 and 20 characters long.",
                }
            ),
            400,
        )

    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            query = "SELECT username FROM admin WHERE username = %s AND password = %s LIMIT 1"
            cursor.execute(query, (username, password))
            user = cursor.fetchone()
            conn.close()

            if user:
                if not user["username"]:
                    return jsonify(
                        {
                            "success": False,
                            "message": "Invalid Request! Username Not Found",
                        }
                    )

                payload = {
                    "user": user["username"],
                    "exp": datetime.datetime.now(datetime.UTC)
                    + datetime.timedelta(minutes=10),
                }

                JWT_KEY = os.getenv("JWT_SECRET_KEY")
                if not JWT_KEY:
                    return jsonify(
                        {
                            "success": False,
                            "message": "JWT_KEY NOT FOUND!",
                        }
                    )

                jwt_token = jwt.encode(payload, JWT_KEY)

                response_data = {
                    "message": "Logged In Successfully!",
                    "success": True,
                    "token": jwt_token,
                }
                return jsonify(response_data)
            else:
                response_data = {
                    "message": "Invalid Credentials!",
                    "success": False,
                }
                return jsonify(response_data)
        except mysql.connector.Error as e:
            return jsonify({"success": False, "message": f"Database error: {e}"}), 500

    else:
        return (
            jsonify(
                {"success": False, "message": "Failed to connect to the database."}
            ),
            500,
        )


@app.route("/verify", methods=["POST"])
def VERIFY_TOKEN():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return (
            jsonify({"success": False, "message": "Authorization header missing."}),
            400,
        )

    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

    if not token:
        return (
            jsonify(
                {"success": False, "message": "Invalid Request! No Token Provided!"}
            ),
            400,
        )

    print(token)
    JWT_KEY = os.getenv("JWT_SECRET_KEY")
    if not JWT_KEY:
        return jsonify({"success": False, "message": "JWT_KEY NOT FOUND!"}), 500

    try:
        decoded_token = jwt.decode(token, JWT_KEY, algorithms=["HS256"])
        print(decoded_token)
        username = decoded_token.get("user")

        if username:
            response_data = {"success": True, "message": "Valid Token!"}
            return jsonify(response_data)
        else:
            return (
                jsonify(
                    {"success": False, "message": "Invalid Token! Please Login Again!"}
                ),
                401,
            )

    except jwt.ExpiredSignatureError:
        return (
            jsonify(
                {"success": False, "message": "Token Expired! Please Login Again!"}
            ),
            401,
        )
    except jwt.InvalidTokenError:
        return (
            jsonify(
                {"success": False, "message": "Invalid Token! Please Login Again!"}
            ),
            401,
        )


@app.route("/users", methods=["GET"])
def GET_USERS():
    authorization_header = request.headers.get("Authorization")
    if not authorization_header:
        return (
            jsonify({"success": False, "message": "Authorization header missing."}),
            400,
        )
    token = None
    if authorization_header.startswith("Bearer "):
        token = authorization_header.split(" ")[1]

    if not token:
        return (
            jsonify(
                {"success": False, "message": "Invalid Request! No Token Provided!"}
            ),
            400,
        )
    jwt_key = os.getenv("JWT_SECRET_KEY")
    decoded_payload = verify_jwt_token(token, jwt_key)

    if not decoded_payload:
        return (
            jsonify(
                {"success": False, "message": "Invalid Token! Please Login Again!"}
            ),
            401,
        )

    current_user = decoded_payload["user"]
    if not current_user:
        return (
            jsonify(
                {"success": False, "message": "Invalid Token! Please Login Again!"}
            ),
            401,
        )
    conn = connect_to_db()
    if conn is None:
        return []
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT id,name,username,email,created_at FROM users"
        cursor.execute(query)
        users = cursor.fetchall()
        return jsonify({"success": True, "users": users})
    except:
        return []
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
            print("Connection closed")


@app.route("/addUser", methods=["POST"])
def Add_User():

    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"success": False, "message": "Authorization Header Not Found!"})

    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

    jwt_secret = os.getenv("JWT_SECRET_KEY")
    if not jwt_secret:
        return jsonify({"success": False, "message": "JWT_SECRET_KEY NOT FOUND!"})

    decoded_payload = verify_jwt_token(
        token,
        jwt_secret,
    )

    if not decoded_payload:
        return jsonify(
            {"success": False, "message": "Failed To Add User! Invalid JWT Token"}
        )

    current_user = decoded_payload["user"]
    if not current_user:
        return jsonify(
            {"success": False, "message": "Failed To Add User! Invalid JWT Token"}
        )

    request_data = request.json
    if not request_data:
        return jsonify({"success": False, "message": "No JSON data received."}), 400

    # Trim the input values
    name = request_data.get("name", "").strip()
    username = request_data.get("username", "").strip()
    email = request_data.get("email", "").strip()

    if not name or not username or not email:
        return (
            jsonify(
                {"success": False, "message": "Name, username, and email are required."}
            ),
            400,
        )

    conn = connect_to_db()
    if conn is None:
        return jsonify(
            {"success": False, "message": "Failed to connect to the database."}
        )

    try:
        cursor = conn.cursor(dictionary=True)

        # Check if the username or email already exists
        query = "SELECT * FROM users WHERE username = %s OR email = %s limit 1"
        cursor.execute(query, (username, email))
        existing_user = cursor.fetchone()

        if existing_user:
            print("User Already exists")
            return (
                jsonify(
                    {"success": False, "message": "Username or email already exists."}
                ),
                400,
            )

        # Insert new user record
        insert_query = "INSERT INTO users (name, username, email) VALUES (%s, %s, %s)"
        cursor.execute(insert_query, (name, username, email))
        conn.commit()

        return (
            jsonify({"success": True, "message": "User registered successfully."}),
            201,
        )

    except Error as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "message": "Database operation failed."}), 500

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


@app.route("/update", methods=["POST"])
def UPDATE_USER():
    try:
        auth_header = request.headers.get("Authorization")
        request_data = request.json

        if not auth_header:
            return jsonify(
                {"success": False, "message": "Authorization Header Not Found!"}
            )

        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        jwt_secret = os.getenv("JWT_SECRET_KEY")
        if not jwt_secret:
            return jsonify({"success": False, "message": "JWT_SECRET_KEY NOT FOUND!"})

        decoded_payload = verify_jwt_token(token, jwt_secret)
        if not decoded_payload:
            return jsonify(
                {
                    "success": False,
                    "message": "Failed To Update User! Invalid JWT Token",
                }
            )

        current_user = decoded_payload["user"]

        name = request_data.get("name")
        username = request_data.get("username")
        email = request_data.get("email")
        userId = request_data.get("id")

        conn = connect_to_db()
        if conn is None:
            return jsonify(
                {"success": False, "message": "Failed to connect to the database."}
            )

        cursor = conn.cursor()

        alreadyExistQuery = (
            "SELECT * FROM users WHERE (username = %s OR email = %s) AND id != %s"
        )
        cursor.execute(alreadyExistQuery, (username, email, userId))
        existingUser = cursor.fetchone()
        if existingUser:
            return jsonify(
                {"success": False, "message": "Username or email already exists."}
            )

        query = "UPDATE users SET name = %s, username = %s, email = %s WHERE id = %s LIMIT 1"
        cursor.execute(query, (name, username, email, userId))
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "User updated successfully."})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "Failed To Update User!"})


@app.route("/delete", methods=["POST"])
def DELETE_USER():
    try:
        auth_header = request.headers.get("Authorization")
        request_payload = request.json
        if not auth_header:
            return (
                jsonify(
                    {"success": False, "message": "Authorization Header Not Found!"}
                ),
                401,
            )

        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        if token is None:
            return (
                jsonify(
                    {"success": False, "message": "Invalid Request! No Token Provided!"}
                ),
                400,
            )

        secret_key = os.getenv("JWT_SECRET_KEY")
        if not secret_key:
            return (
                jsonify({"success": False, "message": "JWT_SECRET_KEY NOT FOUND!"}),
                500,
            )

        decoded_token = verify_jwt_token(token, secret_key)
        if decoded_token is None:
            return jsonify({"success": False, "message": "Invalid Access Token!"}), 401

        current_user = decoded_token.get("user")
        if not current_user:
            return jsonify({"success": False, "message": "Invalid Access Token!"}), 401

        userId = request_payload.get("userId")
        if not userId:
            return (
                jsonify({"success": False, "message": "No User Id was specified!"}),
                400,
            )

        conn = connect_to_db()
        if conn is None:
            return (
                jsonify(
                    {"success": False, "message": "Failed to connect to the database."}
                ),
                500,
            )

        try:
            cursor = conn.cursor()
            query = "DELETE FROM users WHERE id = %s LIMIT %s"
            cursor.execute(query, (userId, 1))
            conn.commit()
            cursor.close()
            conn.close()
            return (
                jsonify({"success": True, "message": "User Deleted successfully!"}),
                200,
            )
        except Exception as e:
            conn.rollback()
            print(f"Error: {str(e)}")
            return jsonify({"success": False, "message": "Failed To Delete User!"}), 500
        finally:
            conn.close()
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "An error occurred!"}), 500
                        

if __name__ == "__main__":
    app.run(debug=True)
