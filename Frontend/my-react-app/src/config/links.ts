/**
 * Platform Links & Contact Configuration (Single Source of Truth)
 * Values sourced from environment variables with owner profiles as defaults.
 */

export const GITHUB_URL: string =
  (import.meta.env.VITE_GITHUB_URL as string | undefined)?.trim() ||
  'https://github.com/MAYSAMALI3011'

export const LINKEDIN_URL: string =
  (import.meta.env.VITE_LINKEDIN_URL as string | undefined)?.trim() ||
  'https://www.linkedin.com/in/maysam-ali-097935383/'

export const CONTACT_EMAIL: string =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim() ||
  'maysamali032@gmail.com'

export const REPOSITORY_URL: string = GITHUB_URL

export interface SocialLinkItem {
  name: string
  label: string
  url: string
  color: string
}

export const PLATFORM_SOCIAL_LINKS: SocialLinkItem[] = [
  {
    name: 'LinkedIn',
    label: 'Connect with Maysam Ali on LinkedIn (opens in a new tab)',
    url: LINKEDIN_URL,
    color: '#0A66C2',
  },
  {
    name: 'GitHub',
    label: 'Samvidhan on GitHub (opens in a new tab)',
    url: GITHUB_URL,
    color: '#24292E',
  },
]
