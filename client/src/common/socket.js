export const getSocketUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl) {
    return apiUrl
      .replace(/^http/, "ws")
      .replace(/\/api\/?$/, "");
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const hostname = window.location.hostname === "localhost"
    ? "127.0.0.1"
    : window.location.hostname || "127.0.0.1";

  return `${protocol}//${hostname}:3003`;
};
