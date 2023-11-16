const pool = require("../conexao");

const listarCategorias = async (req, res) =>{

    try {

        const  { rows } = await pool.query('select * from categorias');

        res.status(200).json(rows);
        
    } catch (error) {

        res.status(500).json({mesangem: 'Erro do servidor'})
        
    };
    
};

const listarTransacao = async (req, res) => {

    const { id } = req.usuario;
    const {filtro} = req.query

    try {

    const query = `
    select 
    transacoes.id,transacoes.tipo ,transacoes.descricao, transacoes.valor, transacoes.data, transacoes.usuarios_id, transacoes.categoria_id, categorias.descricao
    from transacoes inner join categorias 
    on  transacoes.categoria_id = $1 and categorias.descricao = $2;`

        
        if(filtro.length > 0){

            const arrayFiltros = await Promise.all(
                filtro.map(async (elementoAtual) => {

                    const elemento = elementoAtual[0].toUpperCase() + elementoAtual.substring(1);

                    const filtros = await pool.query('select id from categorias where descricao = $1', [elemento]);

                    if (filtros.rows.length === 0) {
                        return null;
                    };

                    const { rows } = await pool.query(query, [filtros.rows[0].id, elemento]);

                    return rows;

                })
            );

            return res.status(200).json(arrayFiltros);

        };

     
        const {rowCount, rows} = await pool.query('select * from transacoes where usuarios_id = $1', [id]);

        if(rowCount < 1){
            return res.status(404).json({mensagem: 'Transação não encontrada!'})
        }

        res.status(200).json(rows)
        
    } catch (error) {
        console.log(error)
        res.status(500).json({mesangem: 'Erro do servidor'})

    }
    
};

const listarTransacaoPorID = async (req, res) => {

    const  idUsuario = req.usuario.id;
    const {id} = req.params;
  
    try {
        
        const { rowCount, rows } = await pool.query('select * from transacoes where id = $1 and usuarios_id = $2', [id, idUsuario])

        if(rowCount < 1){
            return res.status(404).json({mensagem: 'Transação não encontrada!'})
        };
       
        res.status(200).json(rows[0])

    } catch (error) {
        res.status(500).json({mesangem: 'Erro do servidor'});
    };

};

const cadastroTransacao = async (req, res) => {
    const {id} = req.usuario
    const {tipo, descricao, valor, data, categoria_id} = req.body

    const query = `
    insert into transacoes 
    (descricao, valor, data, categoria_id, usuarios_id, tipo)
    values
    ($1, $2, $3, $4, $5, $6) returning *;
    `

    try {

        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
        };
       
        const {rowCount} = await pool.query('select * from categorias where id = $1', [categoria_id]);
       
        if(rowCount < 1){
            return res.status(404).json({mensagem: 'Categoria não encontrada!'});
        };
      
        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({ mensagem: 'O tipo deve ser "entrada" ou "saida".' });
        };

        const { rows } = await pool.query(query, [descricao, valor, data, categoria_id, id, tipo]);

        res.status(201).json(rows);
        
    } catch (error) {
        console.log(error)
        res.status(500).json({mesangem: 'Erro do servidor'});
    }

};

const atualizarTransacaoId = async (req, res) => {
    const {id} = req.usuario;
    const idTransacao = req.params.id;
    const {descricao, valor, data, categoria_id, tipo} = req.body;

    try {

        const validacaoTransicao = await pool.query('select * from  transacoes where id = $1 and usuarios_id = $2', [idTransacao, id]);

        if(validacaoTransicao.rowCount < 1){
            return res.status(404).json({mensagem: 'Transação não encontrada!'})
        };
 
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
          };
   
        const validacaoCategoria = await pool.query('select * from categorias where id = $1', [categoria_id]);
   
        if(validacaoCategoria.rowCount < 1){
            return res.status(404).json({mensagem: 'Categoria não encontrada!'});
        };
  
        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({ mensagem: 'O tipo deve ser "entrada" ou "saida".' });
        };
      
        await pool.query('update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 where id = $6', [descricao, valor, data, categoria_id, tipo, idTransacao]);
    
        res.status(204).send();

    } catch (error) {
        console.log(error);
        res.status(500).json({mensagem: 'Erro do servidor'});
    };

};

const deletarTransacaoPorId = async (req, res) => {

    const {id} = req.usuario;
    const idTransacao = req.params.id;

    if(!idTransacao){
        return res.status(400).json({ mensagem: 'Informe o id da transação' });
    };

    try {

        const validacaoTransicao = await pool.query('select * from  transacoes where id = $1 and usuarios_id = $2', [idTransacao, id]);

        if(validacaoTransicao.rowCount < 1){
            return res.status(404).json({mensagem: 'Transação não encontrada!'})
        };

        await pool.query('delete from transacoes where id = $1', [idTransacao]);

        res.status(204).send()
        
    } catch (error) {
        console.log(error);
        res.status(500).json({mensagem: 'Erro no servidor'});

    };

};

const obterExtrato = async (req, res) => {

    const {id} = req.usuario;

    try {

        const valorEntrada = await pool.query('select sum(valor) from transacoes where usuarios_id = $1 and tipo = $2', [id, 'entrada']);

        const valorSaida = await pool.query('select sum(valor) from transacoes where usuarios_id = $1 and tipo = $2', [id,'saida']);

        const entrada = valorEntrada.rows[0].sum !== null ? valorEntrada.rows[0].sum : 0
        const saida = valorSaida.rows[0].sum !== null ? valorSaida.rows[0].sum : 0
      
        res.status(200).json({
            entrada: entrada,
            saida: saida
        });
        
    } catch (error) {

        console.log(error);
        res.status(500).json({mensagem: 'Erro do servidoraa'});
        
    }

};

module.exports = {
    listarCategorias,
    listarTransacao,
    listarTransacaoPorID,
    cadastroTransacao,
    atualizarTransacaoId,
    deletarTransacaoPorId,
    obterExtrato
};