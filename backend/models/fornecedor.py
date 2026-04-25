from models import db
from datetime import datetime, date


class Fornecedor(db.Model):
    __tablename__ = 'fornecedores'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)  # FORN-0001
    
    # Dados Gerais
    razao_social = db.Column(db.String(200), nullable=False)
    nome_fantasia = db.Column(db.String(200))
    cnpj = db.Column(db.String(20), unique=True)
    inscricao_estadual = db.Column(db.String(30))
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'))
    subcategoria = db.Column(db.String(100))
    tipo_fornecedor = db.Column(db.String(20), default='produto')  # produto / serviço / ambos
    porte_empresa = db.Column(db.String(30))  # MEI / ME / EPP / Médio / Grande
    data_cadastro = db.Column(db.Date, default=date.today)
    status = db.Column(db.String(20), default='ativo')  # ativo / inativo / bloqueado
    
    # Contato
    contato_nome = db.Column(db.String(100))
    contato_cargo = db.Column(db.String(80))
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(150))
    whatsapp = db.Column(db.String(20))
    
    # Endereço
    cidade = db.Column(db.String(100))
    estado = db.Column(db.String(2))
    pais = db.Column(db.String(50), default='Brasil')
    
    # Financeiro
    forma_pagamento = db.Column(db.String(50))  # boleto, PIX, transferência, etc.
    prazo_pagamento = db.Column(db.String(30))  # 30, 60, 90 dias
    
    # Extra
    site_url = db.Column(db.String(300))
    observacoes = db.Column(db.Text)
    
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    categoria_rel = db.relationship('Categoria', backref='fornecedores', lazy=True)
    avaliacoes = db.relationship('Avaliacao', backref='fornecedor', lazy=True, cascade='all, delete-orphan')
    
    @staticmethod
    def gerar_codigo():
        """Gera próximo código FORN-XXXX"""
        ultimo = Fornecedor.query.order_by(Fornecedor.id.desc()).first()
        if ultimo:
            num = ultimo.id + 1
        else:
            num = 1
        return f'FORN-{num:04d}'
    
    def nota_media(self):
        """Calcula nota média das avaliações"""
        if not self.avaliacoes:
            return None
        notas = [a.nota_final for a in self.avaliacoes if a.nota_final is not None]
        if not notas:
            return None
        return round(sum(notas) / len(notas), 1)
    
    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'razao_social': self.razao_social,
            'nome_fantasia': self.nome_fantasia,
            'cnpj': self.cnpj,
            'inscricao_estadual': self.inscricao_estadual,
            'categoria_id': self.categoria_id,
            'categoria_nome': self.categoria_rel.nome if self.categoria_rel else None,
            'subcategoria': self.subcategoria,
            'tipo_fornecedor': self.tipo_fornecedor,
            'porte_empresa': self.porte_empresa,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'status': self.status,
            'contato_nome': self.contato_nome,
            'contato_cargo': self.contato_cargo,
            'telefone': self.telefone,
            'email': self.email,
            'whatsapp': self.whatsapp,
            'cidade': self.cidade,
            'estado': self.estado,
            'pais': self.pais,
            'forma_pagamento': self.forma_pagamento,
            'prazo_pagamento': self.prazo_pagamento,
            'site_url': self.site_url,
            'observacoes': self.observacoes,
            'nota_media': self.nota_media(),
            'total_avaliacoes': len(self.avaliacoes),
            'criado_em': self.criado_em.isoformat() if self.criado_em else None,
            'atualizado_em': self.atualizado_em.isoformat() if self.atualizado_em else None
        }
