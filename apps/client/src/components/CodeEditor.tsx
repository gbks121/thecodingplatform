import React, { useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { Box, CircularProgress } from '@mui/material';
import { useStore } from '../store';

interface CodeEditorProps {
    yDoc: Y.Doc | null;
    provider: WebsocketProvider | null;
    onEditorMount?: (editor: any, monaco: any) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ yDoc, provider, onEditorMount }) => {
    const { language } = useStore();
    const [editor, setEditor] = React.useState<any>(null);
    const monacoRef = useRef<any>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);

    const handleEditorDidMount: OnMount = (editorInstance, monaco) => {
        setEditor(editorInstance);
        monacoRef.current = monaco;
        if (onEditorMount) onEditorMount(editorInstance, monaco);
    };

    useEffect(() => {
        if (!yDoc || !provider || !editor) return;

        // cleanup old binding
        if (bindingRef.current) {
            bindingRef.current.destroy();
        }

        const yText = yDoc.getText('monaco');
        const model = editor.getModel();

        if (!model) {
            console.error('Debug: No model found for editor');
            return;
        }

        console.log('Debug: Creating new MonacoBinding');
        try {
            // Create new binding
            bindingRef.current = new MonacoBinding(
                yText,
                model,
                new Set([editor]),
                provider.awareness
            );

            // Listen for content changes to update "lastActivity"
            const disposable = editor.onDidChangeModelContent(() => {
                // Only broadcast if THIS user is typing (has focus)
                if (editor.hasTextFocus()) {
                    provider.awareness.setLocalStateField('lastActivity', Date.now());
                }
            });

            console.log('Debug: Binding created successfully');

            // cleanup listener on effect dispose
            // actually we can attach it to the bindingRef or just cleanup here?
            // MonacoBinding doesn't handle this custom field so we must do it manually.
            // We need to return a cleanup function that disposes this listener.
            // However, the outer cleanup function runs when effect dependencies change.
            // Let's store disposable in a ref or simply add it to a cleanup list if we were robust.
            // For now, simpler:
            (bindingRef.current as any)._customDisposable = disposable;

        } catch (err) {
            console.error('Debug: Failed to create binding', err);
        }

        return () => {
            console.log('Debug: Destroying binding');
            (bindingRef.current as any)?._customDisposable?.dispose();
            bindingRef.current?.destroy();
            bindingRef.current = null;
        };
    }, [yDoc, provider, language, editor]); // Re-bind if language changes or editor mounts

    return (
        <Box sx={{ flex: 1, minHeight: 0 }}>
            <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true,
                }}
                onMount={handleEditorDidMount}
                loading={<CircularProgress />}
            />
        </Box>
    );
};
