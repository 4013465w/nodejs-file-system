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
			    console.log(colors.silly('useradd'));
			    count =0;
			    break;
			    case 'ls':
			    	out.list(file.showList(),file.file);
			    break;
			    case 'touch':
			    	file.createFile(args[0],'file',user.curUser)
			    	count =0;
			    break;
			    case 'mkdir':
			    	file.createFile(args[0],'folder',user.curUser)
			    	count =0;
			    break;
			    case 'rm':
			    	file.rmFile(args[0])
			    	count =0;
			    break;
			    case 'cd':
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
			    let output = file.catFile(args[0]);
			    	output!==false?out.data(output):out.error('没有这个文件');
			    	count =0;
			    break;
			    case 'w':
			    	out.error(file.wFile(args));
			    	count =0;
			    break;
			    default:
			      console.log('Say what?');
			      break;
			  }
			  !count&&(args.length=0);
	    }
	  rl.prompt();
	}).on('close', () => {
	  console.log('Have a great day!');
	  process.exit(0);
	});	
}
order();


