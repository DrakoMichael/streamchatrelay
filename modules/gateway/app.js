import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";

const app = express();

/* =========
   Middleware de auth (antes do proxy)
   ========= */
function auth(req, res, next) {
    const token = req.headers.authorization;
    //console.log("Token recebido:", token);

//   if (!token) {
//     return res.status(401).json({ error: "Sem token" });
//   }

  // valida JWT aqui
  // jwt.verify(token, SECRET)

  next();
}

const websocketService = createProxyMiddleware({
  target: "http://localhost:3232", // serviço interno
  changeOrigin: true,
  pathRewrite: {
    "^/": ""
  }
});

const config= createProxyMiddleware({
  target: "http://localhost:3232/config", // serviço interno
  changeOrigin: true,
  pathRewrite: {
    "^/config": ""
  }
});

app.use("/", auth, websocketService);
app.use("/config", auth, config);


/* =========
   Proxy WebSocket -> chat-service
   ========= */
// const chatProxy = createProxyMiddleware({
//   target: "http://localhost:4001", // serviço interno
//   changeOrigin: true,
//   ws: true, // <<< mágica do websocket
//   pathRewrite: {
//     "^/ws/chat": ""
//   }
// });

// app.use("/ws/chat", auth, chatProxy);

// /* =========
//    HTTP normal também pode passar aqui
//    ========= */
// app.use("/api/chat", auth, chatProxy);

const server = http.createServer(app);

/* =========
   Habilita upgrade WS
   ========= */
//server.on("upgrade", chatProxy.upgrade);

server.listen(3000, () => {
  console.log("Gateway rodando na 3000");
});

export default app;
