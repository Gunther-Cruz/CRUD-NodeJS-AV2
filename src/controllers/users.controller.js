const { hashSync } = require("bcrypt");
const { usersDAO, countUsers } = require("../model/users.dao.js");
const User = require("../model/users.model.js");
const Crypto = require("crypto");

const usersController = {
    showAddUserForm(req, res) {
        res.render('addUser');
    },
    getAll: (req, res) => {
        const resultado = usersDAO.findAll();
        res.json(resultado);
    },

    create: async (req, res) => {
        console.log({ body: req.body });
        const { name, cpf, email, password, role, telefone } = req.body;
        //validacao basica
        if (!name || !cpf || !email || !password) {
            return res.status(400).send('Erro no cadastro: Campos obrigatórios faltando.');
        }

        try {
            //definicao automatica de perfil
            //const userCount = countUsers();
            //const role = userCount === 0 ? 'ADMIN' : 'CLIENTE';
            //console.log(`Perfil atribuído para o novo usuário: ${role}`);

            const id = Crypto.randomUUID();
            const hashedpassword = hashSync(password, 10);

            const user = new User(id, name, cpf, email, hashedpassword, role);
            usersDAO.insert(user);

            //telefone e email. podia ter feito condicional pra verificar          
            usersDAO.insertTelefone(id, telefone, true);
            usersDAO.insertEmail(id, email, true);

            res.redirect("/login");
        } catch (error) {
            //console.error('Erro durante o cadastro de usuário:', error);
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                res.status(400).send('CPF ou Email já existem.');
            } else {
                res.status(500).send('Erro interno do servidor ao cadastrar usuário.');
            }
        }
    },

    listUsers: (req, res) => {
        const limit = parseInt(req.query.limit) || 5; //itens por página
        const page = parseInt(req.query.page) || 1;   //página atual (começa em 1)

        const offset = (page - 1) * limit;

        const loggedInUser = req.session.user;

        try {
            const users = usersDAO.findAll(limit, offset);

            const totalUsers = countUsers();

            //calcula o número total de páginas
            const totalPages = Math.ceil(totalUsers / limit);

            res.render('users/list', {
                users: users,
                currentPage: page,
                totalPages: totalPages,
                limit: limit,
                totalUsers: totalUsers,
                loggedInUser: loggedInUser
            });

        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).send('Erro interno ao listar usuários.');
        }
    },

    viewUser: (req, res) => {
        const userId = req.params.id;
        const loggedInUser = req.session.user;

        try {
            const user = usersDAO.findById(userId);

            //validacao basica
            if (!user) {
                return res.status(404).send('Usuário não encontrado.');
            }

            //valida visibilidade
            const isAuthorized = (loggedInUser && loggedInUser.role === 'ADMIN') || (loggedInUser && loggedInUser.id === userId);

            if (!isAuthorized) {
                return res.status(403).send('Acesso negado. Você não tem permissão para visualizar os detalhes deste usuário.');
            }

            const telefones = usersDAO.findTelefonesByUserId(userId);
            const emails = usersDAO.findEmailsByUserId(userId);

            res.render('users/viewUser', {
                user: user,
                telefones: telefones,
                emails: emails,
                loggedInUser: loggedInUser
            });

        } catch (error) {
            console.error(`Erro ao buscar detalhes do usuário`, error);
            res.status(500).send('Erro interno ao buscar detalhes do usuário.');
        }
    },

    deleteUser: (req, res) => {
        const targetUserId = req.params.id;
        const loggedInUser = req.session.user;

        try {

            //Admin ou cliente logado
            const isAuthorized = (loggedInUser.role === 'ADMIN') || (loggedInUser.id === targetUserId);

            if (!isAuthorized) {
                return res.status(403).send('Acesso negado. Você não tem permissão para excluir este usuário.');
            }

            //Admin nao deleta admin
            if (loggedInUser.role === 'ADMIN' && loggedInUser.id !== targetUserId) {
                const targetUser = usersDAO.findById(targetUserId);

                if (targetUser && targetUser.role === 'ADMIN') {
                    return res.status(403).send('ADMINs não podem excluir outros ADMINs.');
                }
            }

            usersDAO.deleteUser(targetUserId);

            //redirect
            if (loggedInUser.id === targetUserId) {
                return res.redirect('/logoff');
            } else {
                return res.redirect('/users');
            }

        } catch (error) {
            console.error(`Erro durante a execução da exclusão do usuário`, error);
            res.status(500).send('Erro interno do servidor ao tentar excluir usuário.');
        }
    },



    updateUser: async (req, res) => {
        const userId = req.params.id;
        const loggedInUser = req.session.user;
        const { nome, email, principalTelefone, principalEmail, novoTelefone, novoEmail } = req.body; 
        //const targetUser =usersDAO.findById(userId);

        //valida
        const isAuthorized = (loggedInUser && loggedInUser.role === 'ADMIN') || ((loggedInUser && loggedInUser.id === userId));

        if (!isAuthorized) {
            return res.status(403).send('Acesso negado. Você não tem permissão para editar este usuário.');
        }

        try {
            usersDAO.updateUserName(userId, nome);

            //telefone principal
            usersDAO.clearPrincipalTelefones(userId);
            if (principalTelefone) {
                usersDAO.setPrincipalTelefone(principalTelefone);
            }

            // email principal
            usersDAO.clearPrincipalEmails(userId); 
            if (principalEmail) {
                usersDAO.setPrincipalEmail(principalEmail); // no DAO

                //atualiza BD
                const newPrincipalEmail = usersDAO.findEmailById(principalEmail); //  no DAO
                if (newPrincipalEmail) {
                    usersDAO.updateUserEmail(userId, newPrincipalEmail.email); //  no DAO
                }
            } else {
                res.status(400).send('Nenhum email principal selecionado.');
            }


            //novo telefone
            if (novoTelefone && novoTelefone.trim() !== '') {
                usersDAO.insertTelefone(userId, novoTelefone, 0);
            }

            // novo email
            if (novoEmail && novoEmail.trim() !== '') {
                usersDAO.insertEmail(userId, novoEmail, 0);
            }

            res.redirect(`/user/${userId}`);

        } catch (error) {
            console.error(`Erro ao atualizar usuário`, error);
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                res.status(400).send('Erro na atualização: CPF ou Email já existem.');
            } else {    
                res.status(500).send('Erro interno do servidor ao atualizar usuário.');
            }
        }
    },


    deleteTelefone: (req, res) => {
        const telefoneId = req.params.id;
        const loggedInUser = req.session.user;

        const telefoneDelete = usersDAO.findTelefoneById(telefoneId);
        if (!telefoneDelete) {
            return res.status(404).send('Telefone não encontrado.');
        }

        const isAuthorized = (loggedInUser && loggedInUser.role === 'ADMIN') || (loggedInUser && loggedInUser.id === telefoneDelete.usuario_id);

        if (!isAuthorized) {
            return res.status(403).send('Acesso negado. Você não tem permissão para excluir este telefone.');
        }

        try {
            const changes = usersDAO.deleteTelefoneIfNotPrincipal(telefoneId);
            if (changes > 0) {
                console.log(`Telefone excluído com sucesso.`);
            } else {
                console.warn(`Telefone não excluído (talvez seja o principal ou não encontrado).`);
                res.status(400).send('Não é possível excluir o telefone principal.');
            }

            res.redirect(`/user/${telefoneDelete.usuario_id}`);

        } catch (error) {
            console.error(`Erro ao excluir telefone`, error);
            res.status(500).send('Erro interno do servidor ao excluir telefone.');
        }
    },

    deleteEmail: (req, res) => {
        const emailId = req.params.id;
        const loggedInUser = req.session.user;

        const emailDeletado = usersDAO.findEmailById(emailId);
        if (!emailDeletado) {
            return res.status(404).send('Email não encontrado.');
        }

        const isAuthorized = (loggedInUser && loggedInUser.role === 'ADMIN') || (loggedInUser && loggedInUser.id === emailDeletado.usuario_id);

        if (!isAuthorized) {
            return res.status(403).send('Acesso negado. Você não tem permissão para excluir este email.');
        }

        try {
            const changes = usersDAO.deleteEmailIfNotPrincipal(emailId);

            if (changes > 0) {
                console.log(`Email excluído com sucesso.`);
            } else {
                console.warn(`Email não excluído (talvez seja o principal ou não encontrado).`);
                res.status(400).send('Não é possível excluir o email principal.');
            }

            res.redirect(`/user/${emailDeletado.usuario_id}`);

        } catch (error) {
            console.error(`Erro ao excluir email`, error);
            res.status(500).send('Erro interno do servidor ao excluir email.');
        }
    },


};

module.exports = usersController;