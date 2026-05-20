// utils/apiUrlBuilder.js
export function getLoginUrl(config) {
    const { http_or_https, server, port, endpoints } = config.api;

    return `${http_or_https}://${server}:${port.port_1}${endpoints.login_API}`;
}