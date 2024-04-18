import fs from "fs";
import express from "express";
import SessionDatabase from "../../database/db/session.db.js";
import { AutoReply } from "../../database/db/messageRespon.db.js";
import HistoryMessage from "../../database/db/history.db.js";
import moment from "moment";
const router = express.Router();

const { SESSION_PATH, LOG_PATH } = process.env;

const db = new SessionDatabase();
function checkAuth(req, res, next) {
	return new Promise((res, rej) => {
		if(req.session.loggedin === true){
			// next();
			res([]);
		} else {
			req.session.destroy(function(err) {
				rej([]);
			})
		}
	});
}
router.use(function(req, res, next) {
	checkAuth(req, res, next).then(() => {
		next();
	}).catch((error) => {
		return res.redirect('/');
	});
});
router.get("/", async (req, res) => {
	let sessionCheck = fs.readdirSync(SESSION_PATH).filter((x) => x != "store")[0];
	let session_name = sessionCheck ? sessionCheck : null;
	let loggerPath = fs.existsSync(`${LOG_PATH}/${session_name}.txt`) ? `${LOG_PATH.replace("./public/", "")}/${session_name}.txt` : null;
	const session = session_name ? await db.findOneSessionDB(session_name) : null;
	const allSession = await db.findAllSessionDB();
	res.render("dashboard/dashboard", {
		loggerPath,
		session,
		session_name,
		allSession: allSession,
		layout: "layouts/main",
		moment: moment
	});
});

router.get("/send-message", async (req, res) => {
	const session = await db.findAllSessionDB();
	res.render("dashboard/sendMessage", {
		session,
		layout: "layouts/main",
	});
});

router.get("/auto-reply", async (req, res) => {
	const session = await db.findAllSessionDB();
	const replyList = await new AutoReply().checkReplyMessage();
	res.render("dashboard/autoReply", {
		session,
		replyList,
		layout: "layouts/main",
	});
});

router.get("/api-doc", async (req, res) => {
	res.render("dashboard/apidoc", {
		layout: "layouts/main",
	});
});

router.get("/history-message", async (req, res) => {
	let db = await new HistoryMessage().getAllMessage();
	res.render("dashboard/history", {
		layout: "layouts/main",
		db,
	});
});

export default router;
