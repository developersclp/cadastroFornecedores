import io
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime


# Cores Rojemac
AZUL_MARINHO = colors.HexColor('#213564')
AZUL_ESCURO = colors.HexColor('#1a2a4e')
AZUL_CLARO = colors.HexColor('#2e4a7a')
BRANCO = colors.white
CINZA_CLARO = colors.HexColor('#F0F2F5')
CINZA_MEDIO = colors.HexColor('#E8EBF0')
VERDE = colors.HexColor('#27AE60')
AMARELO = colors.HexColor('#F39C12')
VERMELHO = colors.HexColor('#E74C3C')
DOURADO = colors.HexColor('#D4A853')


def get_logo_path():
    """Retorna caminho do logo"""
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logo_path = os.path.join(base, 'static', 'logo.png')
    if os.path.exists(logo_path):
        return logo_path
    return None


def header_footer(canvas, doc):
    """Header e footer profissional no PDF"""
    canvas.saveState()
    width, height = doc.pagesize
    
    # Header - barra azul marinho
    canvas.setFillColor(AZUL_MARINHO)
    canvas.rect(0, height - 25*mm, width, 25*mm, fill=True)
    
    # Texto do header
    canvas.setFillColor(BRANCO)
    canvas.setFont('Helvetica-Bold', 14)
    canvas.drawString(15*mm, height - 17*mm, 'GRUPO ROJEMAC')
    canvas.setFont('Helvetica', 9)
    canvas.drawString(15*mm, height - 22*mm, 'Controle de Fornecedores')
    
    # Data no header
    canvas.setFont('Helvetica', 8)
    data_str = datetime.now().strftime('%d/%m/%Y %H:%M')
    canvas.drawRightString(width - 15*mm, height - 17*mm, data_str)
    
    # Linha dourada abaixo do header
    canvas.setStrokeColor(DOURADO)
    canvas.setLineWidth(2)
    canvas.line(0, height - 25*mm, width, height - 25*mm)
    
    # Footer
    canvas.setFillColor(AZUL_MARINHO)
    canvas.rect(0, 0, width, 12*mm, fill=True)
    canvas.setFillColor(BRANCO)
    canvas.setFont('Helvetica', 7)
    canvas.drawString(15*mm, 5*mm, f'© {datetime.now().year} Grupo Rojemac — Sistema de Controle de Fornecedores')
    canvas.drawRightString(width - 15*mm, 5*mm, f'Página {doc.page}')
    
    canvas.restoreState()


