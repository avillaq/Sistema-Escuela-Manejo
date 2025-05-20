from app import create_app
from flask import redirect
from flask import jsonify

app = create_app()

@app.route("/")
def index_api():
    return redirect("/api")

@app.route("/api")
def home():
    return jsonify({
        "message": "Sistema de escuela de manejo"
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
