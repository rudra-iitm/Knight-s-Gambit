import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

const WS_URL = 'ws://localhost:8000';

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const {user} = useUser();

    useEffect(() => {
        const ws = new WebSocket(`${` ${WS_URL}?userId=${user?.id ?? ''}`}`);
        ws.onopen = () => {
            console.log('connected');
            setSocket(ws);
        };

        ws.onclose = () => {
            console.log('disconnected');
            setSocket(null);
        };

        return () => {
            ws.close();
        };
    }, [user]);

    return socket;
};