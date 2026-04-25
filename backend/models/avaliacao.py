from models import db
from datetime import datetime, date


class Avaliacao(db.Model):
    __tablename__ = 'avaliacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    fornecedor_id = db.Column(db.Integer, db.ForeignKey('fornecedores.id'), nullable=False)
    data_avaliacao = db.Column(db.Date, default=date.today)
    
    # Notas de 0 a 10
    qualidade = db.Column(db.Float, default=0)
    prazo_entrega = db.Column(db.Float, default=0)
    atendimento = db.Column(db.Float, default=0)
    custo_beneficio = db.Column(db.Float, default=0)
    confiabilidade = db.Column(db.Float, default=0)
    
    # Média automática
    nota_final = db.Column(db.Float, default=0)
    
    observacoes = db.Column(db.Text)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    
    def calcular_nota_final(self):
        """Calcula a média das 5 notas"""
        notas = [self.qualidade, self.prazo_entrega, self.atendimento, 
                 self.custo_beneficio, self.confiabilidade]
        notas_validas = [n for n in notas if n is not None]
        if notas_validas:
            self.nota_final = round(sum(notas_validas) / len(notas_validas), 1)
        else:
            self.nota_final = 0
        return self.nota_final
    
    def to_dict(self):
        return {
            'id': self.id,
            'fornecedor_id': self.fornecedor_id,
            'fornecedor_nome': self.fornecedor.razao_social if self.fornecedor else None,
            'fornecedor_codigo': self.fornecedor.codigo if self.fornecedor else None,
            'data_avaliacao': self.data_avaliacao.isoformat() if self.data_avaliacao else None,
            'qualidade': self.qualidade,
            'prazo_entrega': self.prazo_entrega,
            'atendimento': self.atendimento,
            'custo_beneficio': self.custo_beneficio,
            'confiabilidade': self.confiabilidade,
            'nota_final': self.nota_final,
            'observacoes': self.observacoes,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None
        }
