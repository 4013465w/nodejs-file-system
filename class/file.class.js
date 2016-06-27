Date.prototype.Format = function(fmt) { // 日期格式化 
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
var blockMap = [];//数据块map
var fileMap = [];//inode
class Block {
	constructor() {
		this.count = 1000;//磁盘大小
		this.block = new Array(10000);
		this.everyBlock = 10;
	}

	findNullBlock() {//查找空数据块
		for (var i = 0; i < this.count; i++) {//初始化所有为空
			if (!blockMap[i]) {
				blockMap[i] = true;
				return i;
			}
		}
	}

	readBlock(blk) {//读取数据块，返回数据块内容
		let start = blk * 10;
		var re = [];
		for (var i = 0; i < 10; i++) {
			if (this.block[start + i] !== undefined) {
				re.push(this.block[start + i]);
			}
		}
		return re;
	}
/**
 * 写数据块
 * @Author wz
 * @DateTime  2016-06-27T08:20:35+0800
 * @param     {[int]}                 blk 
 * @param     {[arr]}                 arr 
 */
	writeBlock(blk, arr) {
		let start = blk * 10;
		for (var i = 0; i < 10; i++) {
			this.block[start + i] = arr[i];
		}
	}
	/**
	 * 删除数据块
	 * @Author wangzhen
	 * @DateTime  2016-06-27T08:21:39+0800
	 * @param     {[arr]}                 blk 
	 */
	delBlock(blk) {
		for (var i = 0; i < blk.length; i++) {
			blockMap[blk[i]] = false;
		}
	}
}

module.exports = class File extends Block {
	constructor() {
		super();
		this.file = [];
		this.curfile = 0;
		this.file[0] = {//初始化根目录
			name: '/',
			father: 0,
			time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
			size: null,
			type: 'folder',
			block: [],
			Permissions: 77,
			author: 'root'
		}
		fileMap[0] = true;
	}
	/**
	 * 显示文件列表
	 * @Author wangzhen
	 * @DateTime  2016-06-27T08:24:12+0800
	 */
	showList() {
		let file = this.readFile(this.curfile);
		return file;
	}
	/**
	 * 获取inode
	 * @Author wangzhen
	 * @DateTime  2016-06-27T08:24:43+0800
	 * @param     {[string]}                 name   
	 * @param     {[id]}                 father 
	 */
	getInode(name, father) {
		father = father ? father : this.curfile;//如果没有传递father，father为当前目录
		var list = this.readFile(father);
		for (var i = 0; i < list.length; i++) {
			if (list[i].name == name) {
				return list[i].id;
			}
		}
		return false;
	}
	/**
	 * [readFile description]
	 * @Author   Wang.Zhen
	 * @DateTime 2016-06-27T11:54:44+0800
	 * @param    {[int]}                 index [description]
	 */
	readFile(index) {
		var back = [];
		let inode = this.file[index];
		for (var i = 0; i < inode.block.length; i++) {
			back = back.concat(this.readBlock(inode.block[i]));//将各数据块内容连接
		}
		return back;
	}
	/**
	 * 查看文件
	 * @Author wangzhen
	 * @DateTime  2016-06-27T08:29:10+0800
	 * @param     {[string]}                 name 
	 * @return    {[string or bool]}                      
	 */
	catFile(name) {
		let index = this.getInode(name);//获取inode id
		let inode = this.file[index];
		if (inode && inode.type === 'file') {
			let back = this.readFile(index);
			return back.join('');//返回字符串
		}
		return false;
	}
	/**
	 * 写文件
	 * @Author wangzhen
	 * @DateTime  2016-06-27T08:31:06+0800
	 * @param     {[arr]}                 arr 
	 */
	wFile(arr) {
		let name = arr[0];
		let content = arr[1] || '';
		let index = this.getInode(name);
		if (index) {
			this.file[index].size = Math.ceil(arr.length / 10);
			this.writeFile(content, index);
		}
	}
	/**
	 * 检查权限
	 * @Author wangzhen
	 * @DateTime  2016-06-27T08:31:28+0800
	 * @param     {[string]}                 name   
	 * @param     {[int]}                 userId 
	 * @param     {[int]}                 num    
	 */
	checkPermission(name,userId,num){
		if (userId == 'root') {//超级用户拥有所有权限
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
	/**
	 * 写文件
	 * @Author wangzhen
	 * @DateTime  2016-06-27T08:33:28+0800
	 * @param     {[arry]}                 arr   
	 * @param     {[int]}                 inode 
	 */
	writeFile(arr, inode) {
		this.delBlock(this.file[inode].block);//删除原来数据块
		this.file[inode].block = [];
		this.file[inode].size = 0;

		for (var i = 0; i < arr.length; i += 10) {//写入文件
			let blk = this.findNullBlock();
			this.file[inode].block.push(blk);
			this.file[inode].size++;
			this.writeBlock(blk, arr.slice(i));
		}
	}
	freeInode(inode) {//情空inode
		fileMap[inode] = false;
	}
	findNullInode() {//查找空inode
		for (var i = 0; i < 100; i++) {
			if (!fileMap[i]) {
				fileMap[i] = true;
				return i;
			}
		}
	}
/**
 * 创建文件
 * @Author wangzhen
 * @DateTime  2016-06-27T08:41:58+0800
 * @param     {[string]}                 name   
 * @param     {[int]}                 type   
 * @param     {[string]}                 author 
 */
	createFile(name, type, author) {//创建文件
		let rf = this.readFile(this.curfile);
		let inode = this.findNullInode();
		var chongming = 0;
		// 检查是否重名
		for (var i = rf.length - 1; i >= 0; i--) {
			if (rf[i].name == name) {
				console.log(' 无法创建目录: 文件已存在');
				return;
			}
		}
		rf.push({
			name: name,
			id: inode
		});//压栈
		this.writeFile(rf, this.curfile);//
		this.file[inode] = {
			father: this.curfile,
			time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
			name:name,
			size: 0,
			type: type,
			block: [],
			Permissions: 75,//rwx
			author: author
		};
		// console.log('inode'+inode)
	}
	/**
	 * 进入文件夹
	 * @Author wangzhen
	 * @DateTime  2016-06-27T08:42:58+0800
	 * @param     {[string]}                 name 
	 */
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
				this.curfile = index;//改变当前文件
				return 1;
			} else {
				return name + '不是一个文件夹'
			}
		}

		return '没有此文件夹';

	}
	/**
	 * 删除文件或者文件夹
	 * @Author wangzhen
	 * @DateTime  2016-06-27T08:44:02+0800
	 * @param     {[string]}                 name   
	 * @param     {[int]}                 father 
	 */
	rmFile(name, father) {
		father = father ? father : this.curfile;
		var index = this.getInode(name, father);
		if (!index) {
			return "没有这个文件";
		}
		if (this.file[index].type === 'folder') {
			let fs = this.readFile(index);//获取所有子文件（夹）
			for (var i = 0; i < fs.length; i++) {
				if (fs[i].name !== undefined) {
					this.rmFile(fs[i].name, index);//递归执行
				}
			}
		}
		if (this.file[index].type === 'file') {
		this.delBlock(this.file[index].block);//释放数据块
	}
		this.freeInode(index);
		var fat = this.readFile(father);
		for (var i = 0; i < fat.length; i++) {
			if (fat[i].name == name) {
				fat.splice(i, 1);//子inode
			}
		}
		this.writeFile(fat, father)//修改父inode记录的
	}
}