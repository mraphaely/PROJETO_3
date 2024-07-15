import { createServer } from 'node:http';
import fs from "node:fs";
import { v4 as uuidv4 } from 'uuid';
import { URLSearchParams } from 'node:url';

import lerDadosReceita from './helper/lerReceitas.js';
const receitas = [];
const PORT = 3333;

//link: https://www.notion.so/Atividade-03-7338c4483a174f499a17ba6dc82d1e3c

const server = createServer((request, response) => {
  const { url, method } = request;
  //#01 - adicionar a rota GET receitas
  if (method === "GET" && url === "/receitas") {
    lerDadosReceita((err, receitas) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Erro ao ler dados" }));
        return
      }
      //imprimir resultado
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(receitas));
    })
  } else if (method === "POST" && url === "/receitas") {
    //nome, categoria, ingredientes e modo de preparo.
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      const novaReceita = JSON.parse(body)
      lerDadosReceita((err, receitas) => {
        if (err) {
          response.writeHead(500, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ message: "Erro ao ler dados" }));
          return
        }
      })
      // if (body.nome === '' || body.categoria === '' || body.ingredientes === '' || body.modoDePreparo === '') {
      //     response.writeHead(404, { 'Content-Type': 'application/json' })
      //     response.end(JSON.stringify({ message: 'Preencha corretamente' }));
      //     return
      // }
      // novaReceita.id = receitas.length + 1
      novaReceita.id = uuidv4();
      receitas.push(novaReceita)
      fs.writeFile("receitas.json", JSON.stringify(receitas, null, 2), (err) => {
        if (err) {
          response.writeHead(500, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ message: "Erro ao ler receita" }));
          return
        }
        response.writeHead(201, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ novaReceita }));
      })

    })
  } else if (method === "GET" && url.startsWith("/receitas/")) {
    const id = parseInt(url.split("/")[2])
    const encontraReceita = receitas.find(
      (receita) => receita.id === id
    );
    if (!receitas) {
      response.writeHead(404, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ message: 'Receita não encontrado.' }));
      return
    }
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(encontraReceita));
  } else if (method === "PUT" && url.startsWith("/receitas/")) {
    const id = parseInt(url.split('/')[2]);
    let body = ''
    request.on("data", (chunk) => {
      body += chunk;
    })
    request.on('end', () => {
      const receitaAtual = JSON.parse(body)

      const indexReceita = receitas.findIndex((receita) => receita.id === id);

      if (indexReceita === -1) {
        response.writeHead(404, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: "Receita selecionada não existe." }));
        return;
      }

      receitas[indexReceita] = { ...receitas[indexReceita], ...receitaAtual };

      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(receitaAtual));
    });
  } else if (method === "DELETE" && url.startsWith("/receitas/")) {
    const id = parseInt(url.split('/')[2]);
    const receita = receitas.findIndex((receita) => receita.id === id);
    if (receita === -1) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Receita não encontrada" }));
      return
    }
    receitas.splice(receita, 1)
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Receita deletada" }));
  } else if (method === "GET" && url.startsWith("/categorias/")) {
    //localhost:3333/categorias/prato%20principal (replace) -> reduce
    const categoria = url.split("/")[2];

  } else if (method === "GET" && url.startsWith("/busca")) {
    //localhost:3333/busca?termo=cebola
    const urlParams = new URLSearchParams(url.split("?")[1]);
    const termo = urlParams.get("termo");
    //console.log(termo)
    lerDadosReceita((err, receitas) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Erro ao ler dados das receitas" }));
        return
      }

      const resultadoFiltrado = receitas.filter((receita) =>
        receita.nome.includes(termo) ||
        receita.categoria.includes(termo) ||
        receita.ingredientes.some((ingrediente) => ingrediente.includes(termo))
      );

      if (resultadoFiltrado.length === 0) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Nenhuma receita encontrada com o termo " + termo }));
        return
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(resultadoFiltrado));
    });
    //  const searchParams =  new URLSearchParams(paramsString);
  } else if (method === "GET" && url.startsWith("/ingredientes")) {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    const ingrediente = urlParams.get("ingrediente");

    lerDadosReceita((err, receita) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Erro ao ler dados das receitas" }));
        return
      }

      const resultado = receitas.filter((receita) => receita.ingrediente.some((ingrediente) => ingrediente.includes("ingrediente")));

      if (resultadoFiltrado.length === 0) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Nenhuma receita encontrada com o termo " + termo }));
        return
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(resultado))
    })
  } else {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Página não encontrada" }));
  }

});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});