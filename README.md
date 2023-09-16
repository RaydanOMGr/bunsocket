# BunSocket
BunSocket (or bunSocket) is a nodejs application that connect to a remote device running this same application in server mode with the purpose of running bun on a device that only supports node (for example on termux or windows)

(Do **not** use it with a malicious intent)

## Setup and run
To run this application you need to download it (you may do it however you like, through github or git) and configure it (see below)
Don't forget to run `npm i` to install npm packages

Once configured:

  **Client**
  - Put your code in the client/input/**input.js** file
  - Run `npm run client` or `npm run nodeClient` and look at the server executing the code
  - If you want to run the client in bun (for some reason) you can run `npm run bunClient`

  **Server**
  - Run `npm run server` or `npm run bunServer` and your server is now running! Clients may execute code now.
  - If you want to run the server in node (for some reason) you can run `npm run nodeServer`. Please notice that doesn't change the runtime (node or bun) which you can change in the config.

## Config
Before running this application you should configure it

 **Running a server**
  ```js
  export let serverConfig = {
    "port": 5310,
    "runtime": "bun"
  }
  ```
  This is the important of the config if you want to run a server
  - port: The port the application will run only.
  - runtime: The application that should be executed in order to execute the supplied code, so bun (recommended) or node.

  **Running a client**
  ```js
  export let clientConfig = {
    "address": "192.168.178.70:5310",
    "inputFile": "input/input.js",
    "secure": false,
    "time": false
  }
  ```
  This is the important part of the config if you want to run the client
  - address: The address to connect to, that includes the port. (in the format address:port)
  - inputFile: The file that contains the code that should be sent and executed on the server.
  - secure: Whetever the application should connect securely (wss) or insecurely (ws). (Use only if you have SSL/TLS, otherwise it will not work)
  - time: Whetever the server should run `time {runtime}` instead of just the runtime so you know how long the code took to run.
