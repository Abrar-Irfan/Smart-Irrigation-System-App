var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('index.html');
const SerialPort = require('serialport');
const {ReadlineParser} = require('@serialport/parser-readline');
const WebSocket = require('ws');
const { parse } = require('path');
const parsers = SerialPort.parsers;
const parser = new ReadlineParser ({delimiter: '\r\n'});

const port = new SerialPort.SerialPort({
    path: 'COM3',
    baudRate:9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
})


port.pipe(parser);
var app = http.createServer(function(req, res){
    res.writeHead(200,{'Content-Type': 'text/html'});
    res.end(index);
})



const wss = new WebSocket.Server({ server: app });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
    });
});

parser.on('data', (data) => {
    console.log(`Received data from port: ${data}`);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

