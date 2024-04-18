import fs from "fs";

class ControllerLogin {
	// constructor() {
	// 	super();
	// }

	async loginStore(req, res) {
		let username = req.body.username;
        let password = req.body.password;
		if(username == 'krisna' && password == 'krisna337') {
			req.session.loggedin = true;
			req.session.userid = 337;
			req.session.username = 'Krisna Ganteng';
			return res.redirect('/dashboard');
		} else {
			req.flash("error_msg", `Username or Password Wrong`);
			return res.redirect('/login')
		}
		// res.redirect('/');
	}
}

export default ControllerLogin;
