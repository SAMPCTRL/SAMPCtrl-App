var app = new Framework7({
  root: '#app',
  name: 'SAMPCTRL',
  pushState: true,
  theme: 'md',
  dialog: {
	buttonOk: '确定',
	buttonCancel: '取消',
  },
  toast: {
    closeTimeout: 3000,
    closeButton: false,
  },
  routes: [
    {
      path: '/index/',
      url: 'index.html',
    },
    {
      path: '/about/',
      url: 'about.html',
    },
    {
      path: '/servers/',
      componentUrl: 'servers.html',
    },
    {
      path: '/add-server/',
      componentUrl: 'add-server.html',
    },
    {
      path: '/edit-server/',
      componentUrl: 'edit-server.html',
    },
  ]
});

var mainView = app.views.create('.view-main', {
	pushState: true,
	xhrCache: false
});
Dom7('a[href="#tab-1"]').on('click', function (e) {
	Dom7('.messagebar').addClass("display-none");
	ui.loadServerInfo();
});
Dom7('a[href="#tab-2"]').on('click', function (e) {
	Dom7('.messagebar').addClass("display-none");
});
Dom7('a[href="#tab-3"]').on('click', function (e) {
	Dom7('.messagebar').addClass("display-none");
	ui.loadServerPlayers();
});
Dom7('a[href="#tab-4"]').on('click', function (e) {
	if(Dom7('.messagebar').hasClass("display-none")) Dom7('.messagebar').removeClass("display-none");
});

var utils = {
	isNull: function(arg1){
		return !arg1 && arg1!==0 && typeof arg1!=="boolean"?true:false;
	},
	toObject: function(arr) {
	  var rv = {};
	  for (var i = 0; i < arr.length; ++i)
		if (arr[i] !== undefined) rv[i] = arr[i];
	  return rv;
	},
	rawStringToBuffer: function( str ) {
		var idx, len = str.length, arr = new Array( len );
		for ( idx = 0 ; idx < len ; ++idx ) {
			arr[ idx ] = str.charCodeAt(idx) & 0xFF;
		}
		return new Uint8Array( arr ).buffer;
	},
	toInteger: function(sData)
	{
		if(sData === "") return null;
 		var iInteger = 0;
 		iInteger += (sData[0].charCodeAt());
 		if(!utils.isNull(sData[1]))
 		{
 			iInteger += (sData[1].charCodeAt() << 8);
 		}
 		if(!utils.isNull(sData[2]))
 		{
 			iInteger += (sData[2].charCodeAt() << 16);
 		}
 		if(!utils.isNull(sData[3]))
 		{
 			iInteger += (sData[3].charCodeAt() << 24);
 		}
 		if(iInteger >= 4294967294)
		{
 			iInteger -= 4294967296;
		}
 		return iInteger;
	}
};
var server = {
    getServers: function () {
		var db = storage.get("servers");
		if(!utils.isNull(db))
		{
			var data = JSON.parse(db);
		}
		else
		{
			var data = new Array();
		}
		return data;
    },
	getServersCount: function () {
		var db = storage.get("servers");
		if(!utils.isNull(db))
		{
			var data = JSON.parse(db);
		}
		else
		{
			var data = new Array();
		}
		return data.length;
    },
	getServer: function (id) {
		var db = storage.get("servers");
		if(!utils.isNull(db))
		{
			var data = JSON.parse(db);
		}
		else
		{
			var data = new Array();
		}
		return data[id];
	},
	addServer: function(name, addr, port, rcon) {
		var db = storage.get("servers");
		if(!utils.isNull(db))
		{
			var data = JSON.parse(db);
		}
		else
		{
			var data = new Array();
		}
		var svr = {};
		svr['name'] = name;
		svr['ip'] = addr;
		svr['port'] = port;
		svr['rcon'] = rcon;
		console.log(svr);
		data.push(svr);
		storage.set("servers",JSON.stringify(data));
		ui.loadServerInfo();
	},
	editServer: function(id, name, addr, port, rcon) {
		var db = storage.get("servers");
		if(!utils.isNull(db))
		{
			var data = JSON.parse(db);
		}
		else
		{
			var data = new Array();
		}
		var svr = {};
		svr['name'] = name;
		svr['ip'] = addr;
		svr['port'] = port;
		svr['rcon'] = rcon;
		data[id] = svr;
		storage.set("servers",JSON.stringify(data));
		ui.loadServerInfo();
	},
	delServer: function(id) {
		var db = storage.get("servers");
		if(!utils.isNull(db))
		{
			var data = JSON.parse(db);
		}
		else
		{
			var data = new Array();
		}
		data.remove(id);
		storage.set("servers",JSON.stringify(data));
		if(id > 0) ui.selectServer(parseInt(id) - 1);
	},
	getCurID: function () {
		return storage.get("selserver");
	}
};

