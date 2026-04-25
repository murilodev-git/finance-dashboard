async function carregarDados() {
  const mes = document.getElementById('filtroMes').value;
  const categoria = document.getElementById('filtroCategoria').value;

  const res = await fetch(`/movimentos?mes=${mes}&categoria=${categoria}`);
  const dados = await res.json();

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

  document.getElementById('resumo').innerHTML = `
    <h3>Receitas: R$ ${receitas}</h3>
    <h3>Despesas: R$ ${despesas}</h3>
    <h2>Saldo: R$ ${saldo}</h2>
  `;

  document.getElementById('lista').innerHTML = dados.map(item => `
    <div class="item">
      <h3>${item.descricao}</h3>
      <p>${item.categoria} - ${item.mes}</p>
      <strong>R$ ${item.valor}</strong>
      <button onclick="remover(${item.id})">Excluir</button>
    </div>
  `).join('');
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const novo = {
    descricao: document.getElementById('descricao').value,
    categoria: document.getElementById('categoria').value,
    valor: Number(document.getElementById('valor').value),
    mes: document.getElementById('mes').value
  };

  await fetch('/movimentos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(novo)
  });

  document.getElementById('form').reset();
  carregarDados();
});

async function remover(id) {
  await fetch(`/movimentos/${id}`, {
    method: 'DELETE'
  });

  carregarDados();
}

function baixarRelatorio() {
  window.open('/relatorio');
}

document.getElementById('filtroMes').addEventListener('change', carregarDados);
document.getElementById('filtroCategoria').addEventListener('change', carregarDados);

carregarDados();