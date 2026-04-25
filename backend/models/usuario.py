from models import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    ativo = db.Column(db.Boolean, default=True)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)
    
    def check_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'is_admin': self.is_admin,
            'ativo': self.ativo,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None
        }
