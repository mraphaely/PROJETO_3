import { createServer } from 'node:http';
import fs from "node:fs";
import { v4 as uuidv4 } from 'uuid';

import lerDadosReceita from './helper/lerReceitas.js';
const receitas = [];
const PORT = 3333;

//link: https://www.notion.so/Atividade-03-7338c4483a174f499a17ba6dc82d1e3c

const server = createServer((request, response)=>{
    const { url, method } = request;
    //#01 - adicionar a rota GET receitas
    if(method === "GET" && url === "/receitas"){
      lerDadosReceita((err, receitas)=>{
        if(err){
          response.writeHead(500, {"Content-Type":"application/json"});
          response.end(JSON.stringify({message: "Erro ao ler dados"}));
          return
        }
        //imprimir resultado
          response.writeHead(200, {"Content-Type":"application/json"});
          response.end(JSON.stringify(receitas));
      })      
    }else if(method === "POST" && url === "/receitas"){
        //nome, categoria, ingredientes e modo de preparo.
           let body = '';
           request.on('data', (chunk)=>{
            body += chunk;
           });
           request.on('end', ()=>{
            const novaReceita = JSON.parse(body)
            lerDadosReceita((err, receitas)=>{
              if(err){
              response.writeHead(500, {"Content-Type":"application/json"});
              response.end(JSON.stringify({message: "Erro ao ler dados"}));
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
              if(err){
                response.writeHead(500, {"Content-Type":"application/json"});
                response.end(JSON.stringify({message: "Erro ao ler receita"}));
                return
                }
                response.writeHead(201, { "Content-Type": "application/json" })
                response.end(JSON.stringify({novaReceita}));
            })  

        })
    }else if(method === "GET" && url.startsWith("/receitas/")){

    }else if(method === "PUT" && url.startsWith("/receitas/")){

    }else if(method === "DELETE" && url.startsWith("/receitas/")){

    }else if(method === "GET" && url.startsWith("/busca")){

    }else if(method === "GET" && url.startsWith("/ingredientes")){

    }else{
        response.writeHead(404, {"Content-Type": "application/json"});
        response.end(JSON.stringify({message: "Página não encontrada"}));
    }

});

server.listen(PORT, ()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
});