/**
 * Sound FX tổng hợp bằng WebAudio oscillator — không cần file âm thanh,
 * weight 0KB. Mute preference lưu localStorage (khóa 'cb_sound_muted').
 */
type SoundName = 'hover' | 'click' | 'search'

const MUTED_KEY = 'cb_sound_muted'
const HOVER_THROTTLE_MS = 90

let audioContext: AudioContext | null = null
let lastHoverAt = 0

function getContext(): AudioContext | null {
  try {
    if (!audioContext) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      audioContext = new Ctor()
    }
    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }
    return audioContext
  } catch {
    return null
  }
}

function tone(
  ctx: AudioContext,
  type: OscillatorType,
  fromHz: number,
  toHz: number,
  duration: number,
  volume: number,
) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.connect(gain)
  gain.connect(ctx.destination)

  const t = ctx.currentTime
  oscillator.type = type
  oscillator.frequency.setValueAtTime(fromHz, t)
  if (toHz !== fromHz) {
    oscillator.frequency.exponentialRampToValueAtTime(toHz, t + duration * 0.7)
  }
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

  oscillator.start(t)
  oscillator.stop(t + duration + 0.02)
}

export const sound = {
  get muted(): boolean {
    return localStorage.getItem(MUTED_KEY) === '1'
  },

  toggle(): boolean {
    const next = !this.muted
    localStorage.setItem(MUTED_KEY, next ? '1' : '0')
    return next
  },

  play(name: SoundName) {
    if (this.muted) return
    const ctx = getContext()
    if (!ctx) return

    const now = performance.now()
    if (name === 'hover') {
      if (now - lastHoverAt < HOVER_THROTTLE_MS) return
      lastHoverAt = now
      tone(ctx, 'sine', 1400, 1400, 0.06, 0.02) // beep điện tử rất khẽ
    } else if (name === 'click') {
      tone(ctx, 'triangle', 523, 880, 0.18, 0.05) // chime hai tông
    } else if (name === 'search') {
      tone(ctx, 'sawtooth', 320, 960, 0.2, 0.025) // sweep kích hoạt sci-fi
    }
  },
}
