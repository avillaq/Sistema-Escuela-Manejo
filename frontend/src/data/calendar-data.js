// Days of the week
export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Hours from 7am to 6pm
export const HOURS = Array.from({ length: 12 }, (_, i) => i + 7);

// Generate initial time slots
export const generateTimeSlots = () => {
  const slots = [];
  
  DAYS.forEach((day, dayIndex) => {
    // For Sunday (index 6), only generate slots from 7am to 12pm
    const maxHour = dayIndex === 6 ? 12 : 18;
    
    for (let hour = 7; hour < maxHour; hour++) {
      slots.push({
        id: `${dayIndex}-${hour}`,
        day,
        hour,
        reservations: Math.floor(Math.random() * 4)+2, // Random number of existing reservations (0-3)
        maxReservations: 5,
        isAvailable: true
      });
    }
  });
  
  return slots;
};

// Generate initial reservations
export const generateUserReservations = (userId, timeSlots) => {
  // Randomly select 3-5 time slots for the user
  const numReservations = Math.floor(Math.random() * 3) + 3;
  const reservations = [];
  
  // Get available time slots (those with reservations < maxReservations)
  const availableSlots = timeSlots.filter(slot => slot.reservations < slot.maxReservations);
  
  // Randomly select slots
  for (let i = 0; i < numReservations && i < availableSlots.length; i++) {
    const randomIndex = Math.floor(Math.random() * availableSlots.length);
    const slot = availableSlots.splice(randomIndex, 1)[0];
    
    reservations.push({
      id: `res-${userId}-${slot.id}`,
      userId,
      timeSlotId: slot.id,
      createdAt: new Date().toISOString()
    });
  }
  
  return reservations;
};

