;(function () {
  // 定义棋盘是 X x Y
  var X = 16
  var Y = 16
  // 定义记录棋局数变量
  var game = 1
  // 定义当前棋局是否结束的变量
  var gameOver = false
  // 定义记录棋局每个坐标点位与占领状态的数组
  var gamePositions = []
  // 定义结果检测对象
  var gamePositionsCollections = {
    horizontalCollections: [],
    verticalCollections: [],
    forwardSlashCollections: [],
    backSlashCollections: []
  }
  // 定义记录下一颗棋子颜色和序号的变量
  var nextColor = 'black'
  var nextOrder = 1
  // 获取需要操作的dom元素
  var gobangBoard = document.querySelector('.gobang-board')
  var gobangGame = document.querySelector('.gobang-game')
  var gobangNextGame = document.querySelector('.gobang-next-game')
  // 获取棋盘尺寸
  var gobangBoardRect = gobangBoard.getBoundingClientRect()
  // 定义初始化函数
  var init = function () {
    // 清空棋盘
    gobangBoard.innerHTML = ''
    // 初始化棋局数
    displayGame(game)
    // 初始化棋盘线
    drawBoardLines()
    // 初始化棋局坐标点位与占领状态
    initGamePositions()
    // 初始化结果检测对象
    initGamePositionsCollections()
    // 初始化下一颗棋子颜色和序号
    initNextPiece(game)
    // 初始化事件
    initEvents()
    // 棋局数+1
    game++
  }
  // 定义事件处理函数
  var eventHandlers = {
    // 棋盘点击事件
    clickGobangBoard(e) {
      if (e.target !== this) {
        return
      }
      // 计算点击位置与所有坐标点位的距离，在距离最近的坐标点位落子
      var gamePostion = getNearestGamePosition(e.offsetX, e.offsetY)
      if (gamePostion) {
        createPiece(nextColor, nextOrder, gamePostion)
      }
    },
    // 下一局按钮事件
    nextGame() {
      gameOver = false
      // 隐藏按钮
      gobangNextGame.style.display = 'none'
      // 清空已生成棋子数组
      curPieces = []
      init()
    }
  }
  // 定义初始化事件函数
  function initEvents() {
    gobangBoard.addEventListener('click', eventHandlers.clickGobangBoard)
    gobangNextGame.addEventListener('click', eventHandlers.nextGame)
  }
  // 定义显示当前棋局数函数
  function displayGame(game) {
    gobangGame.innerHTML = '第' + game + '局'
  }
  // 定义棋盘线绘制函数
  function drawBoardLines() {
    // 横线间隔和纵线间隔
    var horizontalLineSpacing = gobangBoardRect.height / (Y - 1)
    var verticalLineSpacing = gobangBoardRect.width / (X - 1)
    // 生成横线
    for (var i = 0; i < Y - 2; i++) {
      var horizontalLine = document.createElement('div')
      horizontalLine.style.width = gobangBoardRect.width + 'px'
      horizontalLine.style.height = '0px'
      // horizontalLine.style.borderTop = '1px solid #000'
      horizontalLine.style.outline = '0.5px solid #000'
      horizontalLine.style.position = 'absolute'
      horizontalLine.style.left = '0'
      horizontalLine.style.top = (i + 1) * horizontalLineSpacing + 'px'
      gobangBoard.appendChild(horizontalLine)
    }
    // 生成纵线
    for (var i = 0; i < X - 2; i++) {
      var verticalLine = document.createElement('div')
      verticalLine.style.height = gobangBoardRect.height + 'px'
      verticalLine.style.width = '0px'
      // verticalLine.style.borderLeft = '1px solid #000'
      verticalLine.style.outline = '0.5px solid #000'
      verticalLine.style.position = 'absolute'
      verticalLine.style.top = '0'
      verticalLine.style.left = (i + 1) * verticalLineSpacing + 'px'
      gobangBoard.appendChild(verticalLine)
    }
  }
  // 定义初始化棋局坐标点位与占领状态数组的函数
  function initGamePositions() {
    gamePositions = []
    for (var i = 0; i < X * Y; i++) {
      var col = i % X
      var row = Math.floor(i / X)
      gamePositions.push({
        occupier: null,
        position: { x: col * (gobangBoardRect.width / (X - 1)), y: row * (gobangBoardRect.height / (Y - 1)) },
        x: col,
        y: row
      })
    }
  }
  // 定义初始化结果检测对象函数
  function initGamePositionsCollections() {
    gamePositionsCollections = {
      horizontalCollections: [],
      verticalCollections: [],
      forwardSlashCollections: [],
      backSlashCollections: []
    }
    if (gamePositions.length === 0) {
      return
    }
    // 横向
    for (var i = 0; i < Y; i++) {
      var horizontalGamePositions = []
      for (var j = 0; j < X; j++) {
        horizontalGamePositions.push(gamePositions[i * X + j])
      }
      gamePositionsCollections.horizontalCollections.push(horizontalGamePositions)
    }
    // 纵向
    for (var i = 0; i < X; i++) {
      var verticalGamePositions = []
      for (var j = 0; j < Y; j++) {
        verticalGamePositions.push(gamePositions[i + X * j])
      }
      gamePositionsCollections.verticalCollections.push(verticalGamePositions)
    }
    // 正斜向上半
    for (var i = 0; i < X; i++) {
      var forwardSlashGamePositionsUp = []
      for (var j = 0; j <= i && j < Y; j++) {
        forwardSlashGamePositionsUp.push(gamePositions[i + j * (X - 1)])
      }
      gamePositionsCollections.forwardSlashCollections.push(forwardSlashGamePositionsUp)
    }
    // 正斜向下半
    for (var i = X - 1; i > 0; i--) {
      var forwardSlashGamePositionsDown = []
      for (var j = Y - 1; j >= Y - X + i && j >= 0; j--) {
        forwardSlashGamePositionsDown.push(gamePositions[(Y - 1) * X + i - (X - 1) * (Y - 1 - j)])
      }
      gamePositionsCollections.forwardSlashCollections.push(forwardSlashGamePositionsDown)
    }

    // 反斜向上半
    for (var i = X - 1; i >= 0; i--) {
      var backSlashGamePositionsUp = []
      for (var j = 0; j < X - i && j < Y; j++) {
        backSlashGamePositionsUp.push(gamePositions[j * (X + 1) + i])
      }
      gamePositionsCollections.backSlashCollections.push(backSlashGamePositionsUp)
    }
    // 反斜向下半
    for (var i = 0; i < X - 1; i++) {
      var backSlashGamePositionsDown = []
      for (var j = Y - 1; j >= Y - 1 - i && j >= 0; j--) {
        backSlashGamePositionsDown.push(gamePositions[X * (Y - 1) + i - (X + 1) * (Y - 1 - j)])
      }
      gamePositionsCollections.backSlashCollections.push(backSlashGamePositionsDown)
    }
  }

  // 定义根据当前棋局数初始化下一颗棋子颜色和序号函数
  function initNextPiece(game) {
    if (game % 2 !== 0) {
      nextColor = 'black'
    } else {
      nextColor = 'white'
    }
    nextOrder = 1
  }
  // 定义生成棋子函数
  var curPieces = [] // 用来保存已经生成的棋子
  function createPiece(color, order, gamePosition) {
    // 若是没有坐标点位或者坐标已被占领或者当前棋局已结束，直接返回
    if (!gamePosition || gamePosition.occupier || gameOver) {
      return
    }
    var {
      position: { x, y }
    } = gamePosition
    // 定义设置棋子大小函数
    function _setPieceSize(piece) {
      var pieceWidth = (gobangBoardRect.width / (X - 1)) * 0.9
      var pieceHeight = (gobangBoardRect.height / (Y - 1)) * 0.9
      piece.style.width = pieceWidth + 'px'
      piece.style.height = pieceHeight + 'px'
      piece.style.lineHeight = pieceHeight + 'px'
      piece.style.fontSize = pieceWidth * 0.2 + 'px'
    }
    // 定义设置棋子坐标函数
    function _setPiecePosition(piece) {
      piece.style.left = x + 'px'
      piece.style.top = y + 'px'
    }
    // 创建一个棋子
    var piece = document.createElement('div')
    piece.className = 'gobang-' + color
    piece.innerHTML = order
    _setPieceSize(piece)
    _setPiecePosition(piece)
    gobangBoard.append(piece)
    curPieces.push(piece)
    // 将坐标占领
    gamePosition.occupier = piece
    // 更新下一颗棋子的颜色和序号
    nextColor = color === 'black' ? 'white' : 'black'
    nextOrder = order + 1
    // 检测棋局
    var pieces = detectGame()
    if (pieces) {
      for (var i = 0; i < pieces.length; i++) {
        pieces[i].style.boxShadow = '0px 0px 5px 3px red'
      }
      // 显示所有棋子序号
      for (var i = 0; i < curPieces.length; i++) {
        curPieces[i].style.textIndent = '0px'
      }
      // 当前棋局结束
      gameOver = true
      // 显示下一局按钮
      gobangNextGame.style.display = 'block'
    }
  }
  // 定义计算并返回距离给定坐标点最近的棋盘坐标点位对象的函数
  function getNearestGamePosition(x, y) {
    if (x < 0 || y < 0 || x > gobangBoardRect.width || y > gobangBoardRect.height) {
      return false
    }
    // 定义距离数组
    var distances = []
    for (var i = 0; i < gamePositions.length; i++) {
      var distance = (x - gamePositions[i].position.x) ** 2 + (y - gamePositions[i].position.y) ** 2
      distances.push(distance)
    }
    var index = distances.indexOf(Math.min.apply(null, distances))
    return gamePositions[index]
  }
  // 定义根据处理过的棋盘坐标点位数组，返回五连珠对象的函数
  function getGomoku(treatedGamePositions) {
    var max = 0
    var color = 'gobang-black'
    var number = 0
    var pieces = []
    for (var i = 0; i < treatedGamePositions.length; i++) {
      if (!treatedGamePositions[i].occupier) {
        continue
      }
      if (treatedGamePositions[i].occupier.className === color) {
        number++
        pieces.push(treatedGamePositions[i].occupier)
        max = number > max ? number : max
        if (max >= 5) {
          break
        }
      } else {
        number = 1
        pieces = []
        pieces.push(treatedGamePositions[i].occupier)
        color = treatedGamePositions[i].occupier.className
      }
    }
    if (max >= 5) {
      return pieces
    } else {
      return false
    }
  }

  // 定义检测棋局函数
  function detectGame() {
    // 对结果检测对象进行检测
    for (var k in gamePositionsCollections) {
      // Object.hasOwn(gamePositionsCollections, k)
      if (gamePositionsCollections.hasOwnProperty(k)) {
        for (var i = 0; i < gamePositionsCollections[k].length; i++) {
          var gomoku = getGomoku(gamePositionsCollections[k][i])
          if (gomoku) {
            return gomoku
          }
        }
      }
    }
    return false
  }
  init()
})()
