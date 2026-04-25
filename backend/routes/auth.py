from flask import Blueprint, request, jsonify, session
from models.usuario import Usuario
from models import db
from functools import wraps

auth_bp = Blueprint('auth', __name__)


def login_required(f):
    """Decorator para proteger rotas que exigem autenticação"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Não autorizado. Faça login.'}), 401
        usuario = Usuario.query.get(user_id)
        if not usuario or not usuario.ativo:
            session.pop('user_id', None)
            return jsonify({'error': 'Sessão inválida.'}), 401
        return f(*args, **kwargs)
    return decorated


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    senha = data.get('senha', '')
    
    if not email or not senha:
        return jsonify({'error': 'E-mail e senha são obrigatórios.'}), 400
    
    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario or not usuario.check_senha(senha):
        return jsonify({'error': 'E-mail ou senha incorretos.'}), 401
    
    if not usuario.ativo:
        return jsonify({'error': 'Usuário desativado.'}), 403
    
    session['user_id'] = usuario.id
    session.permanent = True
    
    return jsonify({
        'message': 'Login realizado com sucesso!',
        'usuario': usuario.to_dict()
    })


@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout realizado com sucesso!'})


@auth_bp.route('/api/auth/me', methods=['GET'])
def me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não autenticado'}), 401
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({'error': 'Usuário não encontrado'}), 401
    return jsonify({'usuario': usuario.to_dict()})
