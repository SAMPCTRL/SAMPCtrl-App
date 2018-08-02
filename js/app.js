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
  ]
});

var mainView = app.views.create('.view-main', {
	pushState: true,
	xhrCache: false
});

var utils = {
	isNull: function(arg1){
		return !arg1 && arg1!==0 && typeof arg1!=="boolean"?true:false;
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