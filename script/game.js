//Автор(с): Кудуштеев Алексей

var g_timer1  = setInterval("updateFrame()", 200);
var g_timer2  = setInterval("updateMove()", 30);
var g_iblocks = [new Image(), new Image(), new Image(), new Image(), new Image()];
var g_ialien  = new Image();
var g_user    = new cuser();
var g_level   = 0;


function load_resources(){
	var o = g_objAt("field");
	o.style.width  = FIELD_WIDTH  + "px";
	o.style.height = FIELD_HEIGHT + "px";
	o.style.left   = FIELD_LEFT + "px";
	o.style.top    = FIELD_TOP  + "px";

	for(var i = 0; i < FIELD_ROWS; ++i){
		g_field.push(new Array());
		for(var j = 0; j < FIELD_COLS; ++j)
			g_field[i].push(CELL_NONE);
	}

	g_iblocks[0].src = "data/block1.bmp";
	g_iblocks[1].src = "data/block2.bmp";
	g_iblocks[2].src = "data/ladder.png";
	g_iblocks[3].src = "data/ship.png";
	g_iblocks[4].src = "data/bonus.png";

	g_ialien.src = "data/alien.png";

	g_level = getCookieLevel();
	g_user.create();

	var opera = false;
	if(navigator.appName.toLowerCase().indexOf("opera") != -1)
		opera = true;

	if(opera){
		window.onkeypress = function(e){
			if(g_gmenu){
				if(e.keyCode == 13)
					start_game();
				return;
			}

			switch(e.keyCode){
			case 38: //вверх
			case 87:
			case 119:
			case 1094:
			case 1062:
				g_user.keydown(VK_UP);
				break;
			case 37: //влево
			case 65:
			case 97:
			case 1092:
			case 1060:
				g_user.keydown(VK_LEFT);
				break;
			case 39: //вправо
			case 68:
			case 100:
			case 1074:
			case 1042:
				g_user.keydown(VK_RIGHT);
				break;
			case 40: //вниз
			case 83:
			case 1099:
			case 1067:
			case 115:
				g_user.keydown(VK_DOWN);
				break;
			case 46:
			case 32:
				g_user.keydown(VK_DEL);
				break;
			case 27: //esc
				quit_game();
				break;
			}
		};


	} else {

		//управление игрой
		window.onkeydown = function(e){
			var key = window.event || e;

			if(g_gmenu){
				if(key.keyCode == 13)
					start_game();
				return;
			}

			switch(key.keyCode){
			case 38: //вверх
			case 87:
				g_user.keydown(VK_UP);
				break;
			case 37: //влево
			case 65:
				g_user.keydown(VK_LEFT);
				break;
			case 39: //вправо
			case 68:
				g_user.keydown(VK_RIGHT);
				break;
			case 40: //вниз
			case 83:
				g_user.keydown(VK_DOWN);
				break;
			case 46:
			case 32:
				g_user.keydown(VK_DEL);
				break;
			case 27: //esc
				quit_game();
				break;
			}
		};
	}

	//отпускание клавиш клавиатуры
	window.onkeyup = function(e){
		var key = window.event || e;
		if(g_gmenu)
			return;

		switch(key.keyCode){
		case 37: //left
		case 65:
			g_user.keyup(VK_LEFT);
			break;
		case 39: //right
		case 68:
			g_user.keyup(VK_RIGHT);
			break;
		case 38: //up
		case 87:
			g_user.keyup(VK_UP);
			break;
		case 40: //down
		case 83:
			g_user.keyup(VK_DOWN);
			break;
		case 46: //del
		case 32:
			g_user.keyup(VK_DEL);
			break;
		}
	};
}


