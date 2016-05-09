const colors = require('colors');
const readline = require('readline');

const User = require('./class/user.class.js');
const File = require('./class/file.class.js');

const out = require('./module/out.js') 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var user = new User();
var file = new File();
colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});


function login(args,count) {
	if (count>1) {
		if (!user.login(args[0],args.pop())) {
			console.log(colors.error('！密码错误,请重新输入： '));
		}else{
			rl.setPrompt(args[0]+'/> ');
			count=-1;
		}
	}else{
		console.log(colors.input('请输入密码： '));
	}
	return ++count;
}
// login();

function order() {
	var model = 'login';
	var args = [];
	var count = 1;
	var path = ['root'];
	rl.setPrompt(path.join('/')+'> ');
	console.log(colors.input('请输用户名： '));
	rl.on('line', (line) => {
		if (line.trim()) {
			args.push(line.trim());
			!count&&(args = line.trim().split(' '),model = args.shift());
			  switch(model) {
			    case 'login':
			      count = login(args,count);
			      break;
			    case 'useradd':
			    	out.error(user.createUser(args[0],args[1]));
			    count =0;
			    break;
			    case 'ls':
			    	out.list(file.showList(),file.file);
			    break;
			    case 'touch':
			    var o = file.checkPermission(false,user.curUser,2)
			    	if (o!=true) {
			    		out.error(o);
			    		break;
			    	}
			    	file.createFile(args[0],'file',user.curUser)
			    	count =0;
			    break;
			    case 'mkdir':
			    var o = file.checkPermission(false,user.curUser,2)
			    	if (o!=true) {
			    		out.error(o);
			    		break;
			    	}
			    	file.createFile(args[0],'folder',user.curUser)
			    	count =0;
			    break;
			    case 'rm':
			    var o = file.checkPermission(args[0],user.curUser,2)
			    	if (o!=true) {
			    		out.error(o);
			    		break;
			    	}
			    	file.rmFile(args[0])
			    	count =0;
			    break;
			    case 'cd':
			    var o = file.checkPermission(args[0],user.curUser,4)
			    	if (o!=true) {
			    		out.error(o);
			    		break;
			    	}
			    	let output1 = file.cdFolder(args[0]);
			    	if (output1 == 1) {
			    		path.push(args[0]);
			    	}else if (output1 == -1) {
			    		path.pop();
			    	}else{
			    		out.error(output1);
			    	}
			    	rl.setPrompt(path.join('/')+'> ');
			    	count =0;
			    break;
			    case 'cat':
			    var o = file.checkPermission(args[0],user.curUser,4)
			    	if (o!=true) {
			    		out.error(o);
			    		break;
			    	}
			    let output = file.catFile(args[0]);
			    	output!==false?out.data(output):out.error('没有这个文件');
			    	count =0;
			    break;
			    case 'w':
			    var o = file.checkPermission(args[0],user.curUser,2)
			    	if (o!=true) {
			    		out.error(o);
			    		break;
			    	}
			    	out.error(file.wFile(args));
			    	count =0;
			    break;
			    case 'su':
			    	var o = user.login(args[0],args[1]);
			    	o?console.log(colors.info(user.curUser)):out.error("用户名或密码错误")
			    	
			    	count =0;
			    break;
			    case 'chmod':
			    var o = file.checkPermission(args[0],user.curUser,0)
			    	if (o!=true) {
			    		out.error(o);
			    		break;
			    	}
			    	var outs = file.chmod(args[0],args[1],user.curUser);
			    	outs!==false?out.error(outs):1;
			    	count =0;
			    break;
			    default:
			      console.log(colors.info('帮助文档'));
			      console.log(colors.info('ls ;show file list'));
			      console.log(colors.info('touch fileName'));
			      console.log(colors.info('mkdir folderName'));
			      console.log(colors.info('rm folderOrfileName'));
			      console.log(colors.info('cd folderName'));
			      console.log(colors.info('cat fileName'));
			      console.log(colors.info('w fileName'));
			      console.log(colors.info('useradd Name Password'));
			      console.log(colors.info('su Name Password;切换用户'));
			      console.log(colors.info('chmod fileName Permissions;修改文件权限'));
			      break;
			  }
			  !count&&(args.length=0);
	    }
	  rl.prompt();
	}).on('close', () => {
	  console.log(colors.rainbow('Have a great day!'))
	  process.exit(0);
	});	
}
order();


