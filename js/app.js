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
      componentUrl: 'about.html',
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
    {
      path: '/settings/',
      componentUrl: 'settings.html',
    }
  ]
});

var mainView = app.views.create('.view-main', {
	pushState: true,
	xhrCache: false
});
Dom7('a[href="#tab-1"]').on('click', function (e) {
	ui.loadServerInfo();
});
Dom7('a[href="#tab-2"]').on('click', function (e) {
	ui.loadServerRules();
});
Dom7('a[href="#tab-3"]').on('click', function (e) {
	ui.loadServerPlayers();
});
Dom7('a[href="#tab-4"]').on('click', function (e) {
	var template = Dom7('#loading-template').html();
	var compiledTemplate = Template7.compile(template);
	Dom7('#tab-4').html(compiledTemplate());
	if(server.getServersCount() <= 0)
	{
		var template = Dom7('#loadfail-template').html();
		var compiledTemplate = Template7.compile(template);
		var context = {
			errmsg: languageManager.getVar('please-add-server')
		};
		Dom7('#tab-4').html(compiledTemplate(context));
		return;
	}
	var sid = server.getCurID();
	var svr = server.getServer(sid);
	var buttons = new Array();
	if(svr['rcon'] == "")
	{
		var template = Dom7('#loadfail-template').html();
		var compiledTemplate = Template7.compile(template);
		var context = {
			errmsg: languageManager.getVar('please-configure-rcon')
		};
		Dom7('#tab-4').html(compiledTemplate(context));
		return;
	}
	var template = Dom7('#tab-4-template').html();
	var compiledTemplate = Template7.compile(template);
	Dom7('#tab-4').html(compiledTemplate());
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
		ui.selectServer(data.length - 1);
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
		if(id > 0){
			ui.selectServer(parseInt(id) - 1);
		}
		else
		{
			ui.loadServerInfo();
		}
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
		ui.loadServerInfo();
		ui.loadServerPlayers();
		ui.loadServerRules();
	},
	editServer: function()
	{
		app.popover.close();
		if(server.getServersCount() <= 0)
		{
			app.dialog.alert(languageManager.getVar('please-add-server'));
			return;
		}
		mainView.router.navigate("/edit-server/");
	},
	deleteServer: function()
	{
		app.popover.close();
		if(server.getServersCount() <= 0)
		{
			app.dialog.alert(languageManager.getVar('please-add-server'));
			return;
		}
		console.log(server);
		var id = server.getCurID();
    	app.dialog.confirm(languageManager.getVar('delete-server-confirm'), languageManager.getVar('delete'), function () {
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
	loadServerRules: function()
	{
		if(server.getServersCount() <= 0)
		{
			var template = Dom7('#loadfail-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				errmsg: languageManager.getVar('please-add-server')
			};
			Dom7('#tab-2').html(compiledTemplate(context));
			return;
		}
		var template = Dom7('#loading-template').html();
		var compiledTemplate = Template7.compile(template);
		Dom7('#tab-2').html(compiledTemplate());
		var id = server.getCurID();
		var svr = server.getServer(id);
		var q = new sampquery(svr['ip'], svr['port']);
		q.query("r", function(data){
			var decode = q.decode("r", data.data);
			var template = Dom7('#tab-2-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				data: decode
			};
			Dom7('#tab-2').html(compiledTemplate(context));
			q.close();
		}, function(){
			var template = Dom7('#loadfail-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				errmsg: languageManager.getVar('connect-failed')
			};
			Dom7('#tab-2').html(compiledTemplate(context));
			q.close();
		});
	},
	loadServerPlayers: function()
	{
		if(server.getServersCount() <= 0)
		{
			var template = Dom7('#loadfail-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				errmsg: languageManager.getVar('please-add-server')
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
				errmsg: languageManager.getVar('connect-failed')
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
				errmsg: languageManager.getVar('please-add-server')
			};
			Dom7('#tab-1').html(compiledTemplate(context));
			return;
		}
		var template = Dom7('#loading-template').html();
		var compiledTemplate = Template7.compile(template);
		Dom7('#tab-1').html(compiledTemplate());
		var id = server.getCurID();
		var svr = server.getServer(id);
		var q = new sampquery(svr['ip'], svr['port']);
		q.query("i", function(data){
			var decode = q.decode("i", data.data);
			decode['password'] = languageManager.getVar('no');
			if(decode['password'] == 1) decode['password'] = languageManager.getVar('yes');
			var sid = server.getCurID();
			var ssvr = server.getServer(sid);
			decode['addr'] = ssvr['ip'] + ":" + ssvr['port'];
			var template = Dom7('#tab-1-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				data: decode,
				LAN: languageManager.getPack()
			};
			Dom7('#tab-1').html(compiledTemplate(context));
			q.close();
		}, function(){
			var template = Dom7('#loadfail-template').html();
			var compiledTemplate = Template7.compile(template);
			var context = {
				errmsg: languageManager.getVar('connect-failed')
			};
			Dom7('#tab-1').html(compiledTemplate(context));
			q.close();
		});
	},
	runRCON: function(){
		app.popover.close();
		if(server.getServersCount() <= 0)
		{
			app.dialog.alert(languageManager.getVar('please-add-server'));
			return;
		}
		var sid = server.getCurID();
		var svr = server.getServer(sid);
		var buttons = new Array();
		if(svr['rcon'] == "")
		{
			ui.showToast(languageManager.getVar('please-configure-rcon'));
			return;
		}
		app.dialog.prompt(languageManager.getVar('please-type-rcon-command'), 'RCON', function (command) {
			var r = new samprcon(svr['ip'], svr['port'], svr['rcon']);
			r.run(command, function(){
				ui.showToast(languageManager.getVar('command-successfully-executed'));
				rconEchoManager.init();
				setTimeout('rconEchoManager.show();', 3000);
			}, function(){
				ui.showToast(languageManager.getVar('command-execute-failed'));
				r.close();
			}, true, function(data){
				var data = r.decode(data.data);
				rconEchoManager.add(data['name'] + "<br/>");
			});
		});
	},
	showPlayerInfo: function(id, name, score, ping){
		var sid = server.getCurID();
		var svr = server.getServer(sid);
		var buttons = new Array();
		if(svr['rcon'] != "")
		{
			buttons.push({
			text: languageManager.getVar('kick-player'),
			color: 'red',
			playerid: id,
			type: 'kick'
		  },
		  {
			text: languageManager.getVar('ban-player'),
			color: 'red',
			playerid: id,
			type: 'ban'
		  });
		}
		buttons.push({
			text:languageManager.getVar('close'),
		});
		app.dialog.create({
		title: name +　"(ID: " + id + ")",
		text: languageManager.getVar('score') + '：' + score + "<br/>" + languageManager.getVar('ping') + "：" + ping,
		buttons: buttons,
		onClick: function(dialog, index){
			if(dialog.params.buttons[index].type == "kick"){
				app.dialog.close();
				app.dialog.confirm(languageManager.getVar('kick-player-confirm'), function () {
					app.dialog.close();
					var sid = server.getCurID();
					var svr = server.getServer(sid);
					var r = new samprcon(svr['ip'], svr['port'], svr['rcon']);
					r.run("kick " + id, function(data){
						ui.showToast(languageManager.getVar('command-successfully-executed'));
						r.close();
						setTimeout('ui.loadServerPlayers();', 500);
					}, function(){
						ui.showToast(languageManager.getVar('command-execute-failed'));
						r.close();
					}, false);
				});	
			}
			else if(dialog.params.buttons[index].type == "ban"){
				app.dialog.close();
				app.dialog.confirm(languageManager.getVar('ban-player-confirm'), function () {
					app.dialog.close();
					var sid = server.getCurID();
					var svr = server.getServer(sid);
					var r = new samprcon(svr['ip'], svr['port'], svr['rcon']);
					r.run("ban " + id, function(data){
						ui.showToast(languageManager.getVar('command-successfully-executed'));
						r.close();
						setTimeout('ui.loadServerPlayers();', 500);
					}, function(){
						ui.showToast(languageManager.getVar('command-execute-failed'));
						r.close();
					}, false);
				});	
			}
		},
		verticalButtons: true,
		}).open();
	},
	switchNightMode: function(){
		var set = storage.get("night");
		if(!utils.isNull(set))
		{
			if(set == "true"){
				set = "false";
			}
			else
			{
				set = "true";
			}
		}
		else
		{
			set = "true";
		}
		storage.set("night", set);
		if(set == "true")
		{
			Dom7("#app").addClass("theme-dark color-theme-black");
		}
		else
		{
			Dom7("#app").removeClass("theme-dark color-theme-black");
		}
		app.popover.close();
	},
	loadNightMode: function(){
		var set = storage.get("night");
		if(!utils.isNull(set))
		{
			if(set == "true")
			{
				Dom7("#app").addClass("theme-dark color-theme-black");
			}
		}
	},
	viewForum: function(){
		cordova.InAppBrowser.open('https://bbs.hc-gaming.com', '_system');
	},
	loadPopover: function(){
		var template = Dom7('#popover-template').html();
		var compiledTemplate = Template7.compile(template);
		var context = {
			LAN: languageManager.getPack()
		};
		Dom7('#popover').html(compiledTemplate(context));
	},
	loadToolbar: function(){
		Dom7('#tab-1-bar').text(languageManager.getVar('infos'));
		Dom7('#tab-2-bar').text(languageManager.getVar('rules'));
		Dom7('#tab-3-bar').text(languageManager.getVar('players'));
		Dom7('#tab-4-bar').text(languageManager.getVar('admin'));
	}
	/*loadEULA: function(){
		var file = app.request({
		  url: 'EULA.txt',
		  async: false
		});
		app.popup.create({
            content: file.response,
			on: {
				closed: function (popup) {
				  storage.set("EULA", "true");
				},
			}
        }).open();
	}*/
};

var rconEchoManager = {
	init: function(){
		this.quene = "";
	},
	add: function(msg){
		this.quene += msg;
	},
	show: function(){
		app.popup.create({
			content: '\
			  <div class="popup">\
				<div class="page">\
				  <div class="navbar">\
					<div class="navbar-inner">\
					  <div class="title">' + languageManager.getVar('rcon-command-reply') + '</div>\
					  <div class="right"><a href="#" class="link popup-close">' + languageManager.getVar('close') + '</a></div>\
					</div>\
				  </div>\
				  <div class="page-content">\
					<div class="block">\
					  <p>' + this.quene + '</p>\
					</div>\
				  </div>\
				</div>\
			  </div>\
			'
		}).open();
		this.quene = "";
	}
};
var updateManager = {
	getVersion: function(){
		var file = app.request({
		  url: 'version.json',
		  async: false
		});
		return JSON.parse(file.response);
	},
	checkUpdate: function(manual){
		if(manual) ui.showToast(languageManager.getVar('checking-update'));
		app.request({
			url: 'https://sampctrl.gitee.io/version.json',
			cache: false,
			success: function (data, status, xhr) {
				data = JSON.parse(data);
				var localversion = updateManager.getVersion();
				if(data.build > localversion.build){
					app.dialog.confirm(languageManager.getVar('version') + '：' + data.version + "<br/>" + languageManager.getVar('release-date') +"：" + data.release + "<br/>" + languageManager.getVar('release-note') + "：<br/>" + data.note, languageManager.getVar('new-version-detacted'), function () {
						cordova.InAppBrowser.open(data.url, '_system');
					});
				}
				else
				{
					if(manual) ui.showToast(languageManager.getVar('using-latest-version'));
				}
			}
		});
	}
}
var tapp = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
		Transparentstatusbar.init(function(result) {});
		ui.loadPopover();
		ui.loadToolbar();
		ui.loadNightMode();
		updateManager.checkUpdate(false);
		/*var eula = storage.get("EULA");
		if(utils.isNull(eula))
		{
			ui.loadEULA();
		}*/
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

String.prototype.gblen = function() {  
  var len = 0;  
  for (var i=0; i<this.length; i++) {  
    if (this.charCodeAt(i)>127 || this.charCodeAt(i)==94) {  
       len += 2;  
     } else {  
       len ++;  
     }
   }  
  return len;  
}

sampquery.prototype = {
    send: function (data) {
		if(navigator.connection.type == "none"){
			this.errcallback();
			return;
		}
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
		if(info.socketId == socketId) callback(info);
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
		else if(type == "r")
		{
			var array = new Uint8Array(data);
			var rules = utils.toInteger(decoder2.decode(new Uint8Array([array[11], array[12]])));
			var offset = 13;
			var temp = new Array();
			for(var i=0;i<rules;i++)
			{
				var rnlength = array[offset];
				array2 = new Uint8Array(data, offset + 1, rnlength);
				temp['Name'] = decoder.decode(array2);
				if(temp['Name'] == "lagcomp") temp['Name'] = "滞后补偿";
				else if(temp['Name'] == "mapname") temp['Name'] = "地图";
				else if(temp['Name'] == "version") temp['Name'] = "版本";
				else if(temp['Name'] == "weather") temp['Name'] = "天气";
				else if(temp['Name'] == "weburl") temp['Name'] = "网站";
				else if(temp['Name'] == "worldtime") temp['Name'] = "时间";
				else if(temp['Name'] == "artwork") temp['Name'] = "自定义资源";
				var offset2 = offset+1+rnlength;
				var rvlength = array[offset2];
				array2 = new Uint8Array(data, offset2 + 1, rvlength);
				temp['Value'] = decoder.decode(array2);
				offset = offset2 + rvlength + 1;
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


samprcon.prototype = {
    send: function (data, needreply) {
		var that = this;
		chrome.sockets.udp.create(function(createInfo) {
	      that.socketId = createInfo.socketId;
		  if(needreply) that.listener = chrome.sockets.udp.onReceive.addListener(function(info){ that.listen(info, that.socketId, that.repcallback); });
		  chrome.sockets.udp.bind(createInfo.socketId, '0.0.0.0', 0, function(result) {
			chrome.sockets.udp.send(createInfo.socketId, data, that.ip, that.port, function(result) {
			  if (result < 0){
				  that.errcallback();
			  }
			  else {
				  that.callback();
			  }
			});
		  });
		});
    },
	listen: function (info, socketId, callback) {
		if(info.socketId == socketId){
			/*var time = new Date().getTime();
			var iMicrotime = time + 200;
			while(true)
			{
				var newtime = new Date().getTime();
				if(newtime > iMicrotime) break;
			}*/
			callback(info);
		}
	},
	run: function (cmd, callback, errcallback, needreply, repcallback) {
		var data = "SAMP";
		var ips = this.ip.split(":");
		data += String.fromCharCode(ips[0]);
		data += String.fromCharCode(ips[1]);
		data += String.fromCharCode(ips[2]);
		data += String.fromCharCode(ips[3]);
		data += String.fromCharCode(this.port & 0xFF);
		data += String.fromCharCode(this.port >> 8 & 0xFF);
		data += "x";
		data += String.fromCharCode(this.rcon.gblen() & 0xFF);
		data += String.fromCharCode(this.rcon.gblen() >> 8 & 0xFF);
		data += this.rcon;
		data += String.fromCharCode(cmd.gblen() & 0xFF);
		data += String.fromCharCode(cmd.gblen() >> 8 & 0xFF);
		data += cmd;
		this.callback = callback;
		this.errcallback = errcallback;
		this.repcallback = repcallback;
		this.send(utils.rawStringToBuffer(data), needreply);
	},
	decode: function(data)
	{
		var reply = new Array();
		var decoder = new TextDecoder("gbk");
		var array = new Uint8Array(data, 13);
		reply['name'] = decoder.decode(array);	
		return reply;
	},
	close: function()
	{
		chrome.sockets.udp.close(this.socketId, function(){
		});
	},
};
function samprcon(ip, port, rcon) {
	this.ip = ip;
	this.port = parseInt(port);
	this.rcon = rcon;
}

var languageManager = {
	getLanList: function(){
		var file = app.request({
		  url: 'languages/lists.json',
		  async: false
		});
		return JSON.parse(file.response);
	},
	setLan: function(language){
		storage.set("language", language);
	},
	getLan: function(){
		var set = storage.get("language");
		if(!utils.isNull(set))
		{
			return set;
		}
		else
		{
			storage.set("language", "zh_Hans");
			return storage.get("language");
		}
	},
	loadPackage: function(){
		var file = app.request({
		  url: 'languages/' + this.getLan() + '.json',
		  async: false
		});
		this.pack = JSON.parse(file.response);
	},
	getPack: function(){
		if(this.pack == undefined) this.loadPackage();
		return this.pack;
	},
	getVar: function(name){
		if(this.pack == undefined) this.loadPackage();
		return this.pack[name];
	}
}