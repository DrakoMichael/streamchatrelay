import Database from "better-sqlite3";
import loadSettings from "../settings/loadSettings.js";

const config = await loadSettings();

/**
 * @module src.services.dataBase.sqlite3_bootstrap
 */

export default async function sqlite3_bootstrap() {

    const db = new Database(`../dataBase/dataBases/${config.database.indisk_db_name}.db`);
    db.prepare(`
        CREATE TABLE IF NOT EXISTS lorem (
            info TEXT
        )
    `).run();

    const insert = db.prepare("INSERT INTO lorem (info) VALUES (?)");

    for (let i = 0; i < 10; i++) {
        insert.run("Ipsum " + i);
    }

    const rows = db.prepare(
        "SELECT rowid AS id, info FROM lorem"
    ).all();

    for (const row of rows) {
        console.log(`${row.id}: ${row.info}`);
    }

    db.close();
}
