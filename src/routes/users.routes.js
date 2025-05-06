const { Router } = require('express');
const usersRouter = Router();
const authController = require('../controllers/auth.controller');
const usersController = require('../controllers/users.controller');
const isAuth = require('../middlewares/isAuth');


//ROTA DE LOGIN
usersRouter.get('/login', authController.showLoginPage);
usersRouter.post('/auth',  authController.login);
usersRouter.get('/logoff',  authController.logoff);

// Formulário de adicionar novo usuário
usersRouter.get('/addUser', usersController.showAddUserForm);
usersRouter.post('/addUser', usersController.create);

// Listar todos os usuários
usersRouter.get('/users', isAuth, usersController.listUsers);

//Visualizar detalhes do usuário
usersRouter.get('/user/:id', isAuth, usersController.viewUser);

//Atualizar dados do usuário
usersRouter.post('/user/updateUser/:id',isAuth, usersController.updateUser);

// Excluir usuário
usersRouter.post('/deleteUser/:id', isAuth, usersController.deleteUser);
// Excluir email/telefone
usersRouter.post('/deleteTelefone/:id', isAuth, usersController.deleteTelefone); 
usersRouter.post('/deleteEmail/:id', isAuth, usersController.deleteEmail);

module.exports = usersRouter;
