//cursors - displays everyone's cursors

Players = new Meteor.Collection("players");
//server

if (Meteor.isServer) {
	
	function clearDb(){
		Players.remove({});
	}
	
	Meteor.startup(function(){
		clearDb();
		Meteor.autorun(function(){
			Meteor.publish("players", function(){
			var current = new Date().getTime();
			var cursors = Players.find({});
				cursors.forEach(function(cursor){
					if(current - cursor.timestamp > 30000 || cursor.timestamp == undefined){
						Players.remove({name: cursor.name});
					}
				});
			return Players.find({});
			});
		});
	});
}

//client
if(Meteor.isClient){
	
	var can, ctx;

	Meteor.startup(function(){
		var player_name = prompt("Player Name", "Player");
		var current = new Date().getTime();
		var player_id = Players.insert({name: player_name, x:0, y:0, timestamp: current});
		Session.set('player_id', player_id);
		can=document.getElementById("can");
		can.width = window.innerWidth;
		can.height = window.innerHeight;
		ctx=can.getContext("2d");
		console.log("started up");
		Meteor.autorun(redraw);
	});
	
	document.addEventListener("mousemove", function(event){
		var me = Players.findOne(Session.get('player_id'));
		var current = new Date().getTime();
		Players.update(Session.get('player_id'), {$set: {x: event.pageX, y: event.pageY, timestamp: current}});
	});
	
	function redraw(){
		Meteor.subscribe("players");
		var me = Players.findOne(Session.get('player_id'));
		if(me == undefined){
			window.location.reload();
		}
		ctx.clearRect(0,0,can.width, can.height);
		ctx.fillStyle ="#aa0000";
		var cursors = Players.find({});
		console.log(cursors.count());
		cursors.forEach(function(cursor){
			ctx.beginPath();
			ctx.arc(cursor.x, cursor.y, 16, 0, 2*Math.PI);
			ctx.closePath();
			ctx.fillText(cursor.name, cursor.x + 32, cursor.y);
			ctx.fill();
		});
	}
}