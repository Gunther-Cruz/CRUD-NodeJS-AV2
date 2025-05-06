const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    // Redireciona o cliente para a rota '/login'
    res.redirect('/login');
});

app.use(session({
    secret: 'seusegredoaqui', // troque por uma string forte em produção
    resave: false,
    saveUninitialized: false,
    //cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 dia
}));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// PERMITE ACESSO ESTATICO (DIRETO) AOS ARQUIVOS QUE ESTAO NA PASTA PUBLIC
app.use(express.static(path.join(__dirname, '..', 'public')));    // ../public

const usersRouter = require('./routes/users.routes');
app.use('/', usersRouter);

// RENDERIZAÇÃO POR TEMPLATE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});