var storage = {
    set: function (key, value) {
		window.localStorage.setItem( key , value );
    },
	get: function(key) {
		return window.localStorage.getItem( key );
	},
	remove: function(key) {
		window.localStorage.removeItem( key );
	}
};

var ui = {
	selectServer: function(id)
	{
		storage.set("selserver", id);
		this.loadServerInfo();
	},
	deleteServer: function()
	{
		console.log(server);
		var id = server.getCurID();
		app.popover.close();
    	app.dialog.confirm('服务器删除后无法恢复，您确定要删除这个服务器吗？', '删除', function () {
    		app.dialog.close();
    		server.delServer(id);
    	});
	},
	showToast: function(context)
	{
		if(!context) context = "";
		var toast =	app.toast.create({
			text: context,
		});
		toast.open();
	},
	loadServerPlayers: function()
	{
		if(server.getServersCount() <= 0)
		{
			var template = Dom7('#loadfail-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				errmsg: "请添加服务器"
			};
			Dom7('#tab-3').html(compiledTemplate(context));
			return;
		}
		var template = Dom7('#loading-template').html();
		var compiledTemplate = Template7.compile(template);
		Dom7('#tab-3').html(compiledTemplate());
		var id = server.getCurID();
		var svr = server.getServer(id);
		var q = new sampquery(svr['ip'], svr['port']);
		q.query("d", function(data){
			console.log(data);
			app.preloader.hide();
			var decode = q.decode("d", data.data);
			var template = Dom7('#tab-3-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				data: decode
			};
			Dom7('#tab-3').html(compiledTemplate(context));
			q.close();
		}, function(){
			var template = Dom7('#loadfail-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				errmsg: "服务器连接失败"
			};
			Dom7('#tab-3').html(compiledTemplate(context));
			q.close();
		});
	},
	loadServerInfo: function()
	{
		if(server.getServersCount() <= 0)
		{
			var template = Dom7('#loadfail-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				errmsg: "请添加服务器"
			};
			Dom7('#tab-3').html(compiledTemplate(context));
			return;
		}
		var template = Dom7('#loading-template').html();
		var compiledTemplate = Template7.compile(template);
		Dom7('#tab-3').html(compiledTemplate());
		var id = server.getCurID();
		var svr = server.getServer(id);
		var q = new sampquery(svr['ip'], svr['port']);
		q.query("i", function(data){
			var decode = q.decode("i", data.data);
			decode['password'] = "否";
			if(decode['password'] == 1) decode['password'] = "是";
			var sid = server.getCurID();
			var ssvr = server.getServer(sid);
			decode['addr'] = ssvr['ip'] + ":" + ssvr['port'];
			var template = Dom7('#tab-1-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				data: decode
			};
			Dom7('#tab-1').html(compiledTemplate(context));
			q.close();
		}, function(){
			var template = Dom7('#loadfail-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				errmsg: "服务器连接失败"
			};
			Dom7('#tab-1').html(compiledTemplate(context));
			q.close();
		});
	},
	showPlayerInfo: function(id, name, score, ping){
		app.dialog.create({
		title: name +　"(ID: " + id + ")",
		text: '积分：' + score + "<br/>延迟：" + ping,
		buttons: [
		  {
			text: '踢出玩家',
			color: 'red'
		  },
		  {
			text: '封禁玩家',
			color: 'red'
		  },
		  {
			text: '关闭',
		  },
		],
		verticalButtons: true,
		}).open();
	}
};

var tapp = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
		Transparentstatusbar.init(function(result) {});
		ui.loadServerInfo();
    }
};

