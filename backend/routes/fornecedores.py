from flask import Blueprint, request, jsonify
from models import db
from models.fornecedor import Fornecedor
from models.categoria import Categoria
from routes.auth import login_required

fornecedores_bp = Blueprint('fornecedores', __name__)


@fornecedores_bp.route('/api/fornecedores', methods=['GET'])
@login_required
def listar():
    """Listar todos os fornecedores com filtros"""
    status = request.args.get('status')
    categoria_id = request.args.get('categoria_id')
    tipo = request.args.get('tipo')
    busca = request.args.get('busca', '').strip()
    
    query = Fornecedor.query
    
    if status:
        query = query.filter(Fornecedor.status == status)
    if categoria_id:
        query = query.filter(Fornecedor.categoria_id == int(categoria_id))
    if tipo:
        query = query.filter(Fornecedor.tipo_fornecedor == tipo)
    if busca:
        busca_like = f'%{busca}%'
        query = query.filter(
            db.or_(
                Fornecedor.razao_social.ilike(busca_like),
                Fornecedor.nome_fantasia.ilike(busca_like),
                Fornecedor.cnpj.ilike(busca_like),
                Fornecedor.codigo.ilike(busca_like)
            )
        )
    
    fornecedores = query.order_by(Fornecedor.razao_social).all()
    return jsonify([f.to_dict() for f in fornecedores])


@fornecedores_bp.route('/api/fornecedores/<int:id>', methods=['GET'])
@login_required
def detalhe(id):
    """Detalhe de um fornecedor"""
    fornecedor = Fornecedor.query.get_or_404(id)
    return jsonify(fornecedor.to_dict())


@fornecedores_bp.route('/api/fornecedores', methods=['POST'])
@login_required
def criar():
    """Criar novo fornecedor"""
    data = request.get_json()
    
    if not data.get('razao_social'):
        return jsonify({'error': 'Razão social é obrigatória.'}), 400
    
    # Verificar CNPJ duplicado
    if data.get('cnpj'):
        existente = Fornecedor.query.filter_by(cnpj=data['cnpj']).first()
        if existente:
            return jsonify({'error': 'CNPJ já cadastrado.'}), 400
    
    fornecedor = Fornecedor(
        codigo=Fornecedor.gerar_codigo(),
        razao_social=data.get('razao_social'),
        nome_fantasia=data.get('nome_fantasia'),
        cnpj=data.get('cnpj'),
        inscricao_estadual=data.get('inscricao_estadual'),
        categoria_id=data.get('categoria_id'),
        subcategoria=data.get('subcategoria'),
        tipo_fornecedor=data.get('tipo_fornecedor', 'produto'),
        porte_empresa=data.get('porte_empresa'),
        status=data.get('status', 'ativo'),
        contato_nome=data.get('contato_nome'),
        contato_cargo=data.get('contato_cargo'),
        telefone=data.get('telefone'),
        email=data.get('email'),
        whatsapp=data.get('whatsapp'),
        cidade=data.get('cidade'),
        estado=data.get('estado'),
        pais=data.get('pais', 'Brasil'),
        forma_pagamento=data.get('forma_pagamento'),
        prazo_pagamento=data.get('prazo_pagamento'),
        site_url=data.get('site_url'),
        observacoes=data.get('observacoes')
    )
    
    db.session.add(fornecedor)
    db.session.commit()
    
    return jsonify(fornecedor.to_dict()), 201


@fornecedores_bp.route('/api/fornecedores/<int:id>', methods=['PUT'])
@login_required
def editar(id):
    """Editar fornecedor"""
    fornecedor = Fornecedor.query.get_or_404(id)
    data = request.get_json()
    
    # Verificar CNPJ duplicado (se mudou)
    if data.get('cnpj') and data['cnpj'] != fornecedor.cnpj:
        existente = Fornecedor.query.filter_by(cnpj=data['cnpj']).first()
        if existente:
            return jsonify({'error': 'CNPJ já cadastrado.'}), 400
    
    campos = [
        'razao_social', 'nome_fantasia', 'cnpj', 'inscricao_estadual',
        'categoria_id', 'subcategoria', 'tipo_fornecedor', 'porte_empresa',
        'status', 'contato_nome', 'contato_cargo', 'telefone', 'email',
        'whatsapp', 'cidade', 'estado', 'pais', 'forma_pagamento',
        'prazo_pagamento', 'site_url', 'observacoes'
    ]
    
    for campo in campos:
        if campo in data:
            setattr(fornecedor, campo, data[campo])
    
    db.session.commit()
    return jsonify(fornecedor.to_dict())


@fornecedores_bp.route('/api/fornecedores/<int:id>', methods=['DELETE'])
@login_required
def excluir(id):
    """Excluir fornecedor"""
    fornecedor = Fornecedor.query.get_or_404(id)
    db.session.delete(fornecedor)
    db.session.commit()
    return jsonify({'message': 'Fornecedor excluído com sucesso.'})


@fornecedores_bp.route('/api/fornecedores/<int:id>/status', methods=['PATCH'])
@login_required
def alterar_status(id):
    """Alterar status do fornecedor"""
    fornecedor = Fornecedor.query.get_or_404(id)
    data = request.get_json()
    novo_status = data.get('status')
    
    if novo_status not in ['ativo', 'inativo', 'bloqueado']:
        return jsonify({'error': 'Status inválido.'}), 400
    
    fornecedor.status = novo_status
    db.session.commit()
    return jsonify(fornecedor.to_dict())
