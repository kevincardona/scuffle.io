import { Component } from 'react'

if (localStorage.getItem('soundEnabled') == undefined) {
  localStorage.setItem('soundEnabled', true)
}
let soundEnabled = localStorage.getItem('soundEnabled')

const enabled = () => {
  return soundEnabled
}

const toggle = (soundBool) => {
  if (soundBool != null) {
    soundEnabled = soundBool
  } else {
    soundEnabled = !soundEnabled
  }
  localStorage.setItem('soundEnabled', soundEnabled)
}

const play = (soundFile, volume = 0.3, delay = 0) => {
  const sound = new Audio(soundFile)
  sound.volume = volume
  setTimeout(() => {
    sound.play();
  }, delay)
}

export default {
  play: play,
  toggle: toggle,
  enabled: enabled
}