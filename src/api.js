const API = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Basic ${token}`

  const res = await fetch(`${API}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Erro ao comunicar com o servidor.')
  }
  return data
}

export async function fetchServices() {
  return request('/services')
}

export async function createBooking(booking) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  })
}

export async function fetchBookings(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/bookings${query ? `?${query}` : ''}`)
}

export async function fetchWeekBookings() {
  return request('/bookings/week')
}

export async function cancelBooking(id) {
  return request(`/bookings/${id}/cancel`, { method: 'POST' })
}

export async function fetchClientBookings(name) {
  return request(`/bookings/client?name=${encodeURIComponent(name)}`)
}

export async function clientCancelBooking(id, name) {
  return request(`/bookings/${id}/client-cancel`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function rescheduleBooking(id, date, time) {
  return request(`/bookings/${id}/reschedule`, {
    method: 'POST',
    body: JSON.stringify({ date, time }),
  })
}

export async function fetchBlockedSlots(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/blocked${query ? `?${query}` : ''}`)
}

export async function blockSlot(date, time) {
  return request('/blocked', {
    method: 'POST',
    body: JSON.stringify({ date, time }),
  })
}

export async function blockSlotRange(date, times) {
  return request('/blocked/range', {
    method: 'POST',
    body: JSON.stringify({ date, times }),
  })
}

export async function unblockSlot(date, time) {
  return request('/blocked', {
    method: 'DELETE',
    body: JSON.stringify({ date, time }),
  })
}

export async function loginUser(username, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  localStorage.setItem('admin_token', data.token)
  return data
}

export async function registerClient(name, phone, email, password) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, phone, email, password }),
  })
  localStorage.setItem('admin_token', data.token)
  return data
}

export async function fetchClientByName(name) {
  return request(`/clients/by-name/${encodeURIComponent(name)}`)
}

export async function updateClient(id, data) {
  return request(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function uploadClientPhoto(id, file) {
  const token = localStorage.getItem('admin_token')
  const headers = {}
  if (token) headers['Authorization'] = `Basic ${token}`

  const formData = new FormData()
  formData.append('photo', file)

  const res = await fetch(`${API}/clients/${id}/photo`, {
    method: 'PUT',
    headers,
    body: formData,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao enviar foto.')
  return data
}

export function logoutAdmin() {
  localStorage.removeItem('admin_token')
}

export async function completeBooking(id) {
  return request(`/bookings/${id}/complete`, { method: 'POST' })
}

export async function deleteClient(id) {
  const token = localStorage.getItem('admin_token')
  const headers = {}
  if (token) headers['Authorization'] = `Basic ${token}`

  const res = await fetch(`${API}/clients/${id}`, {
    method: 'DELETE',
    headers,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao excluir conta.')
  return data
}

export async function fetchWorkingHours() {
  return request('/working-hours')
}

export async function saveWorkingHour(day_of_week, open_time, close_time, is_off) {
  return request('/working-hours', {
    method: 'POST',
    body: JSON.stringify({ day_of_week, open_time, close_time, is_off }),
  })
}
