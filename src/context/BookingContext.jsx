import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../api'

const BookingContext = createContext()

export function BookingProvider({ children }) {
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState({
    name: '',
    phone: '',
    service: null,
    date: null,
    time: null,
  })
  const [bookings, setBookings] = useState([])
  const [blockedSlots, setBlockedSlots] = useState([])
  const [services, setServices] = useState([])
  const [workingHours, setWorkingHours] = useState([])
  const [bookingError, setBookingError] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [b, bl] = await Promise.all([
        api.fetchBookings(),
        api.fetchBlockedSlots(),
      ])
      setBookings(Array.isArray(b) ? b : [])
      setBlockedSlots(Array.isArray(bl) ? bl : [])
    } catch {
    }
  }, [])

  const loadServices = useCallback(async () => {
    try {
      const s = await api.fetchServices()
      setServices(Array.isArray(s) ? s : [])
    } catch {
    }
  }, [])

  const loadWorkingHours = useCallback(async () => {
    try {
      const wh = await api.fetchWorkingHours()
      setWorkingHours(Array.isArray(wh) ? wh : [])
    } catch {
    }
  }, [])

  useEffect(() => {
    loadData()
    loadServices()
    loadWorkingHours()

    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData, loadServices, loadWorkingHours])

  const initializeFromLogin = useCallback(() => {
    setStep(1)
  }, [])

  const updateBooking = useCallback((data) => {
    setBooking((prev) => ({ ...prev, ...data }))
  }, [])

  const goToStep = useCallback((s) => {
    setStep(s)
  }, [])

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 7))
  }, [])

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1))
  }, [])

  const resetBooking = useCallback(() => {
    setBooking({ name: '', phone: '', service: null, date: null, time: null })
    setStep(2)
    setBookingError(null)
  }, [])

  const confirmBooking = useCallback(async () => {
    setLoading(true)
    setBookingError(null)
    try {
      await api.createBooking({
        name: booking.name,
        phone: booking.phone,
        service: booking.service,
        price: booking.service?.price,
        date: booking.date,
        time: booking.time,
      })

      window.dispatchEvent(
        new CustomEvent('cilios-notification', {
          detail: {
            type: 'booking_confirmed',
            whatsapp: booking.phone,
            sms: booking.phone,
            message: `Olá ${booking.name}, seu agendamento na Camille Santos Beauty foi confirmado!\n\nServiço: ${booking.service?.name}\nData: ${booking.date}\nHorário: ${booking.time}\nValor: R$ ${booking.service?.price},00\n\nObrigada! 💕`,
          },
        })
      )

      await loadData()
      setStep(6)
    } catch (err) {
      setBookingError(err.message || 'Erro ao confirmar agendamento.')
      setStep(7)
    } finally {
      setLoading(false)
    }
  }, [booking, loadData])

  const value = {
    step,
    booking,
    bookings,
    blockedSlots,
    services,
    workingHours,
    bookingError,
    loading,
    initializeFromLogin,
    updateBooking,
    goToStep,
    nextStep,
    prevStep,
    resetBooking,
    confirmBooking,
    loadData,
    setBookingError,
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
