import "dotenv/config";
import moment from "moment-timezone";
import { Server } from "socket.io";
import { modules } from "../../lib/index.js";
import SessionDatabase from "../database/db/session.db.js";
import ConnectionSession from "../session/Session.js";
import Session from "../database/models/session.model.js";
import App from "./App.js";
import https from 'https';
import fs from "fs";
const { AUTO_START, HOST, PORT, ENV } = process.env;
const server = new App();
moment.tz.setDefault("Asia/Jakarta").locale("id");
let activeServer;
if(ENV == "LOCAL") {
	activeServer = server.app.listen(PORT, async () => {
		if (AUTO_START == "y") {
			const array = await Session.findAll();
			if (Array.isArray(array) && array.length !== 0) {
				array.map(async (value) => {
					console.log(value.session_name)
					await new ConnectionSession().createSession(value.session_name)
				});
			}
		} else {
			await new SessionDatabase().startProgram();
		}
		console.log(modules.color("[APP]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`App Listening at ${HOST}`, "#82E0AA"));
	});
} else {
	const options = {
		key: fs.readFileSync("certs/viralmu.id.key"),
		cert: fs.readFileSync("certs/viralmu.id.crt"),
	};
	const serverSSL = https.createServer(options, server.app);
	activeServer = serverSSL.listen(443, async () => {
		if (AUTO_START == "y") {
			const array = await Session.findAll();
			if (Array.isArray(array) && array.length !== 0) {
				array.map(async (value) => {
					console.log(value.session_name)
					await new ConnectionSession().createSession(value.session_name)
				});
			}
		} else {
			await new SessionDatabase().startProgram();
		}
		
		console.log(modules.color("[APP]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`App Listening at 443`, "#82E0AA"));
	})
}
// const serverHttp = server.app.listen(PORT, async () => {
// 	if (AUTO_START == "y") {
// 		const array = await Session.findAll();
// 		if (Array.isArray(array) && array.length !== 0) {
// 			array.map(async (value) => {
// 				console.log(value.session_name)
// 				await new ConnectionSession().createSession(value.session_name)
// 			});
// 		}
// 	} else {
// 		await new SessionDatabase().startProgram();
// 	}
// 	console.log(modules.color("[APP]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`App Listening at ${HOST}`, "#82E0AA"));
// });

// const options = {
// 	key: fs.readFileSync("certs/viralmu.id.key"),
// 	cert: fs.readFileSync("certs/viralmu.id.crt"),
//   };
// const serverSSL = https.createServer(options, server.app);
  
// serverSSL.listen(443, async () => {
// 	if (AUTO_START == "y") {
// 		const array = await Session.findAll();
// 		if (Array.isArray(array) && array.length !== 0) {
// 			array.map(async (value) => {
// 				console.log(value.session_name)
// 				await new ConnectionSession().createSession(value.session_name)
// 			});
// 		}
// 	} else {
// 		await new SessionDatabase().startProgram();
// 	}
// 	console.log(modules.color("[APP]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`App Listening at 443`, "#82E0AA"));
// })
const io = new Server(activeServer);
const socket = io.on("connection", (socket) => {
	socket.on("disconnect", () => {
		console.log("Socket Disconnect");
	});
	socket.on("connected", () => {
		console.log("Socket Connected");
	});
	socket.on("error", err => {
		reject(err);
		return;
	});
	return socket;
});

export { socket, io, moment };
