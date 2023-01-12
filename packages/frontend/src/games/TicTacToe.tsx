import { Container, TableContainer, Table, TableBody, TableRow, TableCell, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { Component } from 'react'
import { GameState, GameActionType, Cell, CellValue, GameProps, GameRequest, GameResponse } from '../model/Game'
import { SERVER_URL } from '../constants/settings'
import { PlayerType } from '../model/Platform'

interface State {
  game?: GameState,
  selectedOpponentType?: PlayerType.NONE
}

class TicTacToe extends Component<GameProps> {
  state: State = {}
  ws = new WebSocket(SERVER_URL)

  componentDidMount() {
    const { userID } = this.props

    this.ws.onopen = () => {

      if (userID && this.state.selectedOpponentType) {
        const message: GameRequest = { userID, type: GameActionType.INIT, action: { opponentType: this.state.selectedOpponentType } }
        this.ws.send(JSON.stringify(message))
      }
    }

    this.ws.onmessage = async evt => {
      this.onReceiveMove(JSON.parse(evt.data), userID)
    }

    this.ws.onclose = () => {
      this.setState({
        ws: new WebSocket(SERVER_URL),
      })
    }
  }

  onReload = () => {
    console.log('reload')
  }

  onReceiveMove = (response: GameResponse, userID?: string) => {
    if (userID && response.userIDs.includes(userID)) {
      this.setState({ game: response.game })
    }
  }

  onMove = (cell: Cell) => {
    const { userID } = this.props

    if (userID) {
      const message: GameRequest = { userID, type: GameActionType.PLAY, action: { gameID: this.state.game!.id, cell } }
      this.ws.send(JSON.stringify(message))
    }
  }

  getPlayer(game: GameState) {
    const { userID } = this.props
    return game.playerOne.id === userID ? game.playerOne : game.playerTwo
  }

  handleOpponentChange(event: SelectChangeEvent<PlayerType>) {
    const userID = this.props.userID!
    this.setState({
      selectedOpponentType: event.target.value
    }, () => {
      const message: GameRequest = { userID, type: GameActionType.INIT, action: { opponentType: this.state.selectedOpponentType! } }
      this.ws.send(JSON.stringify(message))
    })
  }

  render() {
    const { userID } = this.props
    return (
      <div>
        <Container maxWidth="xs">
          <FormControl fullWidth style={{ margin: '10px 0 10px 0'}}>
            <InputLabel id="demo-simple-select-label">Select Opponent</InputLabel>
            <Select
              value={this.state.selectedOpponentType}
              label="Select Opponent"
              onChange={this.handleOpponentChange.bind(this)}
            >
              {Object.values(PlayerType).map(
                (playerType: PlayerType) => <MenuItem key={playerType} value={playerType}>{playerType}</MenuItem>
              )}
            </Select>
          </FormControl>
        </Container>
        <Container maxWidth="md" style={{ marginTop: '10px' }}>
          <TableContainer>
            <Table
              sx={{
                margin: 'auto',
                borderCollapse: 'collapse',
                width: '500px'
              }}
            >
              <TableBody>
                {this.state.game &&
                  this.state.game.board.map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell: CellValue, ii) => (
                      <TableCell
                        scope="row"
                        key={ii}
                        sx={{
                          border: '4px solid gray',
                          width: '33%',
                          height: '100px',
                          color: cell === CellValue.O ? 'red' : 'green'
                        }}
                        onClick={() => this.getPlayer(this.state.game!).moving && this.onMove({ x: i, y: ii, value: this.getPlayer(this.state.game!).marker })}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '5em'
                          }}
                        >
                          {cell !== CellValue.EMPTY ? cell : ''}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {
            this.state.game && this.getPlayer(this.state.game).moving && <h3 style={{ color: 'red' }}>Your Move</h3>
          }
          {this.state.game && this.state.game.status.over &&
            <div>
              <h3 style={{ color: 'blue' }}>{
                this.state.game.status.winner ? this.state.game.status.winner.id === userID ? 'You won!' : 'You lost :(' : 'Game Over: Draw'}
              </h3>
              <Button onClick={() => this.ws.send(JSON.stringify({ userID, type: GameActionType.INIT, action: { opponentType: this.state.selectedOpponentType } }))}>Play Again?</Button>
            </div>
          }
        </Container>
      </div>
    )
  }
}

export default TicTacToe
