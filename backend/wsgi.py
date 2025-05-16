from app import create_app
from flask import redirect
from backend.app.core.extensions import db

app = create_app()

@app.route("/")
def index_api():
    return redirect("/api")

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
