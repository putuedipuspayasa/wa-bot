import express from "express";
import expressLayout from "express-ejs-layouts";
import flash from "connect-flash";
import session from "express-session";
import redis from 'redis';
import connectRedis from 'connect-redis';
import fileUpload from "express-fileupload";
import "dotenv/config";
import { connectDatabase } from "./Database.js";
import routerUser from "../router/session/session.router.js";
import routerDashboard from "../router/dashboard/dashboard.router.js";
import routerLogin from "../router/login/login.router.js";
import routerApi from "../router/api/api.router.js";
import routerAutoReply from "../router/dashboard/AutoReply/autoReply.router.js";
import { modules } from "../../lib/index.js";
import moment from "moment-timezone";
const { AUTO_START, HOST, PORT, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, ENV } = process.env;

class App {
	constructor() {
		
		this.app = express();
		this.plugins();
		this.route();
		this.PORT = process.env.PORT || 8080;
	}

	async plugins() {
		this.app.set("trust proxy", 1);
		this.app.set("view engine", "ejs");
		this.app.use(expressLayout);
		this.app.use(express.static("public/mazer"));
		this.app.use(express.static("public"));
		this.app.use(express.urlencoded({ extended: true }));
		this.app.use(express.json());
		// this.app.use(session({ secret: "secret", resave: false, saveUninitialized: true, cookie: { maxAge: 60000 } }));
		// config session
		const RedisStore = connectRedis(session)
		const redisClient = redis.createClient({
			socket: {
				host: REDIS_HOST,
				port: REDIS_PORT,
			},
			legacyMode: true,
			...(ENV == 'PROD' ? {password: REDIS_PASSWORD} : '')
		})
		redisClient.on('error', function (err) {
			console.log(modules.color("[APP]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`Could not establish a connection with redis. ${err}`, "#82E0AA"));
		});
		redisClient.on('connect', function (err) {
			console.log(modules.color("[APP]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`Connected to redis successfully`, "#82E0AA"));
		});
		redisClient.connect();

		this.app.use(session({
			store: new RedisStore({ client: redisClient, prefix: `WaBOT` }),
			secret: 'secret$%^134',
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: false, // if true only transmit cookie over https
				httpOnly: false, // if true prevent client side JS from reading the cookie 
				maxAge: 1000 * 60 * 10 // session max age in miliseconds
			}
		}))
		this.app.use(flash());
		this.app.use(function (req, res, next) {
			res.locals.success_msg = req.flash("success_msg");
			res.locals.error_msg = req.flash("error_msg");
			res.locals.side = req.flash("side");
			res.locals.url = req.originalUrl;
			next();
		});
		this.app.use(
			fileUpload({
				fileSize: 10 * 1024 * 1024,
			})
		);
		connectDatabase();

	}

	route() {
		this.app.get("/", (req, res) => {
			res.redirect("/login");
		});

		this.app.use("/login", routerLogin);
		this.app.use("/dashboard", routerDashboard);
		this.app.use("/session", routerUser);
		this.app.use("/api", routerApi);
		this.app.use("/reply", routerAutoReply);
	}
}

export default App;
