const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`OGN Proxy Server started on port ${PORT}`);

wss.on('connection', (ws) => {
    console.log('Client connected to proxy');

    // 本物の OGN APRS サーバー (ポート 14580) へ接続
    const ognSocket = net.connect(14580, 'aprs.glidernet.org', () => {
        console.log('Connected to OGN APRS Server');
        // 妻沼滑空場周辺 (50km以内) のフィルター要求
        ognSocket.write("user MenumaWeb pass -1 filter r/36.21/139.41/50\r\n");
    });

    // OGNからデータが届いたら、そのままブラウザ(GitHub Pages)へ送信
    ognSocket.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        ognSocket.end();
    });

    ognSocket.on('error', (err) => {
        console.error('OGN Socket error:', err);
        ws.close();
    });
});
