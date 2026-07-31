import type { ComponentType, SVGProps } from 'react'
import InstagramIcon from '@assets/icons/instagram.svg?react'
import TelegramIcon from '@assets/icons/telegram.svg?react'
import LinkedInIcon from '@assets/icons/linkedin.svg?react'

export type SocialLink = {
  label: string
  href: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const socialLinks: readonly SocialLink[] = [
  {
    label: 'Instagram',
    href: '#',
    Icon: InstagramIcon,
  },
  {
    label: 'Telegram',
    href: '#',
    Icon: TelegramIcon,
  },
  {
    label: 'LinkedIn',
    href: '#',
    Icon: LinkedInIcon,
  },
]
