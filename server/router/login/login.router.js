import express from "express";
const router = express.Router();

import ControllerLogin from "./login.controller.js";

const controller = new ControllerLogin();

router.get("/", async (req, res) => {
	res.render("login/login",{
        layout: "layouts/main",
    });
});
router.post("/login", controller.loginStore.bind(controller));
export default router;