def gerar_pdf_fornecedores(fornecedores):
    """Gera PDF com lista de todos os fornecedores"""
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        topMargin=30*mm,
        bottomMargin=18*mm,
        leftMargin=12*mm,
        rightMargin=12*mm
    )
    
    styles = getSampleStyleSheet()
    
    titulo_style = ParagraphStyle(
        'TituloRojemac',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=AZUL_MARINHO,
        spaceAfter=5*mm,
        alignment=TA_LEFT
    )
    
    subtitulo_style = ParagraphStyle(
        'SubtituloRojemac',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#666666'),
        spaceAfter=8*mm
    )
    
    celula_style = ParagraphStyle(
        'CelulaRojemac',
        parent=styles['Normal'],
        fontSize=7,
        leading=9
    )
    
    elements = []
    
    # Título
    elements.append(Paragraph('Relatório de Fornecedores', titulo_style))
    elements.append(Paragraph(
        f'Total de {len(fornecedores)} fornecedor(es) cadastrado(s) — Gerado em {datetime.now().strftime("%d/%m/%Y às %H:%M")}',
        subtitulo_style
    ))
    
    # Linha decorativa
    elements.append(HRFlowable(
        width="100%", thickness=1, color=DOURADO,
        spaceAfter=5*mm, spaceBefore=0
    ))
    
    if fornecedores:
        # Cabeçalho da tabela
        header = ['Código', 'Razão Social', 'Nome Fantasia', 'CNPJ', 'Categoria', 
                  'Tipo', 'Status', 'Cidade/UF', 'Contato', 'Nota']
        
        data = [header]
        
        for f in fornecedores:
            status_text = f.status.upper() if f.status else '-'
            cidade_uf = f'{f.cidade}/{f.estado}' if f.cidade and f.estado else (f.cidade or f.estado or '-')
            nota = f.nota_media()
            nota_text = f'{nota:.1f}' if nota else '-'
            
            row = [
                Paragraph(f.codigo or '-', celula_style),
                Paragraph(f.razao_social or '-', celula_style),
                Paragraph(f.nome_fantasia or '-', celula_style),
                Paragraph(f.cnpj or '-', celula_style),
                Paragraph(f.categoria_rel.nome if f.categoria_rel else '-', celula_style),
                Paragraph(f.tipo_fornecedor or '-', celula_style),
                Paragraph(status_text, celula_style),
                Paragraph(cidade_uf, celula_style),
                Paragraph(f.contato_nome or '-', celula_style),
                Paragraph(nota_text, celula_style),
            ]
            data.append(row)
        
        col_widths = [22*mm, 45*mm, 40*mm, 35*mm, 30*mm, 20*mm, 20*mm, 28*mm, 30*mm, 15*mm]
        
        table = Table(data, colWidths=col_widths, repeatRows=1)
        
        table_style = TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), AZUL_MARINHO),
            ('TEXTCOLOR', (0, 0), (-1, 0), BRANCO),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 7),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
            ('LINEBELOW', (0, 0), (-1, 0), 2, DOURADO),
        ])
        
        # Cores alternadas nas linhas
        for i in range(1, len(data)):
            if i % 2 == 0:
                table_style.add('BACKGROUND', (0, i), (-1, i), CINZA_CLARO)
            
            # Cor do status
            fornecedor = fornecedores[i - 1]
            if fornecedor.status == 'ativo':
                table_style.add('TEXTCOLOR', (6, i), (6, i), VERDE)
            elif fornecedor.status == 'bloqueado':
                table_style.add('TEXTCOLOR', (6, i), (6, i), VERMELHO)
            elif fornecedor.status == 'inativo':
                table_style.add('TEXTCOLOR', (6, i), (6, i), AMARELO)
        
        table.setStyle(table_style)
        elements.append(table)
    else:
        elements.append(Paragraph('Nenhum fornecedor encontrado.', styles['Normal']))
    
    doc.build(elements, onFirstPage=header_footer, onLaterPages=header_footer)
    return buffer


