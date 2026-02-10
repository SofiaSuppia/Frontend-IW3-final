import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
    }

    connect(url = null, onConnectCallback) {
        if (this.client && this.client.active) return;

        // Lógica automática para determinar la URL del WebSocket
        let brokerURL = url;
        
        if (!brokerURL) {
            // Si no se pasa URL explícita: calcular basada en el entorno
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // Entorno Local (Desarrollo)
                brokerURL = 'ws://localhost:8080/ws'; 
            } else {
                // Producción: Usar el protocolo WS/WSS relativo al dominio actual
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const host = window.location.host; // Incluye puerto si lo hay
                brokerURL = `${protocol}//${host}/ws`;
            }
        } else {
           // Si viene http/https, convertir a ws/wss
           brokerURL = brokerURL.replace(/^http/, 'ws');
        }

        console.log("Conectando a WS en:", brokerURL);

        this.client = new Client({
            brokerURL: brokerURL,
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
