import { v1 as uuid } from 'uuid'
import { Container, Button, Select, FormControl, InputLabel, MenuItem, SelectChangeEvent, CircularProgress, AppBar, IconButton, Toolbar, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material'
import { Component } from 'react'
import { PlayerStatus } from './model/Game'
import { SERVER_URL } from './constants/settings'
import {Game, Status, StatusResponse} from './model/Platform'
import TicTacToe from './games/TicTacToe'
import MenuIcon from '@mui/icons-material/Menu'
import {AccountCircle} from '@mui/icons-material'

export interface PlatformState {
  selectedGame: Game
  status?: Status
  userID: string
  userName: string
  updatingUserName: boolean
}

class Platform extends Component {
  state: PlatformState = {
    selectedGame: Game.NONE,
    userID: uuid(),
    userName: '',
    updatingUserName: false
  }
  ws = new WebSocket(SERVER_URL)

  componentDidMount() {
    this.ws.onopen = () => {}

    this.ws.onmessage = async evt => {
      this.onReceiveMessage(JSON.parse(evt.data), this.state.userID)
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

  handleUserDiaglogOpen() {
    this.setState({
      updatingUserName: true
    })
  }

  handleUserDiaglogClose() {
    this.setState({
      updatingUserName: false
    })
  }

  handleUserNameChange(event: any) {
    this.setState({
      userName: event.target.value
    })
  }

  render() {
    return (
      <Container>
        <Dialog open={this.state.updatingUserName} onClose={this.handleUserDiaglogClose.bind(this)}>
          <DialogTitle>Username</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter a username to identify you to other players
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Username"
              fullWidth
              variant="standard"
              value={this.state.userName}
              onChange={this.handleUserNameChange.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleUserDiaglogClose.bind(this)}>Close</Button>
          </DialogActions>
        </Dialog>
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
            { this.state.userName.length < 1 ? (
                <Button onClick={this.handleUserDiaglogOpen.bind(this)} color="inherit"><span>Login</span></Button>
              ) : (
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={this.handleUserDiaglogOpen.bind(this)}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              )
            }
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
          <TicTacToe userID={this.state.userID} userName={this.state.userName}/>
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
