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

exports.list = function(arr,inode) {//列表循环输出
	arr.forEach((file,index)=>{
	let ind =inode[file.id];
	let str = index+'  '+file.name+'  size:'+ind.size+'  time:'+ind.time+' author:'+ind.author+' P:'+ind.Permissions;
		ind.type === 'folder'&& (str = colors.help(str));
		console.log(str);
	})
}

exports.error = function (str) {//错误时的输出

	str&&console.log(colors.error(str));
}
exports.data = function (str) {//输出数据时的输出
	str&&console.log(colors.data(str));
}