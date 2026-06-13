var app = new Vue({
  el: "#app",
  data() {
    return {
      playerList: [],
    };
  },
  methods: {
    fetchLeaderBoard() {
      // 向后端请求排行榜数据
      axios
        .get("http://localhost:8080/winners")
        .then((response) => {
          this.playerList = response.data.data;
        })
        .catch((error) => {
          console.error("获取排行榜失败:", error);
        });
    },
    updateLeaderBoard(winName) {
      //向后端发送获胜玩家的名字，并更新排行榜
      axios
        .post("http://localhost:8080/winners", { playerName: winName })
        .then(() => {
          this.fetchLeaderBoard(); // 更新排行榜
        })
        .catch((error) => {
          console.error("更新排行榜失败:", error);
        });
    },
  },
  created() {
    window.updateLeaderBoard = this.updateLeaderBoard;
  },
  mounted() {
    this.fetchLeaderBoard(); // 页面加载时获取排行榜
  },
});

let isConfirmingAttack = false;
let isMapGenerated = false; // 标记地图是否生成
let tileSize = 80; // 瓦片固定大小
let currentPlayer = "BluePlayer"; // 当前玩家
let isMoving = false; // 标记是否正在移动棋子，防止重复点击
let selectedChess = null; // 前选中的棋子
let isHomeClicked = false;
let selectedUnitType = null;

let isChooseChess = false; //记录是否选中棋子或者家
// 红蓝玩家各自的金钱变量
let bluePlayerGold = 500; // 蓝方初始金币
let redPlayerGold = 500; // 红方初始金币

//红蓝玩家名字
let bluePlayerName = null;
let redPlayerName = null;
let winName = null;

const currentPlayerElement = document.getElementById("currentPlayer");
const nextTurnButton = document.getElementById("nextTurn");

// 获取所有滑块和显示值的元素
const mapSizeInput = document.getElementById("mapSize");
const mapSizeValueDisplay = document.getElementById("mapSizeValue");

const grassRatioInput = document.getElementById("grassRatio");
const grassRatioValueDisplay = document.getElementById("grassRatioValue");

const mountainRatioInput = document.getElementById("mountainRatio");
const mountainRatioValueDisplay = document.getElementById("mountainRatioValue");

const lakeRatioInput = document.getElementById("lakeRatio");
const lakeRatioValueDisplay = document.getElementById("lakeRatioValue");

const treeRatioInput = document.getElementById("treeRatio");
const treeRatioValueDisplay = document.getElementById("treeRatioValue");

// 滑块变化时，更新显示值
mapSizeInput.addEventListener("input", () => {
  mapSizeValueDisplay.textContent = mapSizeInput.value;
});

grassRatioInput.addEventListener("input", () => {
  grassRatioValueDisplay.textContent = grassRatioInput.value;
});

mountainRatioInput.addEventListener("input", () => {
  mountainRatioValueDisplay.textContent = mountainRatioInput.value;
});

lakeRatioInput.addEventListener("input", () => {
  lakeRatioValueDisplay.textContent = lakeRatioInput.value;
});

treeRatioInput.addEventListener("input", () => {
  treeRatioValueDisplay.textContent = treeRatioInput.value;
});

