import { BaseStorage, createStorage, StorageType } from './base';

type ApiKeyStorage = BaseStorage<string> & {
    saveApiKey: (apiKey: string) => Promise<void>;
    getApiKey: () => Promise<string | null>;
};

const apiKeyStorage = createStorage<string>('keepkey-api-key', '', {
    storageType: StorageType.Local, // You can change this to another type if needed
    liveUpdate: true,
});

export const keepKeyApiKeyStorage: ApiKeyStorage = {
    ...apiKeyStorage,
    saveApiKey: async (apiKey: string) => {
        await apiKeyStorage.set(() => apiKey);
    },
    getApiKey: async () => {
        return await apiKeyStorage.get();
    },
};
