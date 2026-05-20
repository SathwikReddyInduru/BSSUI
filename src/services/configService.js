let cachedConfigPromise;

export async function loadConfig() {
    if (cachedConfigPromise) return cachedConfigPromise;

    cachedConfigPromise = fetchConfig();
    return cachedConfigPromise;
}

async function fetchConfig() {
    const response = await fetch(`${import.meta.env.BASE_URL}config/config.json`);

    if (!response.ok) {
        throw new Error(`Failed to load config (${response.status})`);
    }

    return response.json();
}
