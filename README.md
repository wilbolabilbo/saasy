# Getting Started

## Welcome to Saasy Games. This project requires NodeJS.
- VSCode -> Terminal -> Split Terminal
- In terminal one, run:
```npm i && npm run build -w saasy-backend && npm run start -w saasy-backend```
- In terminal two, run:
```npm i && npm run start -w saasy-frontend```
- Visit http://localhost:3000/ in a web browser to play AI, or 2 web browsers to play a 2 player game.

## Core components
This project is built on a simple Websocket server that stores all active games in memory, with a React Typescript frontend.  I chose Websockets to facilitate the real-time play, React for fast rendering and reusability, and Typescript for type safety.  Next steps for improving this project will be to add data persistence with MongoDB, authentication, and to secure the web sockets which are accepting and broadcasting all messages over ws:// transport and expecting clients to filter by user ID.  The AI could also use improvement as it's currently just looking for the first open cell.  The code could be organized better for separation of concerns and to make adding new games cleaner.

## TODO: missing requirements
- Users must have unique non-email username (currently distinguished by UUID only)
- Human players wins/losses, moves and move times must be recorded.
- Native authentication must be included (currently just a static 'login' button)
- Win/loss/total played summary display for authenticated users.
- Data should persist

# Attributions
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

