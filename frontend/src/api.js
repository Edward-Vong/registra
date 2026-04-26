const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`)
  }

  return payload
}

export async function checkBackendHealth() {
  return apiRequest('/health')
}

export async function createArtwork({ title, artistId, hash }) {
  return apiRequest('/create-artwork', {
    method: 'POST',
    body: JSON.stringify({
      title,
      artist_id: artistId,
      hash,
    }),
  })
}

export async function createCertificate({ artworkId, hash }) {
  return apiRequest('/create-certificate', {
    method: 'POST',
    body: JSON.stringify({
      artwork_id: artworkId,
      hash,
    }),
  })
}

export async function fetchArtworksByArtist(artistId, accessToken) {
  return apiRequest(`/artworks/${encodeURIComponent(artistId)}`, {
    headers: authHeaders(accessToken),
  })
}

export async function verifyArtworkByHash(hash) {
  return apiRequest(`/verify?hash=${encodeURIComponent(hash)}`)
}

export async function fetchRecentVerified() {
  return apiRequest('/recent-verified')
}

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` }
}

export async function fetchSigningKey(accessToken) {
  return apiRequest('/me/signing-key', {
    headers: authHeaders(accessToken),
  })
}

export async function registerSigningKey(publicKeyPem, accessToken) {
  return apiRequest('/me/signing-key', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ public_key_pem: publicKeyPem }),
  })
}

export async function createUploadChallenge(accessToken) {
  return apiRequest('/me/upload-challenge', {
    method: 'POST',
    headers: authHeaders(accessToken),
  })
}

export async function registerWithCert({ file, title, cert, proofType, proofFileName, proofFile, accessToken }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)
  formData.append('cert', JSON.stringify(cert))
  if (proofType) formData.append('proof_type', proofType)
  if (proofFileName) formData.append('proof_file_name', proofFileName)
  if (proofFile) formData.append('proof_file', proofFile)

  const response = await fetch(`${API_BASE_URL}/register-with-cert`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`)
  }

  return payload
}

export async function fetchAdminCertificates(accessToken) {
  return apiRequest('/admin/certificates', {
    headers: authHeaders(accessToken),
  })
}

export async function fetchAdminCertificateDetail(id, accessToken) {
  return apiRequest(`/admin/certificates/${encodeURIComponent(id)}`, {
    headers: authHeaders(accessToken),
  })
}

export async function fetchCertificateDetail(id, accessToken) {
  return apiRequest(`/certificates/${encodeURIComponent(id)}/detail`, {
    headers: authHeaders(accessToken),
  })
}

export async function adminVerifyCertificate(id, accessToken) {
  return apiRequest(`/admin/certificates/${encodeURIComponent(id)}/verify`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  })
}

export async function adminRejectCertificate(id, reason, accessToken) {
  return apiRequest(`/admin/certificates/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ reason }),
  })
}

export async function requestSigningKeyReset(accessToken) {
  return apiRequest('/account/signing-key/reset-request', {
    method: 'POST',
    headers: authHeaders(accessToken),
  })
}

export async function confirmSigningKeyReset(token) {
  return apiRequest('/account/signing-key/reset-confirm', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}
