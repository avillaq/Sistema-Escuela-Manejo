from flask import jsonify
from werkzeug.exceptions import BadRequest, NotFound

def register_error_handlers(app):
    @app.errorhandler(BadRequest)
    def handle_bad_request(e):
        response = e.get_response()
        response.data = jsonify({
            "success": False,
            "mensaje": e.description
        }).data
        response.content_type = "application/json"
        return response
    
    @app.errorhandler(NotFound)
    def handle_not_found(error):
        response = error.get_response()
        response.data = jsonify({
            "success": False,
            "mensaje": "Valor no encontrado"
        }).data
        response.content_type = "application/json"
        return response
    

