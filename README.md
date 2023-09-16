# BunSocket
BunSocket (or bunSocket) is a nodejs application that connect to a remote device running this same application in server mode with the purpose of running bun on a device that only supports node (for example on termux)
(Do **not** use it with a malicious intent)

## Setup and run
To run this application you need to download it (you may do it however you like, through github or git) and configure it (see below)

Once configured:

  **Client**
  - Put your code in the client/input/**input.js** file
  - Run `npm run client` and look at the server executing the code

  **Server**
  - Run `npm run server` and your server is now running! Clients may execute code now.

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
  - runtime: The application that should be executed in order to execute the supplied code.

  **Running a client**
  ```js
  export let clientConfig = {
    "address": "192.168.178.70:5310",
    "secure": false,
    "time": false
  }
  ```
  This is the important part of the config if you want to run the client
  - address: The address to connect to, that includes the port. (in the format address:port)
  - secure: Whetever the application should connect securely (wss) or insecurely (ws). (Use only if you have SSL/TLS, otherwise it will not work)
  - time: Whetever the server should run `time {runtime}` instead of just the runtime so you know how long the code took to run.
