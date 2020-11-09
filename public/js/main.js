$('body').ready(function() {
    var map = document.getElementById("map");
    for(var i = 1; i <= 4; ++i) {
        var tr = document.createElement("tr");
        for(var j = 1; j <= 4; ++j) {
            var td = document.createElement("td");
            td.setAttribute("id", i + "_" + j);
            tr.append(td);
        }
        map.append(tr);
    }
});

const open = 0;
const human_img = "./public/img/human.png";
const trap = 1;
const trap_img = "./public/img/trap.jpeg";
const monster = 2;
const monster_img = "./public/img/monster.jpeg";
const gold = 3;
const gold_img = "./public/img/gold.jpeg";
const row = 4, col = 4;
const direct = [[0, 1], [0, -1], [1, 0], [-1, 0]];

var map = new Array(row + 1);
var know_map = new Array(row + 1);
var path = [];
var score = 0, over = 0;

function init() {
    $("#btn").attr("disabled", true);
    map = new Array(row + 1);
    know_map = new Array(row + 1);
    path = [];
    score = 0, over = 0;
    $("#message").text("Score: 0");
    for(var i = 1; i <= row; ++i) {
        map[i] = new Array();
        know_map[i] = new Array();
        map[i][0] = open;
        for(var j = 1; j <= col; ++j) {
            $("#" + i + "_" + j).css({
                "background-image": "none",
                "background-size": "100% 100%"
            });
            map[i][j] = 0;
            know_map[i][j] = -1;
            if(i == 1 && j == 1) continue;
            if(i == 1 && j == 2) continue;
            if(i == 2 && j == 1) continue;
            if(Math.random() <= 0.2) {
                map[i][j] = trap;
                $("#" + i + "_" + j).css({
                    "background-image": "url(" + trap_img + ")",
                    "background-size": "100% 100%"
                });
            }
        }
    }
    $("#1_1").css({
        "background-image": "url(" + human_img + ")",
        "background-size": "100% 100%"
    });
    var x = Math.floor(Math.random() * row) + 1;
    var y = Math.floor(Math.random() * col) + 1;
    while(map[x][y] != 0 || (x == 1 && y == 1)) {
        x = Math.floor(Math.random() * row) + 1;
        y = Math.floor(Math.random() * col) + 1;
    }
    map[x][y] = monster;
    $("#" + x + "_" + y).css({
        "background-image": "url(" + monster_img + ")",
        "background-size": "100% 100%"
    });
    while(map[x][y] != 0 || (x == 1 && y == 1)) {
        x = Math.floor(Math.random() * row) + 1;
        y = Math.floor(Math.random() * col) + 1;
    }
    map[x][y] = gold;
    $("#" + x + "_" + y).css({
        "background-image": "url(" + gold_img + ")",
        "background-size": "100% 100%"
    });
}

function check(x, y) {
    return x >= 1 && y >= 1 && x <= row && y <= col;
}

function judge(x, y) {
    if(check(x, y) && (know_map[x][y] == -1)) {
        for(var i = 0; i < direct.length; ++i) {
            var dx = x + direct[i][0];
            var dy = y + direct[i][1];
            if(dx < 1 || dy < 1 || dx > row || dy > col) continue;
            if(map[dx][dy] == trap) return false;
        }
        return true;
    }
    return false;
}

function dfs(x, y) {
    know_map[x][y] = map[x][y];
    if(map[x][y] == gold) {
        score += 100;
        path.push([x, y, score]);
        return true;
    }
    if(map[x][y] == monster) score -= 10;
    path.push([x, y, score]);
    for(var i = 0; i < direct.length; ++i) {
        var dx = x + direct[i][0];
        var dy = y + direct[i][1];
        if(!judge(dx, dy)) continue;
        --score;
        if(dfs(dx, dy)) return true;
        --score;
        path.push([x, y, score]);
    }
    return false;
}

function move(pos) {
    if(pos >= path.length) {
        over = true;
        return;
    }
    $("#" + path[pos - 1][0] + "_" + path[pos - 1][1]).css({"background-image": "none"});
    $("#" + path[pos][0] + "_" + path[pos][1]).css({"background-image": "url(" + human_img + ")"});
    $("#message").text("Score: " + path[pos][2]);
}

function goback(x, y, score) {
    var que = new Array();
    var vis = new Array(row + 1);
    var pre = new Array(row + 1);
    for(var i = 1; i <= row; ++i) {
        vis[i] = new Array();
        vis[i][0] = 0;
        pre[i] = new Array();
        pre[i][0] = [];
        for(var j = 1; j <= col; ++j) {
            vis[i][j] = 0;
            pre[i][j] = [0, 0, 0];
        }
    }
    que.push([x, y, score]);
    vis[x][y] = 1;
    while(que.length) {
        var xx = que[0][0], yy = que[0][1], zz = que[0][2];
        que.shift();
        if(xx == 1 && yy == 1) break;
        for(var i = 0; i < direct.length; ++i) {
            var dx = xx + direct[i][0];
            var dy = yy + direct[i][1];
            if(!check(dx, dy) || vis[dx][dy] || know_map[dx][dy] == -1) continue;
            vis[dx][dy] = 1;
            que.push([dx, dy, zz - 1]);
            pre[dx][dy] = [xx, yy, zz - 1];
        }
    }
    var xx = 1, yy = 1;
    var tmp = [];
    while(xx != x || yy != y) {
        tmp.push([xx, yy, pre[xx][yy][2] + 1]);
        var kk = xx;
        xx = pre[xx][yy][0];
        yy = pre[kk][yy][1];
    }
    for(var i = tmp.length - 1; i >= 0; --i) path.push(tmp[i]);
}

function start() {
    var p = new Promise(function(resolve, reject) {
        init();
        var find_gold = dfs(1, 1);
        if(find_gold) {
            goback(path[path.length - 1][0], path[path.length - 1][1], path[path.length - 1][2]);
        }
        resolve();
    });
    p.then(function() {
        var pos = 0;
        var id = setInterval(() => {
            ++pos;
            move(pos);
            if(over) {
                $("#btn").attr("disabled", false);
                clearInterval(id);
            }
        }, 500);
    }, (err) => { console.log(err); });
}