function init_level(){
	unpack_level(g_field, g_levels[g_level]);

	g_objText(g_objAt("state"), "УРОВЕНЬ - " + (g_level + 1));

	while(g_aliens.length > 0){
		delete g_aliens[g_aliens.length - 1];
		g_aliens.pop();
	}

	g_bcount = 0;
	var htm = "";
	var x, y, id, right, str;
	for(var i = 0; i < g_field.length; ++i){
		for(var j = 0; j < g_field[i].length; ++j){
			x  = FIELD_LEFT + j * CELL_SIZE;
			y  = FIELD_TOP  + i * CELL_SIZE;
			id = i * FIELD_COLS + j; 
			switch(g_field[i][j]){
			case CELL_BLOCK1: //дерево
				htm += "<IMG ID=\"B1_" + id + "\" SRC=\"\" STYLE=\"position:absolute;left:"+x+"px;top:"+y+"px;width:"+CELL_SIZE+"px;height:"+CELL_SIZE+"px;\" />";
				break;
			case CELL_BLOCK2: //камень
				htm += "<IMG ID=\"B2_" + id + "\" SRC=\"\" STYLE=\"position:absolute;left:"+x+"px;top:"+y+"px;width:"+CELL_SIZE+"px;height:"+CELL_SIZE+"px;\" />";
				break;
			case CELL_LADDER: //лестница
				htm += "<IMG ID=\"L_" + id + "\" SRC=\"\" STYLE=\"position:absolute;left:"+x+"px;top:"+y+"px;width:"+CELL_SIZE+"px;height:"+CELL_SIZE+"px;\" />";
				break;
			case CELL_SHIP: //шип
				htm += "<IMG ID=\"S_" + id + "\" SRC=\"\" STYLE=\"position:absolute;left:"+x+"px;top:"+y+"px;width:"+CELL_SIZE+"px;height:"+CELL_SIZE+"px;\" />";
				break;
			case CELL_BONUS: //бонус
				htm += "<IMG ID=\"B_" + id + "\" SRC=\"\" STYLE=\"position:absolute;left:"+x+"px;top:"+y+"px;width:"+CELL_SIZE+"px;height:"+CELL_SIZE+"px;\" />";
				++g_bcount;
				break;
			case CELL_USER: //пользователь
				g_field[i][j] = CELL_NONE;
				g_user.setPos(x, y);				
				break;
			case CELL_ALIEN: //враг
				right = j + 1;
				while((right < g_field[i].length) && (g_field[i][right] == CELL_ALIEN)){
					g_field[i][right] = CELL_NONE;
					++right;
				}
				--right;

				str = "A" + id;
				g_aliens.push( new alien(str, y, x, FIELD_LEFT + right * CELL_SIZE) );

				htm += "<IMG ID=\"" + str + "\" SRC=\"\" STYLE=\"position:absolute;left:"+x+"px;top:"+y+"px;width:"+CELL_SIZE+"px;height:"+CELL_SIZE+"px;\" />";
				break;
			}
		}
	}

	g_objAt("blocks").innerHTML = htm;
	for(var i = 0; i < g_field.length; ++i){
		for(var j = 0; j < g_field[i].length; ++j){
			id = i * FIELD_COLS + j; 
			switch(g_field[i][j]){
			case CELL_BLOCK1: //блок
				g_objAt("B1_" + id).src = g_iblocks[0].src;
				break;
			case CELL_BLOCK2: //камень
				g_objAt("B2_" + id).src = g_iblocks[1].src;
				break;
			case CELL_LADDER: //лестница
				g_objAt("L_" + id).src = g_iblocks[2].src;
				break;
			case CELL_SHIP: //шип
				g_objAt("S_" + id).src = g_iblocks[3].src;
				break;
			case CELL_BONUS:
				g_objAt("B_" + id).src = g_iblocks[4].src;
				break;
			case CELL_ALIEN:
				g_objAt("A" + id).src = g_ialien.src;
				g_field[i][j] = CELL_NONE;
				break;
			}

		}
	}

	for(var i = 0; i < g_aliens.length; ++i)
		g_aliens[i].init();
}


function updateFrame(){
	if(!g_gmenu)
		g_user.update();
}


function updateMove(){
	if(g_gmenu)
		return;

	if(!g_user.move()){
		quit_game();
		alert("ВЫ ПРОИГРАЛИ ИГРУ!");
		return;
	}

	for(var i = 0; i < g_aliens.length; ++i){
		g_aliens[i].updateMove();
		if(isBoxToBox(g_aliens[i].x, g_aliens[i].y, CELL_SIZE, g_user.x + CELL_OFF, g_user.y + CELL_OFF, CELL_BOUND)){
			g_aliens[i].undir();
			if(!g_user.setUron()){
				quit_game();
				alert("ВЫ ПРОИГРАЛИ ИГРУ!");
				return;
			}
		}
	}

	if(g_user.isBonus()){
		if(++g_level < g_levels.length)
			init_level();
		else {
			g_level = 0;
			quit_game();
			alert("ПОЗДРАВЛЯЮ, ВЫ ПРОШЛИ ВСЮ ИГРУ.");
		}
		putCookieLevel(g_level);
	}
}


function start_game(){
	var h = "hidden";
	var s = "visible";
	g_objAt("logo").style.visibility  = h;
	g_objAt("start").style.visibility = h;
	g_objAt("help").style.visibility  = h;
	g_objAt("field").style.visibility = s;
	g_objAt("user").style.visibility  = s;
	g_objAt("boom").style.visibility  = s;
	g_objAt("state").style.visibility = s;
	g_objAt("life").style.visibility  = s;
	g_gmenu = false;
	init_level();
}


function quit_game(){
	var h = "hidden";
	var s = "visible";
	g_objAt("logo").style.visibility  = s;
	g_objAt("start").style.visibility = s;
	g_objAt("help").style.visibility  = s;
	g_objAt("field").style.visibility = h;
	g_objAt("user").style.visibility  = h;
	g_objAt("boom").style.visibility  = h;
	g_objAt("state").style.visibility = h;
	g_objAt("life").style.visibility  = h;
	g_gmenu = true;
	g_objAt("blocks").innerHTML = "";

	while(g_aliens.length > 0){
		delete g_aliens[g_aliens.length - 1];
		g_aliens.pop();
	}
	g_user.reset();
}

load_resources();
