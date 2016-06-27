module.exports = class User {
	constructor() {
		this.users = {
			root: {
				pwd: 'root'
			}
		};
		this.curUser = null;
	}
	/**
		 * 登陆
		 * userid：用户名
		 * pwd；密码
		 */
	login(userid, pwd) {
			if (this.users.hasOwnProperty(userid) && this.users[userid].pwd === pwd) {
				this.curUser = userid;
				return 1;
			}
			return 0;
		}
		/**
		 * 新建用户
		 * userid：用户名
		 * pwd；密码
		 */
	createUser(userid, pwd) {
		if (this.curUser!=='root') {
			return '没有权限';
		}
		if (this.users.hasOwnProperty(userid)) {
			return "用户名被占用";
		} else if (!userid || !pwd) {
			return '无效用户名或密码';
		} else {
			this.users[userid] = {
				pwd: pwd
			};
		// console.log(this.users);

			return false;
		}
	}
};