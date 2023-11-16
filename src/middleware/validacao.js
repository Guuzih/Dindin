const jwt = require('jsonwebtoken');
const senhaJwt = require('../senhaJwt');
const pool = require('../conexao');

const verificarUsuarioLogado =async (req, res, next) =>{

    const { authorization } = req.headers;

    if(!authorization){
        return res.status(401).json({mensagem:'Não autorizado 3'});
    };

    const token = authorization.split(' ')[1];

    try{

        const {id} = jwt.verify(token, senhaJwt);

        const usuario = await pool.query('select * from usuarios where id = $1', [id])

        if(!usuario){
            return res.status(401).json({mensagem: 'Não autorizado 1'});
        };

        req.usuario = usuario.rows[0];

        next()

    }catch(error){
        console.log(error)
        return res.status(401).json({mensagem:'Não autorizado 2'})
    };

};

module.exports = {
    verificarUsuarioLogado
};