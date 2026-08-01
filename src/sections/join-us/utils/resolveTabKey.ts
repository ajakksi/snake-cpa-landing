import i18n from '@i18n/i18n'
import { tabKeys } from '../data/tabKeys'

export type TabKey = (typeof tabKeys)[number]

export function resolveTabKey(title: string | undefined): TabKey | undefined {
  if (!title) return undefined

  if (tabKeys.includes(title as TabKey)) {
    return title as TabKey
  }

  return tabKeys.find((key) => i18n.t(`joinUs:tabs.${key}`) === title)
}
