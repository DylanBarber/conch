/**
 * Simple WebSocket Signaling Server for WebRTC
 * 
 * Run with: node server/signaling-server.js
 * 
 * This server handles:
 * - Room management (join/leave)
 * - User list broadcasting
 * - SDP offer/answer relay
 * - ICE candidate relay
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 5000;
const wss = new WebSocket.Server({ port: PORT });

// Store rooms and their participants
const rooms = new Map(); // roomId -> Map<peerId, { ws, name }>

console.log(`Signaling server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
    let currentRoom = null;
    let peerId = null;
    let peerName = 'Unknown';

    console.log('New connection');

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('Received:', message.type, 'from:', message.from);

            switch (message.type) {
                case 'join':
                    handleJoin(ws, message);
                    break;
                case 'leave':
                    handleLeave();
                    break;
                case 'mute-status':
                case 'video-status':
                    handleStatusUpdate(message);
                    break;
                case 'offer':
                case 'answer':
                case 'ice-candidate':
                    relayMessage(message);
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Connection closed:', peerId);
        handleLeave();
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    function handleJoin(ws, message) {
        const roomId = message.roomId;
        peerId = message.from;
        peerName = message.payload?.name || 'Unknown';
        const isVideoOn = message.payload?.isVideoOn || false;
        const isMuted = message.payload?.isMuted || false;
        currentRoom = roomId;

        // Create room if it doesn't exist
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
        }

        const room = rooms.get(roomId);

        // Get existing users list
        const existingUsers = [];
        room.forEach((user, odPeerid) => {
            existingUsers.push({ 
                id: odPeerid, 
                name: user.name,
                isVideoOn: user.isVideoOn,
                isMuted: user.isMuted
            });
        });

        // Add this user to the room
        room.set(peerId, { ws, name: peerName, isVideoOn, isMuted });

        console.log(`User ${peerName} (${peerId}) joined room ${roomId}. Room size: ${room.size}`);

        // Send existing users to the new user
        ws.send(JSON.stringify({
            type: 'user-list',
            payload: existingUsers
        }));

        // Notify other users about the new user
        broadcast(roomId, {
            type: 'user-joined',
            from: peerId,
            payload: { id: peerId, name: peerName, isVideoOn, isMuted }
        }, peerId);
    }

    function handleStatusUpdate(message) {
        const roomId = message.roomId;
        const fromId = message.from;
        
        if (roomId && rooms.has(roomId)) {
            const room = rooms.get(roomId);
            const user = room.get(fromId);
            
            if (user) {
                if (message.type === 'mute-status') {
                    user.isMuted = message.payload.isMuted;
                } else if (message.type === 'video-status') {
                    user.isVideoOn = message.payload.isVideoOn;
                }
            }
        }
        
        relayMessage(message);
    }

    function handleLeave() {
        if (currentRoom && peerId) {
            const room = rooms.get(currentRoom);
            if (room) {
                room.delete(peerId);
                console.log(`User ${peerName} (${peerId}) left room ${currentRoom}. Room size: ${room.size}`);

                // Notify others
                broadcast(currentRoom, {
                    type: 'user-left',
                    from: peerId
                }, peerId);

                // Clean up empty rooms
                if (room.size === 0) {
                    rooms.delete(currentRoom);
                    console.log(`Room ${currentRoom} deleted (empty)`);
                }
            }
        }
        currentRoom = null;
        peerId = null;
    }

    function relayMessage(message) {
        const targetId = message.to;
        const roomId = message.roomId;

        if (!roomId || !rooms.has(roomId)) {
            return;
        }

        const room = rooms.get(roomId);

        if (targetId) {
            // Send to specific peer
            const targetPeer = room.get(targetId);
            if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
                targetPeer.ws.send(JSON.stringify(message));
            }
        } else {
            // Broadcast to all peers in room except sender
            broadcast(roomId, message, message.from);
        }
    }

    function broadcast(roomId, message, excludePeerId) {
        const room = rooms.get(roomId);
        if (!room) return;

        room.forEach((user, odPeerid) => {
            if (odPeerid !== excludePeerId && user.ws.readyState === WebSocket.OPEN) {
                user.ws.send(JSON.stringify(message));
            }
        });
    }
});

// Handle server shutdown
process.on('SIGINT', () => {
    console.log('Shutting down signaling server...');
    wss.close(() => {
        process.exit(0);
    });
});
