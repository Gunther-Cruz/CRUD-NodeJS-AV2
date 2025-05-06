const db = require('better-sqlite3')('dados.db', {
   // CONFIGS
   verbose: console.log        // FUNCAO UTILIZADA PARA MOSTRAR AS QUERIES EXECUTADAS
});
const fs = require('node:fs');
const path = require('node:path');

const dbFilePath = path.join(__dirname, 'banco.sql');

try {
   const sql = fs.readFileSync(dbFilePath, 'utf8');
   db.exec(sql);
   console.log(`Arquivo SQL "${path.basename(dbFilePath)}" executado com sucesso.`);

} catch (error) {
   console.error(`Erro ao executar arquivo SQL "${path.basename(dbFilePath)}":`, error);
}

module.exports = db; 