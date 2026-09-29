const STORAGE_KEY_BASE_URL = 'waba_qa_base_url';
const STORAGE_KEY_AUTH_TOKEN = 'waba_qa_auth_token';

const envBackendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3015').replace(/\/+$/, '');
export const DEFAULT_BASE_URL = `${envBackendUrl}/api/v3/taskRunner`;

export function getStoredConfig() {
  const stored = localStorage.getItem(STORAGE_KEY_BASE_URL);
  // Migrate from old default relative path if present
  const baseUrl = (!stored || stored === '/api/v3/taskRunner')
    ? DEFAULT_BASE_URL
    : stored;
  const authToken = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) || '';

  return { baseUrl, authToken };
}

export function saveStoredConfig({ baseUrl, authToken }) {
  if (baseUrl !== undefined) localStorage.setItem(STORAGE_KEY_BASE_URL, baseUrl);
  if (authToken !== undefined) localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, authToken);
}

/**
 * Universal request helper that logs activity
 */
async function executeApiCall({
  endpoint,
  method = 'GET',
  body = null,
  config,
  onLogEntry,
}) {
  const startTime = Date.now();
  const cleanBase = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${cleanBase}${cleanEndpoint}`;

  const headers = {
    'Accept': 'application/json',
  };
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  if (config.authToken && config.authToken.trim()) {
    headers['Authorization'] = config.authToken.trim().startsWith('Bearer ')
      ? config.authToken.trim()
      : `Bearer ${config.authToken.trim()}`;
  }

  try {
    const fetchOptions = {
      method,
      headers,
    };
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, fetchOptions);
    const duration = Date.now() - startTime;

    let responseData;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { rawText: text };
      }
    }

    const logItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint: cleanEndpoint,
      url: fullUrl,
      requestBody: body,
      status: response.status,
      statusText: response.statusText,
      duration,
      response: responseData,
      error: !response.ok || responseData?.error === true,
    };

    if (onLogEntry) onLogEntry(logItem);

    if (!response.ok) {
      const errorMsg =
        responseData?.message ||
        `HTTP ${response.status} ${response.statusText} from ${cleanEndpoint}`;
      const err = new Error(errorMsg);
      err.response = responseData;
      err.status = response.status;
      throw err;
    }

    return responseData;
  } catch (error) {
    const duration = Date.now() - startTime;
    if (!error.status) {
      const logItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        method,
        endpoint: cleanEndpoint,
        url: fullUrl,
        requestBody: body,
        status: 0,
        statusText: 'Network / CORS Error',
        duration,
        response: {
          error: true,
          message: error.message || 'Failed to fetch. Check Base URL, CORS or server status.',
        },
        error: true,
      };
      if (onLogEntry) onLogEntry(logItem);
    }
    throw error;
  }
}

/**
 * 1. Trigger WhatsApp Queue Processor
 * POST /api/v3/taskRunner/triggerWhatsappQueueProcessor
 */
export async function triggerWhatsappQueueProcessor({ config, onLogEntry }) {
  return executeApiCall({
    endpoint: '/triggerWhatsappQueueProcessor',
    method: 'POST',
    body: null,
    config,
    onLogEntry,
  });
}

/**
 * 2. Get WABA Test Users
 * GET /api/v3/taskRunner/getWabaUsers
 */
export async function getWabaUsers({ config, onLogEntry }) {
  return executeApiCall({
    endpoint: '/getWabaUsers',
    method: 'GET',
    body: null,
    config,
    onLogEntry,
  });
}

/**
 * 3. Update User Balance (Ledger Safe)
 * POST /api/v3/taskRunner/updateUserBalance
 * Body: { userId: string, amount: number }
 */
export async function updateUserBalance({ userId, amount, config, onLogEntry }) {
  return executeApiCall({
    endpoint: '/updateUserBalance',
    method: 'POST',
    body: {
      userId,
      amount: Number(amount),
    },
    config,
    onLogEntry,
  });
}
