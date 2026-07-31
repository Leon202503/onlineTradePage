async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null
  if (!response.ok) throw new Error(data?.message || 'Request failed. Please try again.')
  return data
}

export async function getProducts() {
  const data = await parseResponse(await fetch('/api/getProducts'))
  return Array.isArray(data?.products) ? data.products : []
}

export async function getProduct(productId) {
  const data = await parseResponse(await fetch(`/api/getProduct?id=${encodeURIComponent(productId)}`))
  return data?.product
}

export async function checkLogin() {
  return parseResponse(await fetch('/api/check-login'))
}

async function submitForm(url, values) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(values),
  })
  await parseResponse(response)
}

export function login(values) { return submitForm('/api/login', values) }
export function register(values) { return submitForm('/api/register', values) }

export async function logout() {
  const response = await fetch('/api/logout', { method: 'POST' })
  if (!response.ok) throw new Error('Unable to sign out.')
}

export async function addReview(values) {
  return parseResponse(await fetch('/api/addReview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  }))
}

export async function createOrder(values) {
  return parseResponse(await fetch('/api/createOrder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  }))
}