def gerar_pdf_ficha_fornecedor(fornecedor, avaliacoes):
    """Gera PDF com ficha completa de um fornecedor"""
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=30*mm,
        bottomMargin=18*mm,
        leftMargin=15*mm,
        rightMargin=15*mm
    )
    
    styles = getSampleStyleSheet()
    
    titulo_style = ParagraphStyle(
        'TituloFicha', parent=styles['Heading1'],
        fontSize=18, textColor=AZUL_MARINHO, spaceAfter=3*mm
    )
    
    secao_style = ParagraphStyle(
        'SecaoFicha', parent=styles['Heading2'],
        fontSize=12, textColor=AZUL_MARINHO, spaceBefore=6*mm, spaceAfter=3*mm
    )
    
    campo_style = ParagraphStyle(
        'CampoFicha', parent=styles['Normal'],
        fontSize=9, leading=13
    )
    
    valor_style = ParagraphStyle(
        'ValorFicha', parent=styles['Normal'],
        fontSize=9, leading=13, textColor=colors.HexColor('#333333')
    )
    
    elements = []
    
    # Título
    elements.append(Paragraph(f'Ficha do Fornecedor — {fornecedor.codigo}', titulo_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=DOURADO, spaceAfter=5*mm))
    
    # ═══ DADOS GERAIS ═══
    elements.append(Paragraph('📋 Dados Gerais', secao_style))
    
    dados_gerais = [
        ['Código:', fornecedor.codigo or '-', 'Status:', (fornecedor.status or '-').upper()],
        ['Razão Social:', fornecedor.razao_social or '-', 'Nome Fantasia:', fornecedor.nome_fantasia or '-'],
        ['CNPJ:', fornecedor.cnpj or '-', 'Inscrição Estadual:', fornecedor.inscricao_estadual or '-'],
        ['Categoria:', fornecedor.categoria_rel.nome if fornecedor.categoria_rel else '-', 'Subcategoria:', fornecedor.subcategoria or '-'],
        ['Tipo:', fornecedor.tipo_fornecedor or '-', 'Porte:', fornecedor.porte_empresa or '-'],
        ['Data Cadastro:', fornecedor.data_cadastro.strftime('%d/%m/%Y') if fornecedor.data_cadastro else '-', '', ''],
    ]
    
    t = Table(dados_gerais, colWidths=[35*mm, 55*mm, 35*mm, 55*mm])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('BACKGROUND', (0, 0), (-1, -1), CINZA_CLARO),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#DDDDDD')),
    ]))
    elements.append(t)
    
    # ═══ CONTATO ═══
    elements.append(Paragraph('📞 Contato', secao_style))
    
    dados_contato = [
        ['Nome:', fornecedor.contato_nome or '-', 'Cargo:', fornecedor.contato_cargo or '-'],
        ['Telefone:', fornecedor.telefone or '-', 'WhatsApp:', fornecedor.whatsapp or '-'],
        ['E-mail:', fornecedor.email or '-', 'Site/URL:', fornecedor.site_url or '-'],
    ]
    
    t2 = Table(dados_contato, colWidths=[35*mm, 55*mm, 35*mm, 55*mm])
    t2.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('BACKGROUND', (0, 0), (-1, -1), CINZA_CLARO),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#DDDDDD')),
    ]))
    elements.append(t2)
    
    # ═══ ENDEREÇO ═══
    elements.append(Paragraph('📍 Endereço', secao_style))
    
    dados_end = [
        ['Cidade:', fornecedor.cidade or '-', 'Estado:', fornecedor.estado or '-', 'País:', fornecedor.pais or '-'],
    ]
    
    t3 = Table(dados_end, colWidths=[25*mm, 40*mm, 25*mm, 25*mm, 20*mm, 45*mm])
    t3.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTNAME', (4, 0), (4, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, -1), CINZA_CLARO),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#DDDDDD')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t3)
    
    # ═══ FINANCEIRO ═══
    elements.append(Paragraph('💰 Informações Financeiras', secao_style))
    
    dados_fin = [
        ['Forma de Pagamento:', fornecedor.forma_pagamento or '-', 'Prazo:', fornecedor.prazo_pagamento or '-'],
    ]
    
    t4 = Table(dados_fin, colWidths=[40*mm, 50*mm, 30*mm, 60*mm])
    t4.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, -1), CINZA_CLARO),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#DDDDDD')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t4)
    
    # ═══ AVALIAÇÕES ═══
    if avaliacoes:
        elements.append(Paragraph('⭐ Avaliações', secao_style))
        
        nota_media = fornecedor.nota_media()
        if nota_media:
            elements.append(Paragraph(
                f'<b>Nota Média Geral: {nota_media:.1f} / 10</b> ({len(avaliacoes)} avaliação(ões))',
                campo_style
            ))
            elements.append(Spacer(1, 3*mm))
        
        aval_header = ['Data', 'Qualidade', 'Prazo', 'Atendimento', 'Custo-Benefício', 'Confiabilidade', 'Nota Final', 'Obs.']
        aval_data = [aval_header]
        
        for a in avaliacoes:
            aval_data.append([
                a.data_avaliacao.strftime('%d/%m/%Y') if a.data_avaliacao else '-',
                f'{a.qualidade:.1f}',
                f'{a.prazo_entrega:.1f}',
                f'{a.atendimento:.1f}',
                f'{a.custo_beneficio:.1f}',
                f'{a.confiabilidade:.1f}',
                f'{a.nota_final:.1f}',
                (a.observacoes or '-')[:40]
            ])
        
        t5 = Table(aval_data, colWidths=[22*mm, 20*mm, 18*mm, 22*mm, 26*mm, 24*mm, 20*mm, 28*mm])
        t5.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), AZUL_MARINHO),
            ('TEXTCOLOR', (0, 0), (-1, 0), BRANCO),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 7),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
            ('LINEBELOW', (0, 0), (-1, 0), 2, DOURADO),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        for i in range(1, len(aval_data)):
            if i % 2 == 0:
                t5.setStyle(TableStyle([('BACKGROUND', (0, i), (-1, i), CINZA_CLARO)]))
        
        elements.append(t5)
    
    # ═══ OBSERVAÇÕES ═══
    if fornecedor.observacoes:
        elements.append(Paragraph('📝 Observações', secao_style))
        elements.append(Paragraph(fornecedor.observacoes, valor_style))
    
    doc.build(elements, onFirstPage=header_footer, onLaterPages=header_footer)
    return buffer
