from models import db
from datetime import datetime


class Categoria(db.Model):
    __tablename__ = 'categorias'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), unique=True, nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    
    subcategorias = db.relationship('Subcategoria', backref='categoria', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None,
            'subcategorias': [s.to_dict() for s in self.subcategorias]
        }


class Subcategoria(db.Model):
    __tablename__ = 'subcategorias'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'categoria_id': self.categoria_id,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None
        }
