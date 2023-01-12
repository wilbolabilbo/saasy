import { CellValue, PlayerStatus } from "./Game"
import {WSResponse} from "./Messaging"

export enum Game {
  NONE = '',
  TIC_TAC_TOE = 'Tic Tac Toe'
}

export enum PlayerType {
  NONE = '',
  AI = 'AI',
  HUMAN = 'Human'
}

export interface User {
  id: string
  name: string
}

export interface Player extends User {
  marker: CellValue
  moving: boolean
}

export interface Status {
  player: PlayerStatus
}

export interface StatusResponse extends WSResponse {
  status: Status
}



