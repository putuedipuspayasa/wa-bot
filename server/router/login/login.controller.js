import fs from "fs";

class ControllerLogin {
	// constructor() {
	// 	super();
	// }

	async loginStore(req, res) {
		let username = req.body.username;
        let password = req.body.password;
		if(username == 'admin' && password == 'admin') {
			req.session.loggedin = true;
			req.session.userid = 337;
			req.session.username = 'admin';
			return res.redirect('/dashboard');
		} else {
			req.flash("error_msg", `Username or Password Wrong`);
			return res.redirect('/login')
		}
		// res.redirect('/');
	}
}

export default ControllerLogin;