tapp.initialize();

Array.prototype.remove=function(dx) 
{ 
  if(isNaN(dx)||dx>this.length){return false;} 
  for(var i=0,n=0;i<this.length;i++) 
  { 
    if(this[i]!=this[dx]) 
    { 
      this[n++]=this[i] 
    } 
  } 
  this.length-=1 
}

sampquery.prototype = {
    send: function (data) {
		var that = this;
		chrome.sockets.udp.create(function(createInfo) {
	      that.socketId = createInfo.socketId;
		  that.listener = chrome.sockets.udp.onReceive.addListener(function(info){ that.listen(info, that.socketId, that.callback); });
		  chrome.sockets.udp.bind(createInfo.socketId, '0.0.0.0', 0, function(result) {
			chrome.sockets.udp.send(createInfo.socketId, data, that.ip, that.port, function(result) {
			  if (result < 0) that.errcallback();
			});
		  });
		});
    },
	listen: function (info, socketId, callback) {
		if(info.socketId == socketId)
		{
			console.log("correct!");
			console.log(info);
			console.log(socketId);
			callback(info);
		}
		else
		{
			console.log("error!");
			console.log(info);
			console.log(socketId);
		}
	},
	query: function (type, callback, errcallback) {
		var data = "SAMP";
		var ips = this.ip.split(":");
		data += String.fromCharCode(ips[0]);
		data += String.fromCharCode(ips[1]);
		data += String.fromCharCode(ips[2]);
		data += String.fromCharCode(ips[3]);

		data += String.fromCharCode(this.port & 0xFF);
		data += String.fromCharCode(this.port >> 8 & 0xFF);

		data += type;
		
		this.callback = callback;
		this.errcallback = errcallback;
		this.send(utils.rawStringToBuffer(data));
	},
	close: function()
	{
		chrome.sockets.udp.close(this.socketId, function(){
		});
	},
	decode: function(type, data)
	{
		var reply = new Array();
		var decoder = new TextDecoder("gbk");
		var decoder2 = new TextDecoder("iso-8859-1");
		if(type == "i")
		{
			var array = new Uint8Array(data, 0, 16);
			reply['passworded'] = array[11];
			reply['players'] = utils.toInteger(decoder2.decode(new Uint8Array([array[12], array[13]])));
			reply['maxplayers'] = utils.toInteger(decoder2.decode(new Uint8Array([array[14], array[15]])));
			array = new Uint8Array(data, 16, 4);
			strlen = array[0] + array[1] + array[2] + array[3];
			array = new Uint8Array(data, 20, strlen);
			reply['name'] = decoder.decode(array);	
			array = new Uint8Array(data, 20 + strlen, 4);
			var strlen2 = array[0] + array[1] + array[2] + array[3];
			array = new Uint8Array(data, strlen + 24, strlen2);
			reply['mode'] = decoder.decode(array);
			array = new Uint8Array(data, 24 + strlen + strlen2, 4);
			array = new Uint8Array(data, 28 + strlen + strlen2);
			reply['language'] = decoder.decode(array);
			return reply;
		}
		else if(type == "d")
		{
			var array = new Uint8Array(data);
			console.log(array);
			var players = utils.toInteger(decoder2.decode(new Uint8Array([array[11], array[12]])));
			var offset = 13;
			var temp = new Array();
			for(var i=0;i<players;i++)
			{
				temp['ID'] = array[offset];
				var namelength = array[offset + 1];
				array2 = new Uint8Array(data, offset + 2, namelength);
				temp['Name'] = decoder.decode(array2);
				var offset2 = offset + 2 + namelength;
				temp['Score'] = utils.toInteger(decoder2.decode(new Uint8Array([array[offset2], array[offset2+1], array[offset2+2], array[offset2+3]])));
				offset2 = offset + 6 + namelength;
				temp['Ping'] = utils.toInteger(decoder2.decode(new Uint8Array([array[offset2], array[offset2+1], array[offset2+2], array[offset2+3]])));
				offset = offset2 + 4;
				reply.push(temp);
				temp = {};
			}
			return reply;
		}
	}
};
function sampquery(ip, port) {
	this.ip = ip;
	this.port = parseInt(port);
}