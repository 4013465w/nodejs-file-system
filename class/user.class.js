module.exports = class User {
  constructor() {
    this.users = {
    	root:{
        	pwd:'root'
        }
    };
  }
  login(userid,pwd) {
  	if (this.users.hasOwnProperty(userid)&&this.users[userid].pwd === pwd) {
  		this.curUser = userid;
  		return 1;
  	}
  	return 0;
  }
  /**
   * 新建用户
   */
  createUser(userid,pwd){
  	if (this.users.hasOwnProperty(userid)) {
  		return "用户名被占用";
  	}else if (!userid||!pwd) {
  		return '无效用户名或密码';
  	}else{
  		this.users[userid] = {pwd:pwd};
  		return false;
  	}
  }
};