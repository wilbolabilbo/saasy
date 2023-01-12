import { v1 as uuid } from 'uuid'
import { Container, Button, Select, FormControl, InputLabel, MenuItem, SelectChangeEvent, CircularProgress, AppBar, IconButton, Toolbar, Typography } from '@mui/material'
import { Component } from 'react'
import { PlayerStatus } from './model/Game'
import { SERVER_URL } from './constants/settings'
import {Game, Status, StatusResponse} from './model/Platform'
import TicTacToe from './games/TicTacToe'
import MenuIcon from '@mui/icons-material/Menu'

export interface PlatformState {
  selectedGame: Game
  status?: Status
}

class Platform extends Component {
  state: PlatformState = {
    selectedGame: Game.NONE
  }
  userID = uuid()
  ws = new WebSocket(SERVER_URL)

  componentDidMount() {
    this.ws.onopen = () => {}

    this.ws.onmessage = async evt => {
      this.onReceiveMessage(JSON.parse(evt.data), this.userID)
    }

    this.ws.onclose = () => {
      this.setState({
        ws: new WebSocket(SERVER_URL),
      })
    }
  }

  onReceiveMessage = (response: StatusResponse, userID: string) => {
    if (response.userIDs.includes(userID)) {
      this.setState({ status: response.status })
    }
  }

  handleGameChange(event: SelectChangeEvent<Game>) {
    this.setState({
      selectedGame: event.target.value
    })
  }

  render() {
    return (
      <Container>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Saasy Games
            </Typography>
            <Button color="inherit">Login</Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xs">
          <FormControl fullWidth style={{ margin: '20px 0 10px 0'}}>
            <InputLabel id="demo-simple-select-label">Select Game</InputLabel>
            <Select
              value={this.state.selectedGame}
              label="Select Game"
              onChange={this.handleGameChange.bind(this)}
            >
              {Object.values(Game).map(
                (game: Game) => <MenuItem key={game} value={game}>{game}</MenuItem>
              )}
            </Select>
          </FormControl>
        </Container>
        {this.state.selectedGame === Game.TIC_TAC_TOE &&
          <TicTacToe userID={this.userID}/>
        }
        {this.state.status && this.state.status.player === PlayerStatus.WAITING &&
          <div>
            <CircularProgress style={{ margin: '20px 0 15px 0'}} />
            <div>Waiting for opponent</div>
          </div>
        }
      </Container>
    )
  }
}

export default Platform
