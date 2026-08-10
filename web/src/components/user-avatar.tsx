/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUserAvatarFallback, getUserAvatarStyle } from '@/lib/avatar'
import { getUserAvatarURL } from '@/lib/user-avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  avatar?: string
  name?: string
  alt?: string
  className?: string
  fallbackClassName?: string
}

export function UserAvatar(props: UserAvatarProps) {
  const name = props.name || 'User'
  const avatarURL = getUserAvatarURL(props.avatar)

  return (
    <Avatar className={cn(avatarURL && 'overflow-hidden', props.className)}>
      {avatarURL && <AvatarImage src={avatarURL} alt={props.alt || name} />}
      <AvatarFallback
        className={cn('font-semibold text-white', props.fallbackClassName)}
        style={getUserAvatarStyle(name)}
      >
        {getUserAvatarFallback(name)}
      </AvatarFallback>
    </Avatar>
  )
}
