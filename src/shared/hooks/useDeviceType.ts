import { useEffect, useState } from 'react'

type DeviceType = 'mobile' | 'tablet' | 'desktop'

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const

const detectDeviceType = (): DeviceType => {
  const width = window.innerWidth

  if (width < BREAKPOINTS.mobile) {
    return 'mobile'
  } else if (width < BREAKPOINTS.tablet) {
    return 'tablet'
  }

  const isTouchDevice = (): boolean => {
    if (window.matchMedia('(hover: none)').matches) {
      return true
    }
    if (window.matchMedia('(pointer: coarse)').matches) {
      return true
    }

    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    )
  }

  if (isTouchDevice()) {
    return 'tablet'
  }

  return 'desktop'
}

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => detectDeviceType())

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(detectDeviceType())
    }

    const handleOrientationChange = () => {
      setTimeout(() => {
        setDeviceType(detectDeviceType())
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return deviceType
}

export function useIsMobile(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'mobile'
}

export function useIsTablet(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'tablet'
}

export function useIsDesktop(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'desktop'
}

export function getDeviceType(): DeviceType {
  const width = window.innerWidth

  if (width < BREAKPOINTS.mobile) {
    return 'mobile'
  } else if (width < BREAKPOINTS.tablet) {
    return 'tablet'
  }

  const isTouchDevice = (): boolean => {
    if (window.matchMedia('(hover: none)').matches) return true
    if (window.matchMedia('(pointer: coarse)').matches) return true
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    )
  }

  return isTouchDevice() ? 'tablet' : 'desktop'
}
