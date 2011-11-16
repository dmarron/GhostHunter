/**
* Ghost Hunter - an accessible first person shooter game.  Programmed by David Marron
 */
dojo.provide('myapp.GhostHunter');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.CheckBox');
dojo.require('dojox.timing._base');
dojo.require('dojo.i18n');
dojo.require('dojo.number');
//dojo.require('uow.audio.JSonic');
dojo.requireLocalization('myapp', 'GhostHunter');

dojo.declare('myapp.GhostHunter', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
	templatePath: dojo.moduleUrl('myapp.templates', 'ghosthunter.html'),

	postCreate: function() {
		this.connect(window,'onkeyup','_onKeyPress');
		this.connect(window,'onkeydown','_onKeyDown');
		this.connect(window,'onclick','_onClick');
		this.connect(window,'onmousemove','_onMove');
		dojo.connect(dojo.doc, 'onkeypress', function(event) {
            if(event.target.size === undefined &&
               event.target.rows === undefined &&
               event.keyCode == dojo.keys.BACKSPACE) {
                // prevent backspace page nav
                //event.preventDefault();
            }
        } );
		this.introPage();
	},
    postMixInProperties: function() {
		//initialize jsonic from unc open web
		//uow.getAudio({defaultCaching: true}).then(dojo.hitch(this, function(js) { this.js = js; }));
		this.sounds = [];
		this.yPos = 0;
		this.mouseX = 0;
		this.mouseY = 0;
		this.dir = "down";
    },
	pressButton: function(e) {
		
	},
	_onClick: function(e) {
		if (this.mode == "intro") {
			this.mode = "play";
			this.secondTime = 84/this.speed*5;
			this.countTime = this.secondTime;
			this.row = 3;
			this.seconds = 0;
			this.startTimer();
		}
		this.sounds[0].volume = 1;
		this.sounds[0].play();
		console.log(this.sounds[0]);
	},
	_onMove: function(e) {
		this.mouseX = e.x;
		this.mouseY = e.y;
	},
	_onKeyDown: function(e) {
		if (this.mode != "play") {
			if (this.mode == "pause") {
				if (e.keyCode == 80) {
					this.mode = "play";
					this.sounds[0].volume = 1;
					this.startTimer();
				}
			} else if (this.mode == "dead") {
				if (e.keyCode != 38 && e.keyCode != 40) {
					//restart to intro screen
					this.mode = "intro";
					this.drawIntroPage();
					grid = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
					this.row = 3;
					this.oldrow = 3;
					this.currentrow = 3;
					this.fakerow = 3;
					this.wingY = 0;
					this.wingDir = "down";
					this.fakeDir = "down";
					this.flying = "done";
					this.previous = [];
				}
			} else if (this.mode == "intro") {
				if (e.keyCode == 32) {
					this.mode = "play";
					this.secondTime = 84/this.speed*5;
					this.countTime = this.secondTime;
					this.row = 3;
					this.seconds = 0;
					this.startTimer();
				}
			}
		} else if (e.keyCode == 80) {
			//P pressed - pause game
			this.mode = "pause";
			this.sounds[0].volume = 0;
		}
	},
	_onKeyPress: function(e) {

	},
	startTimer: function(e) {

		//continuously loop humming sound
		if (typeof this.sounds[0].loop == 'boolean') {
			this.sounds[0].loop = true;
		} else {
			this.sounds[0].addEventListener('ended', function() {
				this.currentTime = 0;
				this.play();
			}, false);
		}
		this.sounds[0].play();
		var t = new dojox.timing.Timer();
		t.setInterval(20);		
		t.onTick = dojo.hitch(this,function() {
			if (this.mode != "play") {
				t.stop();
				if (this.mode == "dead") {
					this.countTime = 0;
					this.seconds = 0;
				}
			} else {
				this.updateCanvas();
			}
		});
		t.start();
	},
	updateCanvas: function(e) {
		var ctx = canvas.getContext("2d");
		ctx.lineWidth = 1;
		ctx.fillStyle = "#fff";
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = "#000";
		var emptySpace = 30;
		var canHeight = canvas.height-emptySpace-1;
		var canWidth = canvas.width-emptySpace-1;
		var batRadius = 20;
		//calculate wing position and bat Y value
		ctx.beginPath();
		if (this.dir == "up") {
			this.yPos -=3;
			if (this.yPos <= 0) {
				this.yPos = 0;
				this.dir = "down";
			}
		} else {
			this.yPos +=3;
			if (this.yPos >= 600) {
				this.yPos = 600;
				this.dir = "up";
			}
		}
		//draw circle
		ctx.beginPath();
		ctx.fillStyle = "#000";
		ctx.arc(100,this.yPos,batRadius*2.5,0,2*Math.PI,true);
		var distance = Math.floor(Math.sqrt((100-this.mouseX)*(100-this.mouseX) + (this.yPos-this.mouseY)*(this.yPos-this.mouseY)));
		ctx.fillText("distance: " + distance,500,100);
		var pitch = distance/800;
		if (pitch > 1) {
			pitch = 1;
		}
		this.sounds[0].volume = pitch;
		ctx.fillText("volume: " + this.sounds[0].volume,500,120);
		if (this.sounds[0].volume <= 0.06) {
			ctx.fillText("Click!",500,140);
		}
		//console.log(distance);
		ctx.fill();
		/*
		//draw bat
		ctx.beginPath();
		ctx.fillStyle = "#000";
		ctx.arc(canWidth/6,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+emptySpace,batRadius,0,2*Math.PI,true);
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#000";
		ctx.moveTo(canWidth/6,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+emptySpace);
		ctx.lineTo(canWidth/6+batRadius/2-batRadius*1.5-emptySpace,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+emptySpace+(this.wingY*batRadius/2));
		ctx.moveTo(canWidth/6,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+emptySpace);
		ctx.lineTo(canWidth/6+batRadius*3.15-emptySpace,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+emptySpace+(this.wingY*batRadius/2));
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = "red";
		ctx.arc(canWidth/6-batRadius/3,canHeight/100+canHeight*49/250*(this.currentrow-1/2)-batRadius/3+emptySpace,batRadius/6,0,2*Math.PI,true);
		ctx.arc(canWidth/6+batRadius/3,canHeight/100+canHeight*49/250*(this.currentrow-1/2)-batRadius/3+emptySpace,batRadius/6,0,2*Math.PI,true);
		ctx.fill();
		ctx.beginPath();
		ctx.fillStyle = "#fff";
		ctx.moveTo(canWidth/6-batRadius/2.5,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+batRadius/3+emptySpace);
		ctx.lineTo(canWidth/6-batRadius/5,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+batRadius/1.6+emptySpace);
		ctx.lineTo(canWidth/6,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+batRadius/3+emptySpace);
		ctx.lineTo(canWidth/6+batRadius/5,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+batRadius/1.6+emptySpace);
		ctx.lineTo(canWidth/6+batRadius/2.5,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+batRadius/3+emptySpace);
		ctx.lineTo(canWidth/6-batRadius/2.5,canHeight/100+canHeight*49/250*(this.currentrow-1/2)+batRadius/3+emptySpace);
		ctx.fill();
		//draw echolocation sound travelling
		*/
	},
	drawIntroPage: function(event) {
		this.mode = "intro";
		var ctx = canvas.getContext("2d");
		ctx.lineWidth = 1;
		ctx.fillStyle = "#fff";
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = "#000";
		ctx.save();
		ctx.font = "80pt Trebuchet MS";
		ctx.fillText("Ghost Hunter",50,110);
		ctx.font = "40pt Trebuchet MS";
		ctx.fillText("Click the mouse to play",150,190);
		ctx.restore();
	},
	introPage: function(event) {
		dojo.empty(this.generateDiv);
		canvas = dojo.doc.createElement('canvas');
		canvas.setAttribute('width',750); 
		canvas.setAttribute('height',750); 
		dojo.place(canvas, this.generateDiv);
		var node = dojo.create('audio');
        if (node.canPlayType('audio/ogg') && node.canPlayType('audio/ogg') != 'no') {
            this._ext = '.ogg';
        } else if (node.canPlayType('audio/mpeg') && node.canPlayType('audio/mpeg') != 'no') {
            this._ext = '.mp3';
        }
		var soundout = dojo.doc.createElement('audio');
		soundout.setAttribute('src', 'sounds/hum' + this._ext);
		this.sounds.push(soundout);
		this.drawIntroPage();
	},
});