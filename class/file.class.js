Date.prototype.Format = function(fmt) { //author: meizz   
	var o = {
		"M+": this.getMonth() + 1, //月份   
		"d+": this.getDate(), //日   
		"h+": this.getHours(), //小时   
		"m+": this.getMinutes(), //分   
		"s+": this.getSeconds(), //秒   
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
		"S": this.getMilliseconds() //毫秒   
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
var blockMap = [];
var fileMap = [];
class Block {
	constructor() {
		this.count = 10000;
		this.block = new Array(10000);
		this.everyBlock = 10;
	}

	findNullBlock() {
		for (var i = 0; i < this.count; i++) {
			if (!blockMap[i]) {
				blockMap[i] = true;
				return i;
			}
		}
	}

	readBlock(blk) {
		let start = blk * 10;
		var re = [];
		for (var i = 0; i < 10; i++) {
			if (this.block[start + i] !== undefined) {
				re.push(this.block[start + i]);
			}
		}
		return re;
	}

	writeBlock(blk, arr) {
		let start = blk * 10;
		for (var i = 0; i < 10; i++) {
			this.block[start + i] = arr[i];
		}
	}

	delBlock(blk) {
		for (var i = 0; i < blk.length; i++) {
			blockMap[blk[i]] = false;
		}
	}
}

module.exports = class File extends Block {
	constructor() {
		super();
		this.file = new Array(100);
		this.curfile = 0;
		this.file[0] = {
			name: '/',
			father: null,
			time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
			size: null,
			type: 'folder',
			block: [],
			Permissions: 77,
			author: 'root'
		}
		fileMap[0] = true;
	}

	showList() {
		let file = this.readFile(this.curfile);
		return file;
	}
	getInode(name, father) {
		father = father ? father : this.curfile;
		var list = this.readFile(father);
		for (var i = 0; i < list.length; i++) {
			if (list[i].name == name) {
				return list[i].id;
			}
		}
		return false;
	}
	readFile(index) {
		var back = [];
		let inode = this.file[index];
		for (var i = 0; i < inode.block.length; i++) {
			back = back.concat(this.readBlock(inode.block[i]));
		}
		return back;
	}
	catFile(name) {
		let index = this.getInode(name);
		let inode = this.file[index];
		if (inode && inode.type === 'file') {
			let back = this.readFile(index);
			return back.join('');
		}
		return false;
	}
	wFile(arr) {
		let name = arr[0];
		let content = arr[1] || '';
		let index = this.getInode(name);
		if (index) {
			this.file[index].size = Math.ceil(arr.length / 10);
			this.writeFile(content, index);
		}
	}
	checkPermission(name,userId,num){
		if (userId == 'root') {
			return true;
		}
		let index = this.getInode(name);
		if (!name) {
			index = this.curfile;
		}
		num = +num;

		if (index!==false) {
			var inode = this.file[index];
			if (inode.author == userId) {
				var Permissions = parseInt(inode.Permissions/10);
				if (Permissions&num||num==0) {
					return true;
				}
			}else{
				var Permissions = +inode.Permissions%10;
				if (Permissions&num) {
					return true;
				}
			}
			return "没有权限";
		}else{
			return '没有此文件';
		}
	}
	// 修改权限
	chmod(name,Permissions,userId){
		let index = this.getInode(name);
		if (index&&(this.file[index].author == userId||this.file[index].author == 'root')) {
			this.file[index].Permissions = Permissions;
			return false;
		}else{
			return "没有权限修改";
		}
	}
	writeFile(arr, inode) {
		this.delBlock(this.file[inode].block);
		this.file[inode].block = [];
		this.file[inode].size = 0;

		for (var i = 0; i < arr.length; i += 10) {
			let blk = this.findNullBlock();
			this.file[inode].block.push(blk);
			this.file[inode].size++;
			this.writeBlock(blk, arr.slice(i));
		}
	}
	freeInode(inode) {
		fileMap[inode] = false;
	}
	findNullInode() {
		for (var i = 0; i < 100; i++) {
			if (!fileMap[i]) {
				fileMap[i] = true;
				return i;
			}
		}
	}

	createFile(name, type, author) {
		let rf = this.readFile(this.curfile);
		let inode = this.findNullInode();
		rf.push({
			name: name,
			id: inode
		});
		this.writeFile(rf, this.curfile);
		this.file[inode] = {
			father: this.curfile,
			time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
			size: 0,
			type: type,
			block: [],
			Permissions: 75,//rwe
			author: author
		};
		// console.log('inode'+inode)
	}

	cdFolder(name) {
		if (name === '..') {
			if (this.file[this.curfile].father !== null) {
				this.curfile = this.file[this.curfile].father;
				return -1;
			}
		}
		let index = this.getInode(name);
		if (index) {
			if (this.file[index].type === 'folder') {
				this.curfile = index;
				return 1;
			} else {
				return name + '不是一个文件夹'
			}
		}

		return '没有此文件夹';

	}

	rmFile(name, father) {
		father = father ? father : this.curfile;
		var index = this.getInode(name, father);
		if (!index) {
			return "没有这个文件";
		}
		if (this.file[index].type === 'folder') {
			let fs = this.readFile(index);
			// console.log(father+'index'+index);
			for (var i = 0; i < fs.length; i++) {
				if (fs[i].name !== undefined) {
					this.rmFile(fs[i].name, index);
				}
			}
		}

		this.delBlock(this.file[index].block);
		this.freeInode(index);
		var fat = this.readFile(father);
		for (var i = 0; i < fat.length; i++) {
			if (fat[i].name == name) {
				fat.splice(i, 1);
			}
		}
		this.writeFile(fat, father)
	}
}