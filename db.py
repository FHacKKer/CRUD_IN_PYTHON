import mysql.connector
import os


def connect_to_db():

    host = os.getenv("DB_HOST", default="")
    user = os.getenv("DB_USERNAME", default="")
    dbpass = os.getenv("DB_PASSWORD", default="")
    db = os.getenv("DB_DATABASE", default="")
    port = os.getenv("DB_PORT", default=3306)
    try:
        conn = mysql.connector.connect(
            host=host, user=user, password=dbpass, db=db, port=port
        )
        if conn.is_connected():
            print("Successfully Connected To Database!")
            return conn

    except mysql.connector.Error as e:

        print(f"Error : {e}")
        return None
