import { requestJson, resolveOutboundUrl } from './outbound.js';

function historyForProvider(history) {
  return history.map(message => ({
    role: message.sender === 'agent' ? 'assistant' : 'user',
    content: message.message,
  }));
}

export async function callOpenAICompatible({ endpoint, apiKey, model, systemPrompt, history }) {
  const url = typeof endpoint === 'string'
    ? resolveOutboundUrl(endpoint.replace(/\/+$/, ''), 'chat/completions')
    : null;
  if (!url) return '';

  const out = await requestJson(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyForProvider(history),
      ],
      temperature: 0.7,
      max_tokens: 350,
    },
  });
  if (!out.ok) {
    console.warn(`OpenAI-compatible call failed (${out.status || out.error}), fallback to native engine.`);
    return '';
  }
  const content = out.data?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content : '';
}

export function extractAnthropicReply(data) {
  if (!Array.isArray(data?.content)) return '';
  return data.content
    .filter(block => block?.type === 'text' && typeof block.text === 'string')
    .map(block => block.text)
    .join('\n')
    .trim();
}

export function buildAnthropicRequest({ apiKey, model, systemPrompt, history }) {
  return {
    url: 'https://api.anthropic.com/v1/messages',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: {
      model,
      system: systemPrompt,
      messages: historyForProvider(history),
      max_tokens: 350,
      temperature: 0.7,
    },
  };
}

export async function callAnthropic({ apiKey, model, systemPrompt, history }) {
  const request = buildAnthropicRequest({ apiKey, model, systemPrompt, history });
  const url = resolveOutboundUrl(request.url);
  if (!url) return '';

  const out = await requestJson(url, {
    headers: request.headers,
    body: request.body,
  });
  if (!out.ok) {
    console.warn(`Anthropic call failed (${out.status || out.error}), fallback to native engine.`);
    return '';
  }
  return extractAnthropicReply(out.data);
}
