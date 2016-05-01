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
   *返回值
   *0:用户名占用
   *1:成功
   *-1:没有权限
   */
  createUser(userid,username,pwd){

  }
};