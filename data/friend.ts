export const Friends: Friend[] = [
  {
    title: 'Pincman',
    description: '中年老码农,专注于全栈开发与教学',
    website: 'https://pincman.com',
    avatar: '/img/friend/pincman.png',
  },
]

export type Friend = {
  title: string
  description: string
  website: string
  avatar?: any
}
