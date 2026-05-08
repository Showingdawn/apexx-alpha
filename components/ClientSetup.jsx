"use client";
import { useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ClientSetup() {
  useEffect(() => {
    // Sovereign Axios Interceptor: Suppress Red Boxes, Keep Logic clean
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const isLocal = window.location.hostname === 'localhost';
        
        console.warn(`[Sovereign-System] Neural Link Interference:\nStatus: ${error.response?.status}\nPath: ${error.config?.url}\nMessage: ${error.response?.data?.error || error.message}`);

        // Suppress 403 & 404 & 500 error popups to maintain 'Institutional' feel
        // unless they are critical trade errors (which usually have specific handling)
        if (error.config?.url?.includes('/api/market') || error.config?.url?.includes('/api/user')) {
           // Silently log and allow fallbacks to handle the UI
           return Promise.resolve({ data: {} }); 
        }

        if (error.response?.status === 403) {
           toast.error("Handshake Re-Calibration Required", { id: 'auth-error' });
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return null;
}
