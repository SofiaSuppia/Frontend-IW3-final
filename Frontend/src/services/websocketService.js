import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
    }

    connect(url = 'http://localhost:8080/ws', onConnectCallback) {
        if (this.client && this.client.active) return;

        this.client = new Client({
            brokerURL: url.replace('http', 'ws'), // Auto-convert to ws:// or wss://
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: (frame) => {
                console.log('WS Conectado: ' + frame);
                this.connected = true;
                if (onConnectCallback) onConnectCallback();
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onWebSocketClose: () => {
                console.log('WS Conexión cerrada');
                this.connected = false;
            }
        });

        this.client.activate();
    }

    subscribe(destination, callback) {
        if (!this.client) {
            console.error("Intentando suscribir sin cliente WS inicializado");
            return null;
        }

        // Si ya estamos conectados, suscribimos inmediatamente
        if (this.connected) {
            return this.doSubscribe(destination, callback);
        } else {
            // Si no, esperamos a la conexión (puedes mejorar esto con promesas)
            const checkInterval = setInterval(() => {
                if (this.connected) {
                    clearInterval(checkInterval);
                    this.doSubscribe(destination, callback);
                }
            }, 100);
            return {
                unsubscribe: () => clearInterval(checkInterval) // Fallback simple
            };
        }
    }

    doSubscribe(destination, callback) {
        // Retorna el objeto de suscripción de STOMP
        return this.client.subscribe(destination, (message) => {
            if (message.body) {
                try {
                    const parsedBody = JSON.parse(message.body);
                    callback(parsedBody);
                } catch (e) {
                    console.error("Error parseando JSON de WS", e);
                }
            }
        });
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.connected = false;
        }
    }
}

export const webSocketService = new WebSocketService();
