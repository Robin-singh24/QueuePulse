import logging
from fastapi import WebSocket

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections = []


    async def connect(self, websocket:WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("Websocket client connected!")


    def disconnect(self, websocket:WebSocket):
        self.active_connections.remove(websocket)
        
        logger.warning("WebSocket client disconnected")


    async def broadcast(self, message: dict):
        
        disconnected_clients = []

        for connection in self.active_connections:

            try:
                await connection.send_json(message)
            
            except Exception as e:
                logger.error(f"Error sending message to the client: {str(e)}")
                disconnected_clients.append(connection)

        
        for client in disconnected_clients:
            self.disconnect(client)



manager = ConnectionManager()