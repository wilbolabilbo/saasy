import * as WebSocket from 'ws'
import { v1 as uuid } from 'uuid'
import { CellValue, GameActionType, GameState, Cell, Board, PlayerStatus, GameRequest, GameMove, GameResponse, GameInit } from '../../frontend/src/model/Game'
import { AiID, SERVER_PORT } from '../../frontend/src/constants/settings'
import {Player, PlayerType, StatusResponse} from '../../frontend/src/model/Platform'

const wss = new WebSocket.Server({ port: SERVER_PORT })
const gameMap: Map<string, GameState> = new Map()
let queue: string[] = []

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message: Buffer) {
    const gameMessage: GameRequest = JSON.parse(message.toString())
    let game: GameState

    switch (gameMessage.type) {
      case GameActionType.INIT:
        queue = queue.filter(id => id !== gameMessage.userID) // can't play yourself
        const init = gameMessage.action as unknown as GameInit
        let playerTwoID

        if (init.opponentType === PlayerType.HUMAN && queue.length > 0) {
          // check queue, return wait if noone available
          playerTwoID = queue.shift()
        } else if (init.opponentType === PlayerType.AI) {
          playerTwoID = AiID
        } else {
          // wait
          queue.push(gameMessage.userID)
          const status: StatusResponse = { userIDs: [gameMessage.userID], status: { player: PlayerStatus.WAITING }}
          wss.clients.forEach((client: any) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(status))
            }
          })
          break
        }
        game = initGame(gameMessage.userID, playerTwoID)
          gameMap.set(game.id!, game)
          const response: GameResponse = { userIDs: [game.playerOne.id, game.playerTwo.id], game }
          
          wss.clients.forEach((client: any) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(response))
            }
          })
        break
      case GameActionType.PLAY:
        const move = (<GameMove>gameMessage.action)
        game = gameMap.get(move.gameID)

        if (game) {
          game.board = getUpdatedBoard(move.cell, game.board!)
          
          if (isWinner(gameMessage.userID, game)) {
            handleWinner(getCurrentPlayer(gameMessage.userID, game), game)
          } else {
            const nextPlayer = getNextPlayer(gameMessage.userID, game)

            if (nextPlayer.id === AiID) {
              const cells = getOpenCells(game.board)
  
              if (cells.length < 1) {
                game.status.over = true // draw
              } else {
                cells[0].value = nextPlayer.marker
                game.board = getUpdatedBoard(cells[0], game.board!)

                if (isWinner(nextPlayer.id, game)) {
                  handleWinner(nextPlayer, game)
                }
              }
            } else {
              game.playerOne.moving = !game.playerOne.moving
              game.playerTwo.moving = !game.playerTwo.moving
            }
          }
          const response: GameResponse = { userIDs: [game.playerOne.id, game.playerTwo.id], game }
          wss.clients.forEach((client: any) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(response))
            }
          })
        }
        break
    }
  })
})

function handleWinner(player: Player, game: GameState) {
  game.status.over = true
  game.status.winner = player
  game.playerOne.moving = false
  game.playerTwo.moving = false
}

function getCurrentPlayer(currentPlayerID: string, game: GameState) {
  return (game.playerOne && game.playerOne.id === currentPlayerID) ? game.playerOne : game.playerTwo
}

function getNextPlayer(currentPlayerID: string, game: GameState) {
  return (game.playerOne && game.playerOne.id === currentPlayerID) ? game.playerTwo : game.playerOne
}

function initGame(playerOneID: string, playerTwoID: string): GameState {
  return {
    id: uuid(),
    playerOne: {
      id: playerOneID,
      marker: CellValue.X,
      moving: true
    },
    playerTwo: {
      id: playerTwoID,
      marker: CellValue.O,
      moving: false
    },
    board: getBoard(),
    status: {
      over: false
    }
  }
}

function isWinner(currentPlayerID: string, game: GameState) {

  const winningCell = getWinningCell(game)

  if (winningCell) {
    const marker = game.playerOne.id === currentPlayerID ? game.playerOne.marker : game.playerTwo.marker
    return winningCell === marker
  }
  return false
}

function getWinningCell(game: GameState): CellValue {

  for (let i = 0; i < 3; i++) {
    if (game.board[i][0] === game.board[i][1] && game.board[i][0] === game.board[i][2]) {
      if (game.board[i][0] !== CellValue.EMPTY) return game.board[i][0]
    }
    if (game.board[0][i] === game.board[1][i] && game.board[0][i] === game.board[2][i]) {
      if (game.board[0][i] !== CellValue.EMPTY) return game.board[0][i]
    }
  }
  if (game.board[0][0] === game.board[1][1] && game.board[0][0] === game.board[2][2]) {
    if (game.board[0][0] !== CellValue.EMPTY) return game.board[0][0]
  }
  if (game.board[0][2] === game.board[1][1] && game.board[0][2] === game.board[2][0]) {
    if (game.board[0][2] !== CellValue.EMPTY) return game.board[0][2]
  }
}

function getBoard() {
  const board: CellValue[][] = []

  for (let i = 0; i < 3; i++) {
    board[i] = []

    for (let ii = 0; ii < 3; ii++) {
      board[i][ii] = CellValue.EMPTY
    }
  }
  return board
}

function getUpdatedBoard(cell: Cell, board: Board) {
  board[cell.x][cell.y] = cell.value
  return board
}

function getOpenCells(board: Board): Cell[] {
  const cells = []

  for (let i = 0; i < board.length; i++) {
    for (let ii = 0; ii < board[i].length; ii++) {
      if (board[i][ii] === CellValue.EMPTY) {
        cells.push({x: i, y: ii, value: CellValue.EMPTY})
      }
    }
  }
  return cells
}
