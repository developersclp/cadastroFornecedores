from flask import Blueprint, request, jsonify, send_file
from models import db
from models.fornecedor import Fornecedor
from models.avaliacao import Avaliacao
from models.categoria import Categoria
from routes.auth import login_required
from reports.pdf_generator import gerar_pdf_fornecedores, gerar_pdf_ficha_fornecedor
import io

export_bp = Blueprint('export', __name__)


@export_bp.route('/api/export/pdf', methods=['GET'])
@login_required
def exportar_todos():
    """Exportar lista de fornecedores em PDF"""
    status = request.args.get('status')
    categoria_id = request.args.get('categoria_id')
    
    query = Fornecedor.query
    if status:
        query = query.filter(Fornecedor.status == status)
    if categoria_id:
        query = query.filter(Fornecedor.categoria_id == int(categoria_id))
    
    fornecedores = query.order_by(Fornecedor.razao_social).all()
    
    buffer = gerar_pdf_fornecedores(fornecedores)
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name='fornecedores_rojemac.pdf'
    )


@export_bp.route('/api/export/pdf/<int:id>', methods=['GET'])
@login_required
def exportar_ficha(id):
    """Exportar ficha individual do fornecedor em PDF"""
    fornecedor = Fornecedor.query.get_or_404(id)
    avaliacoes = Avaliacao.query.filter_by(fornecedor_id=id)\
        .order_by(Avaliacao.data_avaliacao.desc()).all()
    
    buffer = gerar_pdf_ficha_fornecedor(fornecedor, avaliacoes)
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'ficha_{fornecedor.codigo}.pdf'
    )


@export_bp.route('/api/dashboard/stats', methods=['GET'])
@login_required
def dashboard_stats():
    """Estatísticas para o dashboard"""
    total = Fornecedor.query.count()
    ativos = Fornecedor.query.filter_by(status='ativo').count()
    inativos = Fornecedor.query.filter_by(status='inativo').count()
    bloqueados = Fornecedor.query.filter_by(status='bloqueado').count()
    
    # Fornecedores por categoria
    categorias = db.session.query(
        Categoria.nome, db.func.count(Fornecedor.id)
    ).outerjoin(Fornecedor, Fornecedor.categoria_id == Categoria.id)\
     .group_by(Categoria.nome)\
     .order_by(db.func.count(Fornecedor.id).desc())\
     .all()
    
    por_categoria = [{'nome': c[0], 'total': c[1]} for c in categorias]
    
    # Top 5 fornecedores por nota
    fornecedores = Fornecedor.query.all()
    top_fornecedores = []
    for f in fornecedores:
        nota = f.nota_media()
        if nota is not None:
            top_fornecedores.append({
                'codigo': f.codigo,
                'nome': f.nome_fantasia or f.razao_social,
                'nota_media': nota,
                'total_avaliacoes': len(f.avaliacoes)
            })
    top_fornecedores.sort(key=lambda x: x['nota_media'], reverse=True)
    top_fornecedores = top_fornecedores[:5]
    
    # Últimas avaliações
    ultimas = Avaliacao.query.order_by(Avaliacao.criado_em.desc()).limit(5).all()
    
    # Por tipo
    por_tipo = {
        'produto': Fornecedor.query.filter_by(tipo_fornecedor='produto').count(),
        'servico': Fornecedor.query.filter_by(tipo_fornecedor='servico').count(),
        'ambos': Fornecedor.query.filter_by(tipo_fornecedor='ambos').count()
    }
    
    return jsonify({
        'total': total,
        'ativos': ativos,
        'inativos': inativos,
        'bloqueados': bloqueados,
        'por_categoria': por_categoria,
        'top_fornecedores': top_fornecedores,
        'ultimas_avaliacoes': [a.to_dict() for a in ultimas],
        'por_tipo': por_tipo
    })
