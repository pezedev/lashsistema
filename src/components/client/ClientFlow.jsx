import { useEffect } from 'react'
import { useBooking } from '../../context/BookingContext'
import ClientHome from './ClientHome'
import T3_ServiceSelection from './T3_ServiceSelection'
import T4_Calendar from './T4_Calendar'
import T5_Review from './T5_Review'
import T6_Confirmation from './T6_Confirmation'
import T7_Error from './T7_Error'
import ClientHistory from './ClientHistory'
import ClientProfile from './ClientProfile'

export default function ClientFlow({ clientName, clientPhone, onLogout }) {
  const {
    step,
    booking,
    bookingError,
    updateBooking,
    nextStep,
    prevStep,
    resetBooking,
    goToStep,
  } = useBooking()

  useEffect(() => {
    if (booking.name !== clientName || booking.phone !== clientPhone) {
      updateBooking({ name: clientName, phone: clientPhone || '' })
    }
  }, [])

  const handleBack = () => {
    if (step > 3) prevStep()
  }

  const handleNewBooking = () => {
    resetBooking()
    goToStep(2)
  }

  const handleExit = () => {
    resetBooking()
    onLogout()
  }

  const handleStartBooking = () => {
    updateBooking({ name: clientName, phone: clientPhone || '' })
    goToStep(3)
  }

  const handleViewHistory = () => {
    goToStep(8)
  }

  const handleViewProfile = () => {
    goToStep(9)
  }

  const wrapper = (content) => (
    <div className="min-h-dvh bg-cream">
      {step > 2 && step < 8 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleExit}
            className="text-xs text-warm-gray-light hover:text-graphite transition-colors px-3 py-1.5"
          >
            Sair
          </button>
        </div>
      )}
      {content}
    </div>
  )

  switch (step) {
    case 1:
      return (
        <ClientHome
          clientName={clientName}
          onNewBooking={handleStartBooking}
          onViewHistory={handleViewHistory}
          onViewProfile={handleViewProfile}
          onExit={handleExit}
        />
      )
    case 3:
      return wrapper(
        <T3_ServiceSelection
          booking={booking}
          onUpdate={updateBooking}
          onNext={nextStep}
          onBack={() => goToStep(1)}
        />
      )
    case 4:
      return wrapper(
        <T4_Calendar
          booking={booking}
          onUpdate={updateBooking}
          onNext={nextStep}
          onBack={handleBack}
        />
      )
    case 5:
      return wrapper(<T5_Review onBack={handleBack} />)
    case 6:
      return <T6_Confirmation onViewHistory={handleViewHistory} onExit={handleExit} />
    case 7:
      return wrapper(
        <T7_Error
          error={bookingError}
          onGoBack={() => goToStep(4)}
        />
      )
    case 8:
      return (
        <ClientHistory
          clientName={clientName}
          onBack={() => goToStep(1)}
          onExit={handleExit}
        />
      )
    case 9:
      return (
        <ClientProfile
          clientName={clientName}
          onBack={() => goToStep(1)}
          onExit={handleExit}
        />
      )
    default:
      return (
        <ClientHome
          clientName={clientName}
          onNewBooking={handleStartBooking}
          onViewHistory={handleViewHistory}
          onViewProfile={handleViewProfile}
          onExit={handleExit}
        />
      )
  }
}
