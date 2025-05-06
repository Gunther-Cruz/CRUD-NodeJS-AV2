class User {
    constructor(id, name, cpf, email, password, role) {
        if (name  && name.trim().length > 0) {
            this.id = id;
            this.name = name;
            this.cpf = cpf;
            this.email = email;
            this.password =  password;
            this.role = role;
        } else {
            throw Error("informações precisam ser passadas!")
        }
    }
}

module.exports = User;