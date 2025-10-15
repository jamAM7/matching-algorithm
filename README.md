Project structure

repo/
├─ matching-service/          # Node backend (API)
│  ├─ server.js
│  ├─ logic.js
│  ├─ package.json
│  └─ data/
│     └─ users.json           # mock users (editable)
└─ matching-demo/             # React frontend
   ├─ src/
   │  ├─ App.js
   │  └─ api.js
   └─ package.json



How to start:

While on vscode, or equivalent IDE, open up a terminal from the root.
Run the following:
    cd matching-service
    npm install
    npm run dev

You should see:
    [nodemon] starting `node server.js`
    Matching service running at http://localhost:4000


Open up another terminal.
Run the following:
    cd matching-demo
    npm install
    npm start

And if it hasnt automatically taken to your web browser, go visit
    http://localhost:3000
in your web browser.

