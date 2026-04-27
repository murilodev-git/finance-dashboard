const express = require('express');
const fs = require('fs-extra');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;
const DB = './db.json';

app.use(express.json());
app.use(express.static('public'));

async function lerDados() {
  return await fs.readJson(DB);
}

async function salvarDados(dados) {
  await fs.writeJson(DB, dados);
}

app.get('/movimentos', async (req, res) => {
  let dados = await lerDados();
  const { mes, categoria } = req.query;

  if (mes) {
    dados = dados.filter(item => item.mes === mes);
  }

  if (categoria) {
    dados = dados.filter(item => item.categoria === categoria);
  }

  res.json(dados);
});

app.post('/movimentos', async (req, res) => {
  const dados = await lerDados();

  const novoId = dados.length > 0
    ? Math.max(...dados.map(item => item.id)) + 1
    : 1;

  const novo = {
    id: novoId,
    ...req.body
  };

  dados.push(novo);
  await salvarDados(dados);

  res.json(novo);
});

app.delete('/movimentos/:id', async (req, res) => {
  const dados = await lerDados();

  const novos = dados.filter(item => item.id != req.params.id);

  await salvarDados(novos);

  res.json({ mensagem: 'Movimento removido' });
});

app.get('/relatorio', async (req, res) => {
  const dados = await lerDados();

  let receitas = 0;
  let despesas = 0;

  dados.forEach(item => {
    if (item.categoria === 'Receita') {
      receitas += Number(item.valor);
    } else {
      despesas += Number(item.valor);
    }
  });

  const saldo = receitas - despesas;

  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

  doc.pipe(res);

  doc.fontSize(20).text('Relatório Financeiro', { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text(`Receitas: R$ ${receitas}`);
  doc.text(`Despesas: R$ ${despesas}`);
  doc.text(`Saldo Final: R$ ${saldo}`);
  doc.moveDown();

  doc.text('Lançamentos:');
  doc.moveDown();

  dados.forEach(item => {
    doc.text(`${item.descricao} | ${item.categoria} | R$ ${item.valor} | ${item.mes}`);
  });

  doc.end();
});

app.listen(PORT, () => {
  console.log(`Finance Dashboard rodando na porta ${PORT}`);
});