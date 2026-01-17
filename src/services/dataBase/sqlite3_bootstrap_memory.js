import Database from "better-sqlite3";

export default async function sqlite3_bootstrap_memory() {
    console.log("SQLite database service initialized.");

    const db = new Database(":memory:");

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

    return db;
}
 