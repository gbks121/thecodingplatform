import { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useStore } from "../store";
import { User, Language } from "@thecodingplatform/shared";

const WS_URL = "ws://localhost:3001";

type ConnectionStatus = "connected" | "connecting" | "disconnected";

export const useYjs = (sessionId: string | null, user: User | null) => {
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
    const [isSynced, setIsSynced] = useState(false);
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>("disconnected");
    const { setActiveUsers } = useStore();

    useEffect(() => {
        if (!sessionId || !user) return;

        const doc = new Y.Doc();
        const wsProvider = new WebsocketProvider(WS_URL, sessionId, doc);

        wsProvider.on("status", (event: { status: string }) => {
            console.log("Websocket status:", event.status);
            if (event.status === "connected") {
                setConnectionStatus("connected");
            } else if (event.status === "disconnected") {
                setConnectionStatus("disconnected");
            } else {
                setConnectionStatus("connecting");
            }
        });

        wsProvider.on("sync", (isSynced: boolean) => {
            setIsSynced(isSynced);
        });

        // Shared Meta Map for Session State
        const metaMap = doc.getMap("meta");

        metaMap.observe((event) => {
            if (event.keysChanged.has("language")) {
                const newLang = metaMap.get("language") as Language;
                if (newLang) {
                    useStore.getState().setLanguage(newLang);
                }
            }
        });

        // Initialize local language from shared state if available
        const currentSharedLang = metaMap.get("language") as Language;
        if (currentSharedLang) {
            useStore.getState().setLanguage(currentSharedLang);
        }

        // Awareness
        wsProvider.awareness.setLocalStateField("user", user);

        wsProvider.awareness.on("change", () => {
            const states = wsProvider.awareness.getStates();
            const users: User[] = [];
            states.forEach((state: { user?: User; lastActivity?: number }) => {
                if (state.user) {
                    // Merge extra fields like lastActivity
                    users.push({
                        ...state.user,
                        lastActivity: state.lastActivity,
                    });
                }
            });
            setActiveUsers(users);
        });

        // Use setTimeout to avoid calling setState synchronously in effect
        setTimeout(() => {
            setYDoc(doc);
            setProvider(wsProvider);
        }, 0);

        return () => {
            wsProvider.destroy();
            doc.destroy();
        };
    }, [sessionId, user, setActiveUsers]);

    return { provider, yDoc, isSynced, connectionStatus };
};
