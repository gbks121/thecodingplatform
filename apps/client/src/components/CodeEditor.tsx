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

    // Effect 1: Bind Yjs to Monaco Editor (handles content sync)
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
    }, [yDoc, provider, editor]); // Removed 'language' dependency!

    // Effect 2: Handle Language Updates specifically
    useEffect(() => {
        if (!editor || !monacoRef.current) return;

        const model = editor.getModel();
        if (model) {
            console.log('Debug: Updating model language to', language);
            monacoRef.current.editor.setModelLanguage(model, language);
        }
    }, [language, editor]);

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
