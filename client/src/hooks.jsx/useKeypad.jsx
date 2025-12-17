import { useEffect, useRef } from "react";

/**
 * A reusable hook to listen to the Physical Keypad.
 * * @param {Function} onKeyPress - Function to run when a key is pressed.
 * @param {boolean} isEnabled - Pass false to disable listening temporarily.
 */
export const useKeypad = (onKeyPress, isEnabled = true) => {
  // We use a ref for the callback to prevent the useEffect from re-running
  // constantly if the 'onKeyPress' function reference changes.
  const callbackRef = useRef(onKeyPress);

  // Update the ref whenever the passed callback changes
  useEffect(() => {
    callbackRef.current = onKeyPress;
  }, [onKeyPress]);

  useEffect(() => {
    if (!isEnabled) return;

    // Connect to the Python Backend
    const ws = new WebSocket("ws://192.168.43.28:8000/ws/keypad");

    ws.onopen = () => {
      console.log("?? Keypad Connected");
    };

    ws.onmessage = (event) => {
      const key = event.data;
      // Trigger the function passed by the component
      if (callbackRef.current) {
        callbackRef.current(key);
      }
    };

    ws.onclose = () => {
      console.log("?? Keypad Disconnected");
    };

    // Cleanup: Close connection when the component unmounts or isEnabled becomes false
    return () => {
      ws.close();
    };
  }, [isEnabled]); // Only re-run if isEnabled changes
};