//地图生成与战场初始化
document.getElementById("generateMap").addEventListener("click", function () {
  if (
    document.getElementById("blueName").value === "" ||
    document.getElementById("redName").value === ""
  ) {
    alert("必须输入双方玩家的名字才可以进行游戏！");
    return;
  }

  bluePlayerName = document.getElementById("blueName").value;
  redPlayerName = document.getElementById("redName").value;

  document.getElementById("currentPlayer").textContent = bluePlayerName;
  const options = document.getElementById("options");
  options.style.display = "none"; // 隐藏选项
  document.querySelector("main").style.display = "none";

  document.getElementById("nextTurn").style.display = "block"; // 显示下个回合按钮
  document.getElementById("mapContainer").style.display = "block";
  document.querySelector(".big-box").style.display = "block";

  const mapSize = parseInt(mapSizeInput.value);
  const grassRatio = parseInt(grassRatioInput.value);
  const mountainRatio = parseInt(mountainRatioInput.value);
  const lakeRatio = parseInt(lakeRatioInput.value);
  const treeRatio = parseInt(treeRatioInput.value);

  const mapContainer = document.getElementById("map");
  mapContainer.innerHTML = ""; // 清空上一次生成的地图

  const dimension = mapSize * 2; // 地图大小基于用户输入

  mapContainer.style.gridTemplateColumns = `repeat(${dimension}, ${tileSize}px)`; // 设置网格列大小

  // 使用随机生成地图
  const mapArray = generateMap(
    dimension,
    grassRatio,
    mountainRatio,
    lakeRatio,
    treeRatio
  );

  // 将地图瓦片添加到容器中
  for (let i = 0; i < dimension * dimension; i++) {
    const tile = document.createElement("div"); // 创建瓦片
    tile.classList.add("tile"); // 添加瓦片样式
    tile.dataset.index = i; // 使用 data 属性存储索引

    // 根据随机生成的类型设置瓦片颜色
    switch (mapArray[i]) {
      case 0: // 草
        tile.classList.add("grass");
        break;
      case 1: // 山
        tile.classList.add("mountain");
        break;
      case 2: // 湖泊
        tile.classList.add("lake");
        break;
      case 3: // 树（在草地上生成）
        tile.classList.add("grass");
        const treeElement = document.createElement("div");
        treeElement.classList.add("tree");
        tile.appendChild(treeElement); // 在草地上添加树元素
        break;
    }

    mapContainer.appendChild(tile); // 将瓦片添加到地图容器
  }
  document
    .getElementById("map")
    .scrollTo(document.getElementById("map").scrollWidth, 0);
  // 确保右上角和左下角的3x3区域始终为草地且不带山、湖标签
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      // 右上角区域
      const topRightIndex = row * dimension + (dimension - 3) + col;
      const topRightTile = mapContainer.children[topRightIndex];
      topRightTile.classList.add("grass");
      topRightTile.classList.remove("mountain", "lake"); // 移除山、湖和树的标签
      if (topRightTile.querySelector(".tree")) {
        topRightTile.querySelector(".tree").remove(); // 移除树元素
      }

      // 左下角区域
      const bottomLeftIndex = (dimension - 3 + row) * dimension + col;
      const bottomLeftTile = mapContainer.children[bottomLeftIndex];
      bottomLeftTile.classList.add("grass");
      bottomLeftTile.classList.remove("mountain", "lake"); // 移除山、湖和树的标签
      if (bottomLeftTile.querySelector(".tree")) {
        bottomLeftTile.querySelector(".tree").remove(); // 移除树元素
      }
    }
  }

  isMapGenerated = true; // 标记地图已生成

  // 获取右上角的几个瓦片
  const topRightTile = mapContainer.children[dimension - 1];
  const topRightTile1 = mapContainer.children[dimension - 2];
  const topRightTile2 = mapContainer.children[dimension - 3];
  const topRightTile3 = mapContainer.children[dimension * 2 - 1];

  // 创建蓝方玩家的家园和单位
  const topRightHome = document.createElement("div");
  const topRightSoldier = document.createElement("div");
  const topRightTank = document.createElement("div");
  const topRightCar = document.createElement("div");

  // 给家园和单位添加相应的类名
  topRightHome.classList.add(
    "BluePlayer",
    "Blue-home",
    "home",
    "dataset-health"
  );
  topRightSoldier.classList.add(
    "BluePlayer",
    "soldier",
    "Blue-soldier",
    "chess",
    "dataset-health"
  );

  topRightTank.classList.add(
    "BluePlayer",
    "tank",
    "Blue-tank",
    "chess",
    "dataset-health"
  );
  topRightCar.classList.add(
    "BluePlayer",
    "car",
    "Blue-car",
    "chess",
    "dataset-health"
  );
  topRightSoldier.dataset.health = 3;
  topRightCar.dataset.health = 5;
  topRightTank.dataset.health = 7;
  topRightHome.dataset.health = 3;
  // 将家园和单位分别添加到右上角的瓦片上
  topRightTile.appendChild(topRightHome);
  topRightTile1.appendChild(topRightSoldier);
  topRightTile2.appendChild(topRightTank);
  topRightTile3.appendChild(topRightCar);

  // 获取左下角的几个瓦片
  const bottomLeftTile =
    mapContainer.children[mapContainer.children.length - dimension];
  const bottomLeftTile1 =
    mapContainer.children[mapContainer.children.length - dimension + 1];
  const bottomLeftTile2 =
    mapContainer.children[mapContainer.children.length - dimension + 2];
  const bottomLeftTile3 =
    mapContainer.children[mapContainer.children.length - dimension * 2];

  // 创建红方玩家的家园和单位
  const bottomLeftHome = document.createElement("div");
  const bottomLeftSoldier = document.createElement("div");
  const bottomLeftTank = document.createElement("div");
  const bottomLeftCar = document.createElement("div");

  // 给家园和单位添加相应的类名
  bottomLeftHome.classList.add(
    "RedPlayer",
    "Red-home",
    "home",
    "dataset-health"
  );
  bottomLeftSoldier.classList.add(
    "RedPlayer",
    "soldier",
    "Red-soldier",
    "chess",
    "dataset-health"
  );
  bottomLeftTank.classList.add(
    "RedPlayer",
    "tank",
    "Red-tank",
    "chess",
    "dataset-health"
  );
  bottomLeftCar.classList.add(
    "RedPlayer",
    "car",
    "Red-car",
    "chess",
    "dataset-health"
  );

  bottomLeftSoldier.dataset.health = 3;
  bottomLeftCar.dataset.health = 5;
  bottomLeftTank.dataset.health = 7;
  bottomLeftHome.dataset.health = 3;

  // 将家园和单位分别添加到左下角的瓦片上
  bottomLeftTile.appendChild(bottomLeftHome);
  bottomLeftTile1.appendChild(bottomLeftSoldier);
  bottomLeftTile2.appendChild(bottomLeftTank);
  bottomLeftTile3.appendChild(bottomLeftCar);

  document.querySelectorAll(".home").forEach((home) =>
    home.addEventListener("click", function () {
      if (home.classList.contains(currentPlayer)) {
        // 如果已经选中了 home，再次点击取消选中
        if (isHomeClicked && selectedHome === home) {
          clearHighlightedTiles();
          isHomeClicked = false;
          selectedHome = null;
          resetUnitSelection();
        } else {
          // 选中 home
          clearHighlightedTiles(); // 先清除之前的高亮
          clearHighlights();
          selectedHome = home;
          isHomeClicked = true;
          // highlightHomeArea(home); // 高亮 home 周围区域
          highlightHomeNewArea(home); // 高亮 home 周围区域
          highlightUnitSelection(); // 高亮单位选择
        }
      }
    })
  );
  function resetGame() {
    // 重置状态
    bluePlayerGold = 500;
    redPlayerGold = 500;
    currentPlayer = "BluePlayer"; // 默认蓝方开始
    document.getElementById("currentPlayer").textContent = currentPlayer;
    document.getElementById("currentGold").textContent = bluePlayerGold;

    options.style.display = "block"; // 隐藏选项
    document.querySelector("main").style.display = "flex";

    document.getElementById("nextTurn").style.display = "none"; // 显示下个回合按钮
    document.getElementById("mapContainer").style.display = "none";
    document.querySelector(".big-box").style.display = "none";
    nextTurnButton.removeEventListener("click", Turn);
  }

  function highlightHomeNewArea(homeElement) {
    // const homeIndex = Array.from(mapContainer.children).indexOf(
    //   homeElement.parentElement
    // );
    const dimension = parseInt(mapSizeInput.value) * 2;
    if (homeElement.classList.contains("BluePlayer")) {
      let tiles = [];
      const topRightTile = mapContainer.children[dimension - 2];
      const topRightTile1 = mapContainer.children[dimension * 2 - 2];
      const topRightTile2 = mapContainer.children[dimension * 2 - 1];
      tiles.push(topRightTile, topRightTile1, topRightTile2);
      tiles.forEach((tile) => {
        if (tile !== homeElement.parentElement) {
          tile.style.boxSizing = "border-box";
          tile.style.border = "1px solid white";
          tile.classList.add("highlight-home-area");
        }
      });
    } else {
      let tiles = [];
      const bottomLeftTile = mapContainer.children[mapContainer.children.length - dimension + 1];
      const bottomLeftTile1 = mapContainer.children[mapContainer.children.length - dimension * 2];
      const bottomLeftTile2 = mapContainer.children[mapContainer.children.length + 1 - dimension * 2];
      tiles.push(bottomLeftTile, bottomLeftTile1, bottomLeftTile2);
      tiles.forEach((tile) => {
        if (tile !== homeElement.parentElement) {
          tile.style.boxSizing = "border-box";
          tile.style.border = "1px solid white";
          tile.classList.add("highlight-home-area");
        }
      });
    }
  }
  function moveAction() {
    document.querySelectorAll(".chess").forEach((chess) => {
      chess.dataset.movesLeft = getMaxMoves(chess); // 初始化移动次数
      // 定义一个新的事件处理函数
      const chessClickHandler = function (event) {
        event.stopPropagation(); // 防止事件冒泡导致重复触发
        if (chess.classList.contains(currentPlayer) && !isMoving) {
          clearHighlights();
          if (parseInt(chess.dataset.movesLeft) > 0) {
            // 如果已经选中了 home，再次点击取消选中
            if (isHomeClicked) {
              clearHighlightedTiles();
              isHomeClicked = false;
              resetUnitSelection();
            }

            // 如果再次点击已选中的棋子，取消选中
            if (selectedChess === chess) {
              unselectChess(selectedChess);
              clearHighlights();
              selectedChess = null;
              return;
            }

            // 获取当前棋子所在的 tile 和可移动的区域
            const tile = chess.parentElement;
            const index = Array.from(mapContainer.children).indexOf(tile);
            const tilesToHighlight = getAdjacentTiles(index, dimension);

            // 高亮敌对棋子的格子和可移动区域
            highlightEnemyTiles(index, dimension);
            highlightTiles(tilesToHighlight);

            // 设置当前选中的棋子
            setSelectedChess(chess);
          }
        }
      };

      // 移除旧的事件监听器
      chess.removeEventListener("click", chess._chessClickHandler);

      // 为棋子绑定新的事件监听器
      chess._chessClickHandler = chessClickHandler; // 将事件处理函数存储在元素上
      chess.addEventListener("click", chessClickHandler);
    });
  }

  const Turn = function () {
    clearHighlights();
    clearHighlightedTiles();
    isHomeClicked = false;
    selectedHome = null;
    resetUnitSelection();
    // unselectChess(selectedChess);
    selectedChess = null; // 重置选中的棋子

    document.querySelectorAll(".chess").forEach((chess) => {
      chess.dataset.movesLeft = getMaxMoves(chess); // 重置所有棋子的移动次数
    });
    moveAction();
    bindChessClickEvents();
    // 切换当前玩家
    currentPlayer = currentPlayer === "BluePlayer" ? "RedPlayer" : "BluePlayer";

    if (currentPlayer === "BluePlayer") {
      document.getElementById("currentPlayer").textContent = bluePlayerName;
    } else {
      document.getElementById("currentPlayer").textContent = redPlayerName;
    }

    // document.getElementById("currentPlayer").textContent = currentPlayer;

    if (currentPlayer === "BluePlayer") {
      document.getElementById("currentPlayer").style.color = "blue";
    } else {
      document.getElementById("currentPlayer").style.color = "red";
    }

    if (currentPlayer === "BluePlayer") {
      document
        .getElementById("map")
        .scrollTo(document.getElementById("map").scrollWidth, 0);
    } else {
      document
        .getElementById("map")
        .scrollTo(0, document.getElementById("map").scrollHeight);
    }
    // 增加当前玩家的金币
    if (currentPlayer === "BluePlayer") {
      bluePlayerGold += 500;
      document.getElementById("currentGold").textContent = bluePlayerGold;
    } else {
      redPlayerGold += 500;
      document.getElementById("currentGold").textContent = redPlayerGold;
    }
  };

  mapContainer.addEventListener("click", function (event) {
    if (isMoving) return;
    const clickedTile = event.target.closest(".tile");
    handleTileClick(clickedTile);
  });

  function handleTileClick(clickedTile) {
    if (!clickedTile || !selectedChess) return;
    // 处理 tile 内的树逻辑
    const treeElement = clickedTile.querySelector(".tree");
    if (treeElement && clickedTile.classList.contains("highlight")) {
      treeElement.remove(); // 删除树元素
      selectedChess.dataset.movesLeft -= 1;
      clearHighlights();
      unselectChess(selectedChess);
      return;
    }

    // 检查是否点击了橙色高亮的敌方单位瓦片
    if (clickedTile.classList.contains("highlight-enemy")) {
      // 如果正在确认攻击，则直接返回，避免重复弹出
      if (isConfirmingAttack) return;

      isConfirmingAttack = true; // 设置标识，防止重复弹出
      const confirmAttack = confirm("确定要发动攻击吗？");
      if (!confirmAttack) {
        clearHighlights(); // 清除所有高亮
        isConfirmingAttack = false; // 重置状态
        return;
      }

      const enemyChess = clickedTile.querySelector(".chess");
      if (enemyChess) {
        enemyChess.dataset.health -= 1;

        if (enemyChess.dataset.health <= 0) {
          enemyChess.remove();
          moveChess(selectedChess, clickedTile);
          selectedChess.dataset.movesLeft = 0;
        } else {
          selectedChess.dataset.movesLeft = 0;
        }
      }

      clearHighlights();
      unselectChess(selectedChess);
      isConfirmingAttack = false; // 重置状态
      return;
    }
    // 检查是否点击了敌方的指挥部
    const enemyHome = clickedTile.querySelector(".home");
    if (
      enemyHome &&
      enemyHome.classList.contains(
        currentPlayer === "BluePlayer" ? "RedPlayer" : "BluePlayer"
      )
    ) {
      const confirmAttack = confirm("确定要攻击敌方的指挥部吗？");
      if (!confirmAttack) return;

      // 减少家园生命值
      enemyHome.dataset.health -= 1;
      selectedChess.dataset.movesLeft = 0;
      // 检查家园是否被摧毁
      if (enemyHome.dataset.health <= 0) {
        if (currentPlayer === "BluePlayer") {
          winName = bluePlayerName;
        } else {
          winName = redPlayerName;
        }
        alert(`${winName} 赢了！`);

        updateLeaderBoard(winName);
        resetGame();
        return;
      }

      // 清除高亮显示并重置选中状态
      clearHighlights();
      unselectChess(selectedChess);
      return;
    }
    // 检查该瓦片是否包含棋子
    const hasChessPiece = clickedTile.querySelector(".chess");
    const hasHome = clickedTile.querySelector(".home");

    // 检查普通高亮的移动逻辑
    if (
      clickedTile.classList.contains("highlight") &&
      !clickedTile.classList.contains("tree")
    ) {
      // 如果点击的瓦片上有棋子，不进行移动
      if (hasChessPiece || hasHome) {
        clearHighlights();
        unselectChess(selectedChess); // 取消选中状态

        return; // 直接返回，不进行后续处理
      }
      console.log(hasChessPiece);
      console.log(hasHome);
      if (
        clickedTile.style.border === "4px solid black" ||
        clickedTile.style.border === "4px solid yellow"
      ) {
        isMoving = true;
        moveChess(selectedChess, clickedTile);
        selectedChess.dataset.movesLeft -= 1;
        if (clickedTile.classList.contains("lake")) {
          selectedChess.dataset.movesLeft = 0;
        }
        clearHighlights();
        unselectChess(selectedChess);
      }
    }
  }

  function clearHighlights() {
    document.querySelectorAll(".highlight").forEach((tile) => {
      tile.style.border = "";
      tile.classList.remove("highlight");
    });
    document.querySelectorAll(".highlight-enemy").forEach((tile) => {
      tile.style.border = "";
      tile.classList.remove("highlight-enemy");
    });
  }

  function getAdjacentTiles(index, dimension) {
    //该数组返回被选中的格子
    //设此时被点中的格子的位置为17，地图长度为10
    const tilesToHighlight = [];
    //判断是否存在上方的格子。具体来说，index >= dimension 用来检查当前格子是否不在第一行（如果 index 小于 dimension，说明它处于第一行，没有上方格子）。
    //如果有上方格子，使用 index - dimension 如（17-10）来获得上方格子的索引，并将该格子添加到 tilesToHighlight 数组中。
    if (index >= dimension)
      tilesToHighlight.push(mapContainer.children[index - dimension]); // 上

    //index < mapContainer.children.length - dimension 用来检查当前格子是否不在最后一行（如果 index 的值大于等于 mapContainer.children.length - dimension，
    //说明它处于最后一行，没有下方格子）。如果有下方格子，使用 index + dimension 来获得下方格子的索引，并将该格子添加到 tilesToHighlight 数组中。
    if (index < mapContainer.children.length - dimension)
      tilesToHighlight.push(mapContainer.children[index + dimension]); // 下

    //index % dimension !== 0 用来检查当前格子是否不在第一列（如果 index % dimension === 0，说明它在第一列，没有左方格子）。
    //如果有左方格子，使用 index - 1 来获得左方格子的索引，并将该格子添加到 tilesToHighlight 数组中。
    if (index % dimension !== 0)
      tilesToHighlight.push(mapContainer.children[index - 1]); // 左

    //(index + 1) % dimension !== 0 用来检查当前格子是否不在最后一列（如果 (index + 1) % dimension === 0，说明它在最后一列，没有右方格子）。
    //如果有右方格子，使用 index + 1 来获得右方格子的索引，并将该格子添加到 tilesToHighlight 数组中。
    if ((index + 1) % dimension !== 0)
      tilesToHighlight.push(mapContainer.children[index + 1]); // 右
    return tilesToHighlight;
  }

  // 添加新的高亮敌对单位的逻辑
  function highlightEnemyTiles(index, dimension) {
    const enemyTiles = getAdjacentTiles(index, dimension).filter((tile) => {
      const chess = tile.querySelector(".chess");
      return (
        chess &&
        ((currentPlayer === "BluePlayer" &&
          chess.classList.contains("RedPlayer")) ||
          (currentPlayer === "RedPlayer" &&
            chess.classList.contains("BluePlayer")))
      );
    });
    enemyTiles.forEach((tile) => {
      tile.classList.add("highlight-enemy"); // 添加类以便后续清除高亮
    });
  }

  function highlightTiles(tiles) {
    tiles.forEach((tile) => {
      if (tile.classList.contains("mountain")) {
        tile.style.boxSizing = "border-box";
        tile.style.border = "4px solid red";
      } else if (tile.classList.contains("lake")) {
        tile.style.boxSizing = "border-box";
        tile.style.border = "4px solid yellow";
      } else if (tile.querySelector(".tree")) {
        tile.style.boxSizing = "border-box";
        tile.style.border = "4px solid yellow";
      } else {
        tile.style.boxSizing = "border-box";
        tile.style.border = "4px solid black";
      }
      tile.classList.add("highlight");
      if (tile.classList.contains("highlight-enemy")) {
        tile.style.border = "4px solid orange";
      }
    });
  }

  function bindChessClickEvents() {
    // 获取所有的棋子元素
    const chessPieces = document.querySelectorAll(".chess");

    // 为每个棋子添加点击事件监听器
    chessPieces.forEach((chess) => {
      chess.addEventListener("click", function (event) {
        event.stopPropagation(); // 阻止事件冒泡，避免重复触发
        const clickedTile = chess.parentElement; // 获取棋子的父级 tile

        // 手动调用 tile 上的点击逻辑
        handleTileClick(clickedTile);
      });
    });
  }

  function setSelectedChess(chess) {
    document
      .querySelectorAll(".chess")
      .forEach((c) => c.classList.remove("selected"));
    chess.classList.add("selected");
    selectedChess = chess;
  }

  function moveChess(chess, tile) {
    tile.appendChild(chess);
  }

  function unselectChess(chess) {
    chess.classList.remove("selected");
    clearHighlights(); // 清除高亮
    selectedChess = null; // 清空选中的棋子
    isMoving = false; // 取消移动状态
  }

  function getMaxMoves(chess) {
    if (chess.classList.contains("soldier")) {
      return 2;
    } else if (chess.classList.contains("tank")) {
      return 2;
    } else if (chess.classList.contains("car")) {
      return 3;
    }
    return 1;
  }

  bindChessClickEvents();
  moveAction();
  nextTurnButton.addEventListener("click", Turn);
});

