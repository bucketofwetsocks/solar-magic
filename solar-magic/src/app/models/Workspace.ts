export interface Workspace {
    currentWorkspace: string | undefined,
    integrations: {
        music: {
            path: string
        },
        blocks: {
            path: string;
        }
    }
};
