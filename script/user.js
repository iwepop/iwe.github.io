//Автор(с): Кудуштеев Алексей

var VK_LEFT  = 0;
var VK_RIGHT = 1;
var VK_UP    = 2;
var VK_DOWN  = 3;
var VK_DEL   = 4;


function cuser() {
	this.x      = 0;
	this.y      = 0;
	this.vel    = 4;
	this.jump   = false;
	this.fly    = false;
	this.top    = 0;
	this.dir    = -1;
	this.life   = 0;
	this.bcnt   = 0;
	this.tboom  = false;
	this.boom   = g_objAt("boom");
	this.obj    = { img:g_objAt("user") };
	this.istop  = { img:new Image() };
	this.lsteps = { imgs:[ null, new Image()] };
	this.rsteps = { imgs:[ null, new Image()] };
	this.imove  = { imgs:[ null, new Image()] };
	this.a_move = null;
	this.a_left = null;
	this.a_right= null;

	this.create = function(){
		var sx = CELL_SIZE + "px";
		var sy = CELL_SIZE + "px";
		this.obj.img.style.width  = sx;
		this.obj.img.style.height = sy;

		this.istop.img.src  = "data/user_stop.png";
		this.lsteps.imgs[0] = this.istop.img;
		this.lsteps.imgs[1].src = "data/user_lstep.png";

		this.rsteps.imgs[0] = this.istop.img;
		this.rsteps.imgs[1].src = "data/user_rstep.png";

		this.imove.imgs[0] = this.istop.img;
		this.imove.imgs[1].src = "data/user_move.png";

		this.obj.img.src = this.istop.img.src;

		this.a_left  = new sprite(this.obj.img, this.lsteps.imgs);
		this.a_right = new sprite(this.obj.img, this.rsteps.imgs);
		this.a_move  = new sprite(this.obj.img, this.imove.imgs);
	};

	this.setPos = function(x, y){
		this.x = x;
		this.y = y;
		this.obj.img.style.left = x + "px";
		this.obj.img.style.top  = y + "px";
		this.jump = false;
		this.fly  = false;
		this.dir  = -1;
		this.life = 3;
		this.bcnt = 0;
		this.tboom= false;
		this.boom.style.visibility = "hidden";
		g_objText(g_objAt("life"), "ЖИЗНЕЙ - " + this.life);
	};

	this.reset = function(){
		this.jump = false;
		this.fly  = false;
		this.dir  = -1;
		this.bcnt = 0;
		this.tboom= false;
		this.a_left.stop();
		this.a_right.stop();
		this.a_move.stop();
		this.obj.img.src = this.istop.img.src;
	};

	this.setUron = function(){
		if(!this.tboom){
			this.tboom = true;
			this.bcnt  = 0;
			this.boom.style.visibility = "visible";
			this.boom.style.left = this.x + "px";
			this.boom.style.top  = this.y + "px";

			--this.life;
			g_objText(g_objAt("life"), "ЖИЗНЕЙ - " + this.life);
			if(this.life < 1) //вы проиграли
				return false;
		}
		return true;
	};

	this.getX = function(){
		return this.x;
	};

	this.getY = function(){
		return this.y;
	};

	this.keydown = function(e){
		var t;
		switch(e){
		case VK_LEFT:
			this.dir = VK_LEFT;
			this.a_right.stop();
			if(this.a_left.isStop())
				this.a_left.play(true);
			break;
		case VK_RIGHT:
			this.dir = VK_RIGHT;
			this.a_left.stop();
			if(this.a_right.isStop())
				this.a_right.play(true);
			break;
		case VK_UP:
			if(!this.isBlock(CELL_LADDER))
				break;
			this.dir = VK_UP;
			this.a_left.stop();
			this.a_right.stop();
			if(this.a_move.isStop())
				this.a_move.play(true);
			break;
		case VK_DOWN:
			if(!this.isBlock(CELL_LADDER))
				break;
			this.dir = VK_DOWN;
			this.a_left.stop();
			this.a_right.stop();
			if(this.a_move.isStop())
				this.a_move.play(true);
			break;
		case VK_DEL: //прыжок
			if(this.jump || this.fly)
				break;
			
			t = this.offset(this.x, this.y + CELL_SIZE) > CELL_BONUS;
			if(!t)
				t = this.offset(this.x + CELL_SIZE, this.y + CELL_SIZE) > CELL_BONUS;
			if(t){
				this.top  = Math.max(this.y - CELL_SIZE * 2 - CELL_MID, FIELD_TOP);
				this.jump = true;
			}
			break;
		}
	};

	this.keyup = function(e){
		switch(e){
		case VK_LEFT:
			this.a_left.stop();
			this.dir = -1;
			this.obj.img.src = this.istop.img.src;
			break;
		case VK_RIGHT:
			this.a_right.stop();
			this.dir = -1;
			this.obj.img.src = this.istop.img.src;
			break;
		case VK_UP:
		case VK_DOWN:
			this.a_move.stop();
			this.dir = -1;
			this.obj.img.src = this.istop.img.src;
			break;
		}
	};

	this.update = function(){
		this.a_left.update_frame();
		this.a_right.update_frame();
		this.a_move.update_frame();
	};

	this.move = function(){
		var t;
		if(this.tboom){
			t = this.bcnt * (Math.PI / 180.0);
			this.boom.style.left = ((this.x + CELL_MID) + CELL_MID * Math.sin(t)) + "px";
			this.boom.style.top  = ((this.y + CELL_MID) + CELL_MID * Math.cos(t)) + "px";
			this.bcnt += 20;
			if(this.bcnt > 720){
				this.bcnt  = 0;
				this.tboom = false;
				this.boom.style.visibility = "hidden";
			}
		}

		switch(this.dir){
		case VK_LEFT: //движение влево
			this.x -= this.vel;
			if(this.x < FIELD_LEFT)
				this.x = FIELD_LEFT;

			t = this.offset(this.x, this.y + CELL_EDGE + 2);
			if(t <= CELL_LADDER)
				t = this.offset(this.x, this.y + CELL_SIZE - CELL_EDGE - 2);
			if(t > CELL_LADDER)
				this.x += this.vel;
			this.obj.img.style.left = this.x + "px";
			break;
		case VK_RIGHT: // движение вправо
			this.x += this.vel;
			if((this.x + CELL_SIZE) > FIELD_RIGHT)
				this.x = FIELD_RIGHT - CELL_SIZE;

			t = this.offset(this.x + CELL_SIZE - CELL_EDGE, this.y + CELL_EDGE + 2);
			if(t <= CELL_LADDER)
				t = this.offset(this.x + CELL_SIZE - CELL_EDGE, this.y + CELL_SIZE - CELL_EDGE - 2);
			if(t > CELL_LADDER)
				this.x -= this.vel;
			this.obj.img.style.left = this.x + "px";
			break;
		case VK_UP: //движение вверх
			if(!this.isBlock(CELL_LADDER)){
				this.keyup(VK_UP);
				break;
			}

			this.y -= this.vel;
			if(this.y < FIELD_TOP)
				this.y = FIELD_TOP;

			t = this.offset(this.x + CELL_EDGE, this.y);
			if(t <= CELL_LADDER)
				t = this.offset(this.x + CELL_SIZE - CELL_EDGE - 3, this.y);
			if(t > CELL_LADDER)
				this.y += this.vel;
			this.obj.img.style.top = this.y + "px";
			break;
		case VK_DOWN: //движение вниз
			if(!this.isBlock(CELL_LADDER)){
				this.keyup(VK_DOWN);
				break;
			}

			this.y += this.vel;
			if((this.y + CELL_SIZE) > FIELD_BOTTOM)
				this.y = FIELD_BOTTOM - CELL_SIZE;

			t = this.offset(this.x + CELL_EDGE, this.y + CELL_SIZE - CELL_EDGE);
			if(t <= CELL_LADDER)
				t = this.offset(this.x + CELL_SIZE - CELL_EDGE - 3, this.y + CELL_SIZE - CELL_EDGE);
			if(t > CELL_LADDER)
				this.y -= this.vel;

			this.obj.img.style.top = this.y + "px";			
			break;
		}

		if(this.jump){ //прыжок
			this.y -= this.vel;

			var y1 = this.offset(this.x + CELL_EDGE - 2, this.y + 1);
			var y2 = this.offset(this.x + CELL_SIZE - CELL_EDGE - 2, this.y + 1);

			if(y1 > CELL_LADDER || y2 > CELL_LADDER){
				this.y   += this.vel;
				this.jump = false;
				this.fly  = true;
			} else if(this.y < this.top){
				this.y    = this.top;
				this.jump = false;
				this.fly  = true;
			}
			this.obj.img.style.top = this.y + "px";
			return true;
		}

		if(!this.isBlock(CELL_LADDER)){
			var t1 = this.offset(this.x, this.y + CELL_SIZE);
			var t2 = this.offset(this.x + CELL_SIZE - CELL_EDGE, this.y + CELL_SIZE);
			if(t1 <= CELL_BONUS && t2 <= CELL_BONUS){
				this.y += this.vel;
				this.obj.img.style.top = this.y + "px";
				this.fly = true;

				if((this.y + CELL_SIZE) >= FIELD_BOTTOM){ //падение в пропасть, вы проиграли
					this.life = 0;
					return false;
				}
			} else if(t1 == CELL_SHIP && t2 == CELL_SHIP){//шипы
				this.fly = true;
				return this.setUron();
			} else
				this.fly = false;
		} else
			this.fly = false;
		return true;
	};

	this.offset = function(x, y){
		var col = Math.floor(x / CELL_SIZE);
		var row = Math.floor(y / CELL_SIZE);
		if(col < 0)
			col = 0;
		else if(col >= FIELD_COLS)
			col = FIELD_COLS - 1;

		if(row < 0)
			row = 0;
		else if(row >= FIELD_ROWS)
			row = FIELD_ROWS - 1;
		return g_field[row][col];
	};

	this.isBlock = function(type){
		var t = this.offset(this.x + CELL_EDGE, this.y + CELL_EDGE);
		if(t != type){
			t = this.offset(this.x + CELL_SIZE - CELL_EDGE, this.y + CELL_EDGE);
			if(t != type){
				t = this.offset(this.x + CELL_EDGE, this.y + CELL_SIZE);
				if(t != type)
					t = this.offset(this.x + CELL_SIZE - CELL_EDGE, this.y + CELL_SIZE);
			}
		}
		return (t == type);
	};

	this.getCol = function(x){
		var col = Math.floor(x / CELL_SIZE);
		if(col < 0)
			col = 0;
		else if(col >= FIELD_COLS)
			col = FIELD_COLS - 1;
		return col;
	};

	this.getRow = function(y){
		var row = Math.floor(y / CELL_SIZE);
		if(row < 0)
			row = 0;
		else if(row >= FIELD_ROWS)
			row = FIELD_ROWS - 1;
		return row;
	};

	this.isBonus = function(){
		var r = this.getRow(this.y);
		var c = this.getCol(this.x);
		var g = g_field[r][c] == CELL_BONUS;

		if(!g){
			r = this.getRow(this.y + CELL_SIZE);
			c = this.getCol(this.x);
			g = g_field[r][c] == CELL_BONUS;
			if(!g){
				r = this.getRow(this.y);
				c = this.getCol(this.x + CELL_SIZE);
				g = g_field[r][c] == CELL_BONUS;
				if(!g){
					r = this.getRow(this.y + CELL_SIZE);
					c = this.getCol(this.x + CELL_SIZE);
					g = g_field[r][c] == CELL_BONUS;
				}
			}
		}

		if(g){
			var i = c * CELL_SIZE + CELL_MID;
			var j = r * CELL_SIZE + CELL_MID;
			if(isBoxToCircle(this.x + CELL_EDGE, this.y + CELL_EDGE, CELL_SIZE - CELL_EDGE, i, j, B_RADIUS)){
				g_field[r][c] = CELL_NONE;
				g_objAt("B_" + (r * FIELD_COLS + c)).style.visibility = "hidden";
				if(--g_bcount <= 0)//вы выиграли
					return true;	
			}
		}
		return false;
	};
}