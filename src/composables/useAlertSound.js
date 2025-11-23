import { ref, watch } from 'vue'

export function useAlertSound() {
  const isPlaying = ref(false)
  const isMuted = ref(false)
  let audioContext = null
  let oscillator = null
  let gainNode = null
  let intervalId = null

  // Inicializar Web Audio API
  const initAudio = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  // Generar sonido de alerta (sirena)
  const playAlertSound = () => {
    if (isMuted.value || isPlaying.value) return

    initAudio()
    isPlaying.value = true

    // Función para crear un beep
    const createBeep = (frequency, duration) => {
      oscillator = audioContext.createOscillator()
      gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine' // 'sine', 'square', 'sawtooth', 'triangle'

      // Envelope para suavizar el sonido
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    }

    // Patrón de sirena: 800Hz -> 400Hz repetido
    let toggle = true
    intervalId = setInterval(() => {
      createBeep(toggle ? 800 : 400, 0.4)
      toggle = !toggle
    }, 500)
  }

  // Detener sonido
  const stopAlertSound = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    if (oscillator) {
      try {
        oscillator.stop()
      } catch (e) {
        // Ya está detenido
      }
      oscillator = null
    }
    isPlaying.value = false
  }

  // Alternar mute
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (isMuted.value) {
      stopAlertSound()
    }
    // Guardar preferencia
    localStorage.setItem('alertSoundMuted', isMuted.value)
  }

  // Cargar preferencia de mute
  const loadMutePreference = () => {
    const saved = localStorage.getItem('alertSoundMuted')
    if (saved !== null) {
      isMuted.value = saved === 'true'
    }
  }

  // Sonido de notificación suave (opcional)
  const playNotificationSound = () => {
    if (isMuted.value) return

    initAudio()

    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()

    osc.connect(gain)
    gain.connect(audioContext.destination)

    // Tono suave de notificación
    osc.frequency.value = 800
    osc.type = 'sine'

    gain.gain.setValueAtTime(0, audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    osc.start(audioContext.currentTime)
    osc.stop(audioContext.currentTime + 0.2)
  }

  // Limpiar al desmontar
  const cleanup = () => {
    stopAlertSound()
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
  }

  return {
    isPlaying,
    isMuted,
    playAlertSound,
    stopAlertSound,
    toggleMute,
    playNotificationSound,
    loadMutePreference,
    cleanup
  }
}