// 随机生成地图函数
function generateMap(size, grassRatio, mountainRatio, lakeRatio, treeRatio) {
  const totalRatio = grassRatio + mountainRatio + lakeRatio + treeRatio;
  const map = new Array(size * size).fill(0); // 创建足够大小的数组

  // 随机生成初始状态
  for (let i = 0; i < map.length; i++) {
    const rand = Math.random(); // 生成0到1之间的随机数
    //设size（地图尺寸为5），草地为64，山为10，湖为15，树为20，则totalRatio为109。设i为1，rand此时为0.4，
    //如果 rand = 0.1，这意味着 rand 小于 lakeRatio / totalRatio，那么该位置将是湖泊（map[i] = 2）。
    //如果 rand = 0.3，这意味着 rand 会落在山的比例范围内，那么该位置将是山（map[i] = 1）。
    //如果 rand = 0.7，那么该位置就有可能是树（map[i] = 3），或者草地（map[i] = 0）。
    if (rand < lakeRatio / totalRatio) {
      map[i] = 2; // 湖泊
    } else if (rand < (lakeRatio + mountainRatio) / totalRatio) {
      map[i] = 1; // 山
    } else if (rand < (lakeRatio + mountainRatio + treeRatio) / totalRatio) {
      map[i] = 3; // 树（在草地上生成）
    } else {
      map[i] = 0; // 草
    }
  }
  // bindHomeClickEvents();
  return map; // 返回生成的地图数组
}

