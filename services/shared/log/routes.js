import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    id: req.params.logService,
    name: "logDeExemplo",
  });
});

export default router; 
