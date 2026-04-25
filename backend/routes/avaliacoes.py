from flask import Blueprint, request, jsonify
from models import db
from models.avaliacao import Avaliacao
from models.fornecedor import Fornecedor
from routes.auth import login_required

avaliacoes_bp = Blueprint('avaliacoes', __name__)


@avaliacoes_bp.route('/api/avaliacoes', methods=['GET'])
@login_required
def listar():
    """Listar todas as avaliações"""
    fornecedor_id = request.args.get('fornecedor_id')
    
    query = Avaliacao.query
    if fornecedor_id:
        query = query.filter(Avaliacao.fornecedor_id == int(fornecedor_id))
    
    avaliacoes = query.order_by(Avaliacao.data_avaliacao.desc()).all()
    return jsonify([a.to_dict() for a in avaliacoes])


@avaliacoes_bp.route('/api/avaliacoes/fornecedor/<int:fornecedor_id>', methods=['GET'])
@login_required
def listar_por_fornecedor(fornecedor_id):
    """Listar avaliações de um fornecedor"""
    Fornecedor.query.get_or_404(fornecedor_id)
    avaliacoes = Avaliacao.query.filter_by(fornecedor_id=fornecedor_id)\
        .order_by(Avaliacao.data_avaliacao.desc()).all()
    return jsonify([a.to_dict() for a in avaliacoes])


@avaliacoes_bp.route('/api/avaliacoes', methods=['POST'])
@login_required
def criar():
    """Criar nova avaliação"""
    data = request.get_json()
    
    fornecedor_id = data.get('fornecedor_id')
    if not fornecedor_id:
        return jsonify({'error': 'Fornecedor é obrigatório.'}), 400
    
    Fornecedor.query.get_or_404(fornecedor_id)
    
    avaliacao = Avaliacao(
        fornecedor_id=fornecedor_id,
        qualidade=float(data.get('qualidade', 0)),
        prazo_entrega=float(data.get('prazo_entrega', 0)),
        atendimento=float(data.get('atendimento', 0)),
        custo_beneficio=float(data.get('custo_beneficio', 0)),
        confiabilidade=float(data.get('confiabilidade', 0)),
        observacoes=data.get('observacoes')
    )
    
    avaliacao.calcular_nota_final()
    
    db.session.add(avaliacao)
    db.session.commit()
    
    return jsonify(avaliacao.to_dict()), 201


@avaliacoes_bp.route('/api/avaliacoes/<int:id>', methods=['PUT'])
@login_required
def editar(id):
    """Editar avaliação"""
    avaliacao = Avaliacao.query.get_or_404(id)
    data = request.get_json()
    
    for campo in ['qualidade', 'prazo_entrega', 'atendimento', 'custo_beneficio', 'confiabilidade']:
        if campo in data:
            setattr(avaliacao, campo, float(data[campo]))
    
    if 'observacoes' in data:
        avaliacao.observacoes = data['observacoes']
    
    avaliacao.calcular_nota_final()
    db.session.commit()
    
    return jsonify(avaliacao.to_dict())


@avaliacoes_bp.route('/api/avaliacoes/<int:id>', methods=['DELETE'])
@login_required
def excluir(id):
    """Excluir avaliação"""
    avaliacao = Avaliacao.query.get_or_404(id)
    db.session.delete(avaliacao)
    db.session.commit()
    return jsonify({'message': 'Avaliação excluída com sucesso.'})
