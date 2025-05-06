const { compareSync } = require("bcrypt");
const { usersDAO } = require('../model/users.dao');


const authController = {
    showLoginPage(req, res) {
        res.render('login');
    },
    login(req, res) {

        //pega o cpf e a senha que veio do formulario(requisição)
        const { cpf, password } = req.body;
        const user = usersDAO.findByCpf(cpf);
        console.log({ user });


        if (!user) {
            console.log('Login falhou: Usuário não encontrado com o CPF fornecido.');
            return res.send("NAO DEU! Usuário não encontrado.");
        }

        //verifica meu erro
        if (user.password === null || user.password === undefined) {
            console.error('Login falhou: Senha recuperada do banco é nula ou indefinida para o usuário encontrado.');
            return res.send("NAO DEU! Erro interno.");
        }


        if (cpf == user.cpf && compareSync(password, user.password)) {
            // LOGADO
            req.session.isAuth = true;

            const sessionUser = {
                id: user.id,
                cpf: user.cpf,
                role: user.role
            }

            req.session.user = sessionUser;
            console.log('Login bem-sucedido!'); 

            return res.redirect("/users"); 
        } else {
            // NAO LOGADO
            console.log('Login falhou: CPF ou senha incorretos.');
            return res.send("NAO DEU! Senha ou CPF incorretos.");
        }
    },

    logoff(req, res) {
        req.session.destroy();
        res.redirect('/login');
    }
}

module.exports = authController;