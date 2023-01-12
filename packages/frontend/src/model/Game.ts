import {WSRequest, WSResponse} from "./Messaging"
import { Game, Player, PlayerType } from "./Platform"

export type GameProps = { userID?: string }

export enum CellValue {
  X = 'X',
  O = 'O',
  EMPTY = 'EMPTY'
}

export interface Cell {
  x: number
  y: number
  value: CellValue
}

export type Board = CellValue[][]

export enum GameActionType {
  INIT,
  PLAY/* ,
  WAIT*/
}

export enum PlayerStatus {
  WAITING,
  PLAYING
}

export interface GameMove {
  gameID: string
  cell: Cell
}

export interface GameWait {
  game: Game
}

export interface GameInit {
  opponentType: PlayerType
}

export interface GameStatus {
  over: boolean
  winner?: Player
}

export interface GameState {
  id: string
  playerOne: Player
  playerTwo: Player
  board: Board
  status: GameStatus
}

export interface GameRequest extends WSRequest {
  type: GameActionType
  action: GameInit | GameMove | GameWait
}

export interface GameResponse extends WSResponse {
  game: GameState
}
