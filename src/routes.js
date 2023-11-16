const express = require('express');
const { cadastroUsuario, logar, obterUsuario, atualizarUsuario } = require('./controller/usuario');
const { verificarUsuarioLogado } = require('./middleware/validacao');
const { listarCategorias, listarTransacao, listarTransacaoPorID, cadastroTransacao, atualizarTransacaoId, obterExtrato, deletarTransacaoPorId } = require('./controller/transacao');
const routes = express.Router()


routes.post('/usuario', cadastroUsuario);
routes.post('/login', logar);


routes.use(verificarUsuarioLogado)

routes.get('/usuario', obterUsuario);
routes.get('/categoria', listarCategorias);
routes.get('/transacao', listarTransacao);
routes.get('/transacao/extrato', obterExtrato);
routes.get('/transacao/:id', listarTransacaoPorID);


routes.post('/transacao', cadastroTransacao);

routes.put('/usuario', atualizarUsuario);
routes.put('/transacao/:id', atualizarTransacaoId);

routes.delete('/transacao/:id', deletarTransacaoPorId);


module.exports = routes;