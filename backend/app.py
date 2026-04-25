import os
import sys
from flask import Flask, send_from_directory, session
from flask_cors import CORS
from flask_migrate import Migrate, upgrade
from datetime import timedelta
from config import Config
from models import db
from models.usuario import Usuario
from models.categoria import Categoria, Subcategoria
from models.fornecedor import Fornecedor
from models.avaliacao import Avaliacao

# Rotas
from routes.auth import auth_bp
from routes.fornecedores import fornecedores_bp
from routes.avaliacoes import avaliacoes_bp
from routes.categorias import categorias_bp
from routes.export import export_bp


def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(Config)
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    
    # CORS para dev
    CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'http://localhost:3000'])
    
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # Registrar blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(fornecedores_bp)
    app.register_blueprint(avaliacoes_bp)
    app.register_blueprint(categorias_bp)
    app.register_blueprint(export_bp)
    
    # Servir frontend buildado (produção)
    frontend_dist = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'dist')
    
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api/'):
            return {'error': 'Rota não encontrada'}, 404
        
        if path and os.path.exists(os.path.join(frontend_dist, path)):
            return send_from_directory(frontend_dist, path)
        
        index_path = os.path.join(frontend_dist, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(frontend_dist, 'index.html')
        
        return {'message': 'API Controle de Fornecedores - Grupo Rojemac'}, 200
    
    # Inicializar banco, rodar migrações e seed data
    with app.app_context():
        try:
            # Roda as migrações automaticamente no startup (Railway safe)
            migrations_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'migrations')
            upgrade(directory=migrations_dir)
            print("Migrações executadas com sucesso.")
        except Exception as e:
            print(f"Erro ao rodar migrações automaticamente: {e}")
            
        seed_data()
    
    return app


def seed_data():
    """Popula dados iniciais (categorias e admin)"""
    try:
        # Criar admin se não existir
        admin = Usuario.query.filter_by(email='isabely@admin.com').first()
        if not admin:
            admin = Usuario(
                nome='Isabely - Administrador',
                email='isabely@admin.com',
                is_admin=True
            )
            admin.set_senha('1907')
            db.session.add(admin)
            print('Admin criado: isabely@admin.com')
        
        # Categorias padrão
        categorias_padrao = [
        'Administrativo',
        'Tecnologia (TI)',
        'Marketing & Comunicação',
        'Gráfica & Impressos',
        'Logística & Transporte',
        'Recursos Humanos (RH)',
        'Alimentação & Copa',
        'Limpeza & Higiene',
        'Manutenção & Infraestrutura',
        'Serviços Gerais',
        'Compras Operacionais',
        'Eventos & Ações Promocionais',
        'Segurança & EPIs',
        'Jurídico & Contábil',
        'Financeiro',
        'Mobiliário & Escritório',
        'Uniformes & Vestuário',
        'Produção',
        'Estoque & Armazenagem',
    ]
    
        for nome in categorias_padrao:
            existente = Categoria.query.filter_by(nome=nome).first()
            if not existente:
                db.session.add(Categoria(nome=nome))
        
        db.session.commit()
        print(f'{len(categorias_padrao)} categorias verificadas/criadas')
    except Exception as e:
        print("Tabelas ainda nao criadas. Ignorando seed_data.")


app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
