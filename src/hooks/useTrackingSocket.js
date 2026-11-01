import { useCallback, useEffect, useRef, useState } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const socketUrl = import.meta.env.VITE_TRACKING_WS_URL
  || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${apiBaseUrl.replace(/\/api$/, '')}/ws`;

const encodeFrame = (command, headers, body = '') => {
  const headerText = Object.entries(headers)
    .map(([key, value]) => `${key}:${String(value).replace(/\n/g, '')}`)
    .join('\n');
  return `${command}\n${headerText}\n\n${body}\0`;
};

const parseFrame = (raw) => {
  const frame = raw.replace(/^\n+/, '');
  const separator = frame.indexOf('\n\n');
  if (separator < 0) return null;
  const lines = frame.slice(0, separator).split('\n');
  const command = lines.shift();
  const headers = Object.fromEntries(lines.map((line) => {
    const index = line.indexOf(':');
    return index < 0 ? [line, ''] : [line.slice(0, index), line.slice(index + 1)];
  }));
  return { command, headers, body: frame.slice(separator + 2).replace(/\0$/, '') };
};

export function useTrackingSocket({ bookingUniqueId, token, onLocation, enabled = true }) {
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const attemptsRef = useRef(0);
  const [connectionState, setConnectionState] = useState(enabled ? 'connecting' : 'disabled');

  useEffect(() => {
    if (!enabled || !bookingUniqueId || !token) {
      setConnectionState('disabled');
      return undefined;
    }

    let disposed = false;
    const connect = () => {
      if (disposed) return;
      setConnectionState(attemptsRef.current ? 'reconnecting' : 'connecting');
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        attemptsRef.current = 0;
        socket.send(encodeFrame('CONNECT', {
          Authorization: `Bearer ${token}`,
          'accept-version': '1.2',
          'heart-beat': '10000,10000'
        }));
      };

      socket.onmessage = (event) => {
        const frame = parseFrame(event.data);
        if (!frame) return;
        if (frame.command === 'CONNECTED') {
          socket.send(encodeFrame('SUBSCRIBE', {
            id: `tracking-${bookingUniqueId}`,
            destination: `/topic/bookings/${bookingUniqueId}/tracking`,
            ack: 'auto'
          }));
          setConnectionState('connected');
        } else if (frame.command === 'MESSAGE' && frame.body) {
          try {
            onLocation(JSON.parse(frame.body));
          } catch {
            // Ignore malformed server events; REST recovery remains authoritative.
          }
        } else if (frame.command === 'ERROR') {
          setConnectionState('error');
        }
      };

      socket.onerror = () => setConnectionState('error');
      socket.onclose = () => {
        if (disposed) return;
        attemptsRef.current += 1;
        const delay = Math.min(30000, 1000 * (2 ** Math.min(attemptsRef.current - 1, 5)));
        reconnectRef.current = window.setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      disposed = true;
      if (reconnectRef.current) window.clearTimeout(reconnectRef.current);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(encodeFrame('DISCONNECT', { receipt: 'tracking-close' }));
        socketRef.current.close();
      }
      socketRef.current = null;
    };
  }, [bookingUniqueId, enabled, onLocation, token]);

  const sendLocation = useCallback((location) => {
    const socket = socketRef.current;
    if (socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(encodeFrame('SEND', {
      destination: '/app/tracking/location',
      'content-type': 'application/json'
    }, JSON.stringify({ bookingUniqueId, ...location })));
    return true;
  }, [bookingUniqueId]);

  return { connectionState, sendLocation };
}
