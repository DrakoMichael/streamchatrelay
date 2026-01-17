import sqlite3_bootstrap from "./sqlite3_bootstrap.js"; 
import sqlite3_bootstrap_memory from "./sqlite3_bootstrap_memory.js";

/**
 * @deprecated
 * @description Central database hub to initialize all database connections and setups.
 */

export default async function databaseHUB() {
    await sqlite3_bootstrap();
    await sqlite3_bootstrap_memory();
}