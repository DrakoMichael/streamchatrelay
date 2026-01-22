import liveChatSpam, { stopLiveChatSpam } from "../services/spamGenerator/liveChatSpam.js";
import express_bootstrap from "../services/webManager/express_bootstrap.js";
import TwitchConnectionWS from "../services/externalConnections/twitch/connectionWS.js";

/** TO-DO
 * Testa o módulo liveChatSpam
 */
async function testLiveChatSpam() {
  try {
    const result = liveChatSpam("test");
    
    if (!result || !Array.isArray(result.messages)) {
      throw new Error("Expected test result with messages array");
    }

    // Simula alguns ciclos
    await new Promise(resolve => setTimeout(resolve, 100));
    
    result.stop();
    console.log(`✓ liveChatSpam: OK (${result.messages.length} mensagens geradas)`);
    return true;
  } catch (error) {
    console.error("✗ liveChatSpam: FAIL", error.message);
    return false;
  }
}

/**
 * Testa o módulo express_bootstrap
 */
async function testExpressBootstrap() {
  try {
    const result = express_bootstrap("test");

    console.log("✓ express_bootstrap: OK");
    return true;
  } catch (error) {
    console.error("✗ express_bootstrap: FAIL", error.message);
    return false;
  }
}

/**
 * Executa todos os testes
 */
async function index_test() {
  console.log("=== Iniciando testes ===\n");

  const results = [];
  results.push(await testLiveChatSpam());
  results.push(await testExpressBootstrap());

  console.log("\n=== Resultado dos testes ===");
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`${passed}/${total} testes passaram`);

  // Garante que o processo saia
  process.exit(results.every(r => r) ? 0 : 1);
}

// Executa os testes
await index_test();