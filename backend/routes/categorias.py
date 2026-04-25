from flask import Blueprint, request, jsonify
from models import db
from models.categoria import Categoria, Subcategoria
from routes.auth import login_required

categorias_bp = Blueprint('categorias', __name__)


@categorias_bp.route('/api/categorias', methods=['GET'])
@login_required
def listar():
    """Listar todas as categorias com subcategorias"""
    categorias = Categoria.query.order_by(Categoria.nome).all()
    return jsonify([c.to_dict() for c in categorias])


@categorias_bp.route('/api/categorias', methods=['POST'])
@login_required
def criar():
    """Criar nova categoria"""
    data = request.get_json()
    nome = data.get('nome', '').strip()
    
    if not nome:
        return jsonify({'error': 'Nome da categoria é obrigatório.'}), 400
    
    existente = Categoria.query.filter_by(nome=nome).first()
    if existente:
        return jsonify({'error': 'Categoria já existe.'}), 400
    
    categoria = Categoria(nome=nome)
    db.session.add(categoria)
    db.session.commit()
    
    return jsonify(categoria.to_dict()), 201


@categorias_bp.route('/api/categorias/<int:id>', methods=['PUT'])
@login_required
def editar(id):
    """Editar categoria"""
    categoria = Categoria.query.get_or_404(id)
    data = request.get_json()
    nome = data.get('nome', '').strip()
    
    if not nome:
        return jsonify({'error': 'Nome é obrigatório.'}), 400
    
    existente = Categoria.query.filter(Categoria.nome == nome, Categoria.id != id).first()
    if existente:
        return jsonify({'error': 'Categoria já existe.'}), 400
    
    categoria.nome = nome
    db.session.commit()
    return jsonify(categoria.to_dict())


@categorias_bp.route('/api/categorias/<int:id>', methods=['DELETE'])
@login_required
def excluir(id):
    """Excluir categoria (e suas subcategorias)"""
    categoria = Categoria.query.get_or_404(id)
    db.session.delete(categoria)
    db.session.commit()
    return jsonify({'message': 'Categoria excluída com sucesso.'})


@categorias_bp.route('/api/categorias/<int:cat_id>/subcategorias', methods=['POST'])
@login_required
def criar_subcategoria(cat_id):
    """Criar subcategoria"""
    categoria = Categoria.query.get_or_404(cat_id)
    data = request.get_json()
    nome = data.get('nome', '').strip()
    
    if not nome:
        return jsonify({'error': 'Nome da subcategoria é obrigatório.'}), 400
    
    existente = Subcategoria.query.filter_by(nome=nome, categoria_id=cat_id).first()
    if existente:
        return jsonify({'error': 'Subcategoria já existe nesta categoria.'}), 400
    
    sub = Subcategoria(nome=nome, categoria_id=cat_id)
    db.session.add(sub)
    db.session.commit()
    
    return jsonify(categoria.to_dict()), 201


@categorias_bp.route('/api/subcategorias/<int:id>', methods=['PUT'])
@login_required
def editar_subcategoria(id):
    """Editar subcategoria"""
    sub = Subcategoria.query.get_or_404(id)
    data = request.get_json()
    nome = data.get('nome', '').strip()
    
    if not nome:
        return jsonify({'error': 'Nome é obrigatório.'}), 400
    
    sub.nome = nome
    db.session.commit()
    return jsonify(sub.categoria.to_dict())


@categorias_bp.route('/api/subcategorias/<int:id>', methods=['DELETE'])
@login_required
def excluir_subcategoria(id):
    """Excluir subcategoria"""
    sub = Subcategoria.query.get_or_404(id)
    cat = sub.categoria
    db.session.delete(sub)
    db.session.commit()
    return jsonify(cat.to_dict())
