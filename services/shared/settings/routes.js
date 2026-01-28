import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    id: req.params.config,
    name: "conf geral",
  });
});

router.get("/config", (req, res) => {
  res.json({
    id: req.params.config,
    name: "configuração de exemplo",
  });
});

export default router;
