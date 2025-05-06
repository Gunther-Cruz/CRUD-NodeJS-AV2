const db = require("../database/dbConnection");

const usersDAO = {
    findAll(limit, offset, filter) { 
        const validLimit = parseInt(limit) || 5; 
        const validOffset = parseInt(offset) || 0;

        const userQuery = `SELECT id, nome, cpf, email, role FROM users LIMIT ? OFFSET ?`;

        return db.prepare(userQuery).all(validLimit, validOffset);
    },
    findById(id) {
        const userQuery = `SELECT id, nome, cpf, email, role FROM users WHERE id = ?`;
        return db.prepare(userQuery).get(id);
    },
    findByCpf(cpf) {
        const userQuery = "SELECT * FROM users u WHERE u.cpf = ? LIMIT 1;"
        return db.prepare(userQuery).get(cpf);
    },
    insert(user) {
        const insertUserQuery = "INSERT INTO users (id, nome, cpf, email, password, role) VALUES (?, ?, ?, ?, ?, ?);"
        db.prepare(insertUserQuery).run(user.id, user.name, user.cpf, user.email, user.password, user.role);
    },
    deleteUser(id) {
        const deleteQuery = `DELETE FROM users WHERE id = ?`;
        return db.prepare(deleteQuery).run(id);
    },
    
    insertTelefone(userId, telefone, principal = 0) {
        const insertTelefone = "INSERT INTO telefones (usuario_id, telefone, principal) VALUES (?, ?, ?)";
        db.prepare(insertTelefone).run(userId, telefone, principal ? 1 : 0);
    },
    insertEmail(userId, email, principal = 0) {
        const insertEmail = "INSERT INTO emails (usuario_id, email, principal) VALUES (?, ?, ?)";
        db.prepare(insertEmail).run(userId, email, principal ? 1 : 0);
    },


    findTelefonesByUserId(userId) {
        const telefoneQuery = `SELECT id, telefone, principal FROM telefones WHERE usuario_id = ? ORDER BY principal DESC, id ASC`;
        return db.prepare(telefoneQuery).all(userId);
    },
    findEmailsByUserId(userId) {
        const emailQuery = `SELECT id, email, principal FROM emails WHERE usuario_id = ? ORDER BY principal DESC, id ASC`;
        return db.prepare(emailQuery).all(userId);
    },


    //excluir um email não principal
    deleteEmailIfNotPrincipal(emailId) {
        const deleteQuery = `DELETE FROM emails WHERE id = ? AND principal = 0`;
        const result = db.prepare(deleteQuery).run(emailId);
        return result.changes;
    },

    //excluir um telefone não principal
    deleteTelefoneIfNotPrincipal(telefoneId) {
        const deleteQuery = `DELETE FROM telefones WHERE id = ? AND principal = 0`;
        const result = db.prepare(deleteQuery).run(telefoneId);
        return result.changes; 
    },

    //atualiza nome do usuário
    updateUserName(userId, nome) {
        const updateQuery = `UPDATE users SET nome = ? WHERE id = ?`;
        db.prepare(updateQuery).run(nome, userId);
    },

    //atualiza o email principal
    updateUserEmail(userId, email) {
        const updateQuery = `UPDATE users SET email = ? WHERE id = ?`;
        db.prepare(updateQuery).run(email, userId);
    },


     //encontra telefone pelo ID dele
    findTelefoneById(telefoneId) {
        const query = `SELECT id, usuario_id, telefone, principal FROM telefones WHERE id = ?`;
        return db.prepare(query).get(telefoneId);
    },

     //encontra email pelo ID deler
    findEmailById(emailId) {
        const query = `SELECT id, usuario_id, email, principal FROM emails WHERE id = ?`;
        return db.prepare(query).get(emailId);
    },

    //define um telefone como principal
    setPrincipalTelefone(telefoneId) {
        const updateQuery = `UPDATE telefones SET principal = 1 WHERE id = ?`;
         db.prepare(updateQuery).run(telefoneId);
    },

     //define um email como principal
    setPrincipalEmail(emailId) {
        const updateQuery = `UPDATE emails SET principal = 1 WHERE id = ?`;
         db.prepare(updateQuery).run(emailId);
    },

    //limpa principais
    clearPrincipalTelefones(userId) {
        const updateQuery = `UPDATE telefones SET principal = 0 WHERE usuario_id = ?`;
        db.prepare(updateQuery).run(userId);
    },
     clearPrincipalEmails(userId) {
        const updateQuery = `UPDATE emails SET principal = 0 WHERE usuario_id = ?`;
        db.prepare(updateQuery).run(userId);
    },
    
}

const countUsers = () => {
    const countQuery = 'SELECT COUNT(*) AS count FROM users';
    const row = db.prepare(countQuery).get();

    return row.count; 
};

module.exports ={usersDAO, countUsers};