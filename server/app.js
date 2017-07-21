"use strict";
let express = require("express");
var path = require('path');
var chatApp = require('express')();
chatApp.set('port', process.env.PORT || 50776);
var server = chatApp.listen(chatApp.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
var io = require('socket.io')(server);
let clientListNames = [];
let nameArr = [];
let userEntry = true;
let clientListId = [];

chatApp.use(express.static(__dirname, '/'));
chatApp.use(express.static(__dirname, '/server/'));
chatApp.use(express.static(__dirname + "/..", '/client/'));
chatApp.use(express.static(__dirname + '/node_modules'));

chatApp.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

chatApp.get('/chat', function (req, res) {
    res.redirect('/');
});

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + ":" + month + ":" + year + " " + hour + ":" + min + ":" + sec;

}
io.on('connection', function (socket) {

    if (nameArr.indexOf(socket.handshake.query.userName.slice(0, -2)) > -1) {
        userEntry = false;
    } else {
        userEntry = true;
        clientListNames.push(socket.handshake.query.userName);
        let name = socket.handshake.query.userName;

        io.emit("status", userEntry);
        io.emit("updateSocketList", clientListNames);
        io.emit("addUserToSocketList", socket.handshake.query.userName);
        nameArr.push(socket.handshake.query.userName.slice(0, -2));
        clientListId.push(socket);
       
        socket.on('disconnect', function () {
            let name = socket.handshake.query.userName;
            let userIndex = clientListNames.indexOf(socket.handshake.query.userName);
            if (userIndex !== -1) {
                clientListNames.splice(userIndex, 1);
                io.emit("updateSocketList", clientListNames);
                io.emit("removeUserFromSocketList", name);
            }
        });
        let sendDetail = [];
        socket.on('chatMessageToSocketServer', function (msg, selName, sendTime, func) {
            func("Message Sent!", socket.handshake.query.userName);
            let name = socket.handshake.query.userName;
            let dt = getDateTime();
            sendDetail.push(sendTime);
            io.emit('broadcastToAll_msgSend', sendDetail);
            let sockectObj = { name, msg, dt, selName }
            if (selName === "ALL") {
                io.emit('broadcastToAll_chatMessage', sockectObj);
            } else {
                let index = clientListNames.indexOf(selName);
                clientListId[index].emit('broadcastToAll_chatMessage', sockectObj);
                let senderIndex = clientListNames.indexOf(name);
                clientListId[senderIndex].emit('broadcastToAll_chatMessage', sockectObj);
            }
        });
        let respArr = [];
        let receiveDetail = [];
        socket.on('msgResp', function (msg,receiveTime) {
            respArr.push(msg);
            receiveDetail.push(receiveTime);
            io.emit('broadcastToAll_userResponse', respArr);
            io.emit('broadcastToAll_msgReceive', receiveDetail);
        });

        socket.on('userTyping', function (msg, func) {
            func("Message Sent!", socket.handshake.query.userName);
            let name = socket.handshake.query.userName;
            let sockectObj = { name, msg }
            io.emit('typingBroadcastToAll_chatMessage', sockectObj);
        });

    }

});

//http(function () {
//    console.log('listening on *:50776');
//}).listen(80, "104.40.150.170");

