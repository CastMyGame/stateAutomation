const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();

let globalToken = ""
let tokenStatus = false;


function setGlobalToken(token){
    globalToken = token;
    eventEmitter.emit('tokenChange', token); // Emit 'tokenChange' event with the new token

}

function getGlobalToken(){
    return globalToken;
}

function setTokenStatus(status){
    tokenStatus = status;
    eventEmitter.emit('statusChange', status); // Emit 'statusChange' event with the new status

}

function getTokenStatus(){
    return tokenStatus;
}

// Function to listen for global variable changes
function onGlobalChange(callback) {
    eventEmitter.on('tokenChange', (token) => callback('token', token)); // Listen for 'tokenChange' event
    eventEmitter.on('statusChange', (status) => callback('status', status)); // Listen for 'statusChange' event
}



module.exports = {onGlobalChange,setGlobalToken,getGlobalToken,setTokenStatus,getTokenStatus}