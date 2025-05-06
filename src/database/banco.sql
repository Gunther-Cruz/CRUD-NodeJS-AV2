-- Criação da tabela de usuários
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cpf TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'CLIENTE'))
);

-- Criação da tabela de telefones
CREATE TABLE telefones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id TEXT NOT NULL,
    telefone TEXT NOT NULL,
    principal BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE

);

-- Criação da tabela de emails
CREATE TABLE emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id TEXT NOT NULL,
    email TEXT NOT NULL,
    principal BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_unique_principal_telefone ON telefones (usuario_id, principal) WHERE principal = 1;

CREATE UNIQUE INDEX idx_unique_principal_email ON emails (usuario_id, principal) WHERE principal = 1;
