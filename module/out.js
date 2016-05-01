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

exports.list = function(arr,inode) {
	arr.forEach((file,index)=>{
	let ind =inode[file.id];
	let str = index+'  '+file.name+'  size:'+ind.size+'  time:'+ind.time+' author:'+ind.author;
		ind.type === 'folder'&& (str = colors.help(str));
		console.log(str);
	})
}

exports.error = function (str) {

	str&&console.log(colors.error(str));
}
exports.data = function (str) {
	str&&console.log(colors.data(str));
}