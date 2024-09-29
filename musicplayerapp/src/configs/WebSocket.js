export const wsEndpoints = {
    live: (sessionId) => `/ws/live/${sessionId}/`,
};

const createWebSocketURL = (endpoint, params = {}) => {
    const baseUrl = `${process.env.REACT_APP_WS_URL}${endpoint}`;
    const queryString = new URLSearchParams(params).toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const createWebSocket = (endpointKey, params = {}, ...args) => {
    if (!wsEndpoints[endpointKey]) {
        throw new Error(`Endpoint ${endpointKey} không tồn tại.`);
    }

    const endpoint = wsEndpoints[endpointKey](...args);
    console.info(createWebSocketURL(endpoint, params))
    return new WebSocket(createWebSocketURL(endpoint, params));
};

export default createWebSocket;