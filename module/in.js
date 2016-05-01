const colors = require('colors');
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
exports.inputs = function (args,r1) {
	var arr = [];
	function input(num) {
		r1.resume();
		r1.question(colors.input('请输入用户ID: '),(ans)=>{
			console.log(ans)
			arr.push[ans];
			num++;
			if (num<args.length) {
				r1.resume();
				input(num);
			}else{
				r1.close();
			}
		});
	}
	input(0);
};