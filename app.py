from flask import Flask, jsonify
import os

app = Flask(__name__)



@app.route('/', methods=['GET', 'POST'])
def MAIN():
    data = {"success": True, "message": "Hello World"}
    return jsonify(data)
@app.route("/login", methods=["GET", "POST"])
def LoginRoute():

    DBdata = {
        "host": os.getenv("DB_HOST", default="NOT_FOUND"),
        "username": os.getenv("DB_USERNAME", default="NOT_FOUND"),
        "password": os.getenv("DB_PASSWORD", default="NOT_FOUND"),
        "database": os.getenv("DB_DATABASE", default="NOT_FOUND"),
        "port": os.getenv("DB_PORT", default="NOT_FOUND"),
    }

    
    return jsonify(DBdata)


@app.route("/singup", methods=["POST"])
def method_name():
    data = {"success": True, "message": "Hello Signup Route"}
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
