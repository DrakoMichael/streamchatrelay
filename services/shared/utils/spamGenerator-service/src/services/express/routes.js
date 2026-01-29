import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    id: req.params.config,
    name: "cspammer",
  });
});

export default router;
