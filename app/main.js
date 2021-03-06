const { app, BrowserWindow, dialog } = require('electron');
const sfdxUtils = require('./shared/sfdxUtils.js');
const ui = require('./shared/ui.js');
const path=require('path');
const fse=require('fs-extra');
const fixPath = require('fix-path'); 
fixPath();

const windows = new Set();

const getHomeDir = exports.getHomeDir = () => {
    return app.getPath('home');
}

const getGUIDir = exports.getGUIDir = () => {
    return path.join(app.getPath('home'), '.cligui');
}

const getDataDir = exports.getDataDir = () => {
    return app.getPath('userData');
}

let hasLocalCommands = exports.hasLocalCommands = false;

let commandFile='./shared/commands';
let personalCommandFile=path.join(getGUIDir(), 'commands.js');
if (fse.existsSync(personalCommandFile)) {
    commandFile=personalCommandFile;
    hasLocalCommands=true;
}

let commands = exports.commands = require(commandFile);
let commandsByName=exports.commandsByName=new Map();
for (let group of commands.groups) {
    for (let command of group.commands) {
        commandsByName.set(command.name, command);
    }
}

let config;
let username;
let devhubusername;

const getConfig = exports.getConfig = () => {
    config=sfdxUtils.getConfig();
    username=config.username;
    devhubusername=config.devhubusername;

    return config;
}

getConfig();

const getUsername = exports.getUsername = () => {
    return username;
}

const getDevhubusername = exports.getDevhubusername = () => {
    return devhubusername;
}

const changeDirectory = exports.changeDirectory = (dir) => {
    process.chdir(dir);
    getConfig();
}

let setupWindow;

const refreshOrgs = exports.refreshOrgs = () => {
    broadcastMessage('Refreshing orgs');
    setupWindow=new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
          }
        }
    );
    setupWindow.webContents.loadURL(`file://${__dirname}/setup.html`);
}

const refreshConfig = exports.refreshConfig = () => {
    getConfig();
    for (window of windows) {
        window.webContents.send('config');
    }
}

const closeSetup = exports.closeSetup = () => {
    setupWindow.destroy();
    setupWindow=null;
}

app.on('ready', () => {
    mainWindow=new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
          }
        }
    );
    let paramDir=process.argv[2];
    if (paramDir!==undefined) {
        changeDirectory(paramDir);
    }
    
        //mainWindow.webContents.openDevTools();
    mainWindow.webContents.loadURL(`file://${__dirname}/home.html`);
    windows.add(mainWindow);
});
  

const createWindow = exports.createWindow = (page, height, width, x, y, params) => {
//    let x, y;
  
    const currentWindow = BrowserWindow.getFocusedWindow();

    if (currentWindow)  {
        const [ currentWindowX, currentWindowY ] = currentWindow.getPosition();
        if (!x) {
            x = currentWindowX + 10;
            y = currentWindowY + 10;
        }
        else {
            x=currentWindowX + x;
            y=currentWindowY + y;
        }
    }

    if (!width) {
        width=1200;
        height=900;
    }

    let newWindow = new BrowserWindow({ x, y, show: false ,
        width: width, 
        height: height,
        webPreferences: {
            nodeIntegration: true
        }});
  
    newWindow.loadURL(`file://${__dirname}/` + page);
  
    newWindow.once('ready-to-show', () => {
      newWindow.show();
      if (params!==undefined) {
          newWindow.webContents.send('params', params);
      }
    });
  
    newWindow.on('close', (event) => {
        windows.delete(newWindow);
        newWindow.destroy();
    });

    windows.add(newWindow);
};

let orgs=null;

const broadcastMessage = exports.broadcastMessage = (msg) => {
    for (window of windows) {
        window.webContents.send('broadcast', msg);
    }
}

const setOrgs = exports.setOrgs = (inOrgs, refresh) => {
    orgs=inOrgs;
    broadcastMessage('Orgs ' + (refresh?'refreshed':'loaded'));
}

const getOrgs = exports.getOrgs = (force) => {
    return orgs;
}
  
const getFileFromUser  = exports.getFileFromUser = (targetWindow, defaultDir) => {
    const files = dialog.showOpenDialogSync(targetWindow, {
      defaultPath: defaultDir,
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });
  
    let chosen='';
    if (files) { 
        chosen=files[0];
    }

    return chosen;
  };
  
  const getDirectoryFromUser  = exports.getDirectoryFromUser = (targetWindow, defaultDir) => {
    const files = dialog.showOpenDialogSync(targetWindow, {
      defaultPath: defaultDir,
      properties: ['openDirectory']
    });
  
    let dir='';
    if (files) { 
        dir=files[0];
    }

    return dir;
  };
  
  