// 清除所有指挥部附近的高亮的瓦片
function clearHighlightedTiles() {
  document.querySelectorAll(".highlight-home-area").forEach((tile) => {
    tile.style.border = "";
    tile.classList.remove("highlight-home-area");
  });

  document.querySelectorAll(".highlight-enemy").forEach((tile) => {
    tile.style.border = ""; // 清除敌对单位的高亮
    tile.classList.remove("highlight-enemy");
  });
}

// 高亮单位选择区域
function highlightUnitSelection() {
  document.querySelectorAll(".build li").forEach((li) => {
    // li.style.boxSizing = "border-box";
    li.style.border = "3px solid yellow";
    li.addEventListener("click", handleUnitSelection);
  });
}

// 重置单位选择区域的高亮
function resetUnitSelection() {
  document.querySelectorAll(".build li").forEach((li) => {
    li.style.border = "";
    li.removeEventListener("click", handleUnitSelection);
  });
}

// 处理单位选择
function handleUnitSelection(event) {
  selectedUnitType =
    event.currentTarget.querySelector(".unit-image").dataset.unit;
  // console.log(selectedUnitType);
}

// 购买单位逻辑
// 处理地图上点击放置单位
mapContainer.addEventListener("click", function (event) {
  const clickedTile = event.target.closest(".tile");
  const hasChessPiece = clickedTile.querySelector(".chess");
  if (
    isHomeClicked &&
    clickedTile &&
    clickedTile.classList.contains("highlight-home-area") &&
    selectedUnitType &&
    !hasChessPiece
  ) {
    // 根据当前玩家判断是否有足够金币购买单位
    const unitCost = getUnitCost(selectedUnitType);
    if (currentPlayer === "BluePlayer") {
      if (bluePlayerGold < unitCost) {
        return;
      }
    } else {
      if (redPlayerGold < unitCost) {
        return;
      }
    }
    // 扣除对应玩家的金币
    if (currentPlayer === "BluePlayer") {
      bluePlayerGold -= unitCost;
      document.getElementById("currentGold").textContent = bluePlayerGold;
    } else if (currentPlayer === "RedPlayer") {
      redPlayerGold -= unitCost;
      document.getElementById("currentGold").textContent = redPlayerGold;
    }
    const playerString =
      currentPlayer === "BluePlayer"
        ? currentPlayer.slice(0, 4)
        : currentPlayer.slice(0, 3);
    // 创建并放置新的棋子元素
    const newUnit = document.createElement("div");
    newUnit.classList.add(
      `${currentPlayer}`,
      `${selectedUnitType}`,
      `${playerString}-${selectedUnitType}`,
      "chess"
    );
    newUnit.dataset.health = getUnitHealth(selectedUnitType); // 设置生命值
    clickedTile.appendChild(newUnit);
    // 重置选择状态
    clearHighlightedTiles();
    resetUnitSelection();
    isHomeClicked = false;
    selectedHome = null;
    selectedUnitType = null;
  }
});

// 获取单位花费
function getUnitCost(unitType) {
  switch (unitType) {
    case "soldier":
      return 75;
    case "car":
      return 200;
    case "tank":
      return 350;
    default:
      return 0;
  }
}

// 添加 home 点击事件监听器（在地图生成后重新绑定）
function bindHomeClickEvents() {
  document.querySelectorAll(".home").forEach((home) => {
    home.removeEventListener("click", homeClickHandler); // 移除之前可能的重复监听器
    home.addEventListener("click", homeClickHandler);
  });
}

// home 点击处理程序
function homeClickHandler(event) {
  event.stopPropagation(); //阻止捕获和冒泡阶段中当前事件的进一步传播
  const home = event.currentTarget;

  if (currentPlayer === "BluePlayer" && home.classList.contains("Blue-home")) {
    handleHomeClick(home);
  } else if (
    currentPlayer === "RedPlayer" &&
    home.classList.contains("Red-home")
  ) {
    handleHomeClick(home);
  }
}

// 获取单位生命值
function getUnitHealth(unitType) {
  switch (unitType) {
    case "soldier":
      return 3;
    case "tank":
      return 7;
    case "car":
      return 5;
    default:
      return 1;
  }
}
