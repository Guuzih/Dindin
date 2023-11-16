const bcrypt = require('bcrypt');
const pool = require('../conexao');
const jwt = require('jsonwebtoken');
const senhaJwt = require('../senhaJwt');

const cadastroUsuario = async (req,res) => {
    const{nome, email, senha} = req.body
    const query = 'insert into usuarios(nome, email,senha) values ($1, $2, $3) returning *;'


    try {

        if(!nome || !email || !senha){
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.'});
        }

        const emailEncontrado = await pool.query('select * from usuarios where email = $1',[email]);

        if(emailEncontrado.rowCount > 0){
            return res.status(400).json({"mensagem": "Já existe usuário cadastrado com o e-mail informado."})
        };

        const senhaCript =  await bcrypt.hash(senha, 10);

        const novoUsuario = await pool.query(query, [nome, email, senhaCript]);

        return res.json(novoUsuario.rows[0]);

    } catch (error) {
        console.log(error)
        return res.status(500).json({mensagem: 'Erro do servidor'})
    }

};

const logar = async (req, res) => {
    
    const {email, senha} = req.body;

    try {

        if(!email || !senha){
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.'});
        };

        const usuario = await pool.query('select * from usuarios where email = $1',[email]);

        if(usuario.rowCount < 1){
            return res.status(404).json({mensagem: 'Email invalida'});
        };

        const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);

        if(!senhaValida){
            return res.status(404).json({mensagem: 'Senha invalida'});
        };

        const token = jwt.sign({ id: usuario.rows[0].id }, senhaJwt, {expiresIn: '8h',});

        const {senha: _, ...usuarioLogado} = usuario.rows[0];

        req.headers.authorization = `Bearer ${token}`
     
        return res.json({usuario: usuarioLogado, token});
        
    } catch (error) {

        console.log(error)
        return res.status(500).json({mensagem: 'Erro do servidor'});
        
    }

};

const obterUsuario = async (req, res) =>{

    if (!req.usuario) {
        return res.status(401).json({ mensagem: 'Para acessar este recurso, um token de autenticação válido deve ser enviado.' });
      }

    return res.json(req.usuario);
    
};

const atualizarUsuario = async (req, res) => {
    const {nome, email, senha} = req.body;
    const {id} = req.usuario;

    try {

        if(!nome || !email || !senha){
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.'});
        };

        const {rowCount}= await pool.query('select * from usuarios where email = $1', [email]);

        if(rowCount > 1){
            return res.status(404).json({mensagem: 'O e-mail informado já está sendo utilizado por outro usuário.'});
        };

        const senhaCript =  await bcrypt.hash(senha, 10);

        await pool.query('update usuarios set nome = $1, email = $2, senha = $3 where id = $4', [nome, email, senhaCript, id]);
        
        res.status(204).json();
        
    } catch (error) {

        console.log(error)
        return res.status(500).json({mensagem: 'Erro do servidor'});

    }


};


module.exports = {
    cadastroUsuario,
    logar,
    obterUsuario,
    atualizarUsuario
};