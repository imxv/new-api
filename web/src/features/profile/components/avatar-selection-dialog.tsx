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
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Dialog } from '@/components/dialog'
import { UserAvatar } from '@/components/user-avatar'
import { USER_AVATARS } from '@/lib/user-avatar'

import { updateUserProfile } from '../api'
import type { UserProfile } from '../types'

interface AvatarSelectionDialogProps {
  profile: UserProfile
  trigger: ReactElement
  onProfileUpdate: () => void | Promise<void>
}

export function AvatarSelectionDialog(props: AvatarSelectionDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const selectedAvatar = pendingAvatar || props.profile.avatar || ''

  const handleOpenChange = (nextOpen: boolean) => {
    if (saving) return
    setOpen(nextOpen)
    if (!nextOpen) setPendingAvatar(null)
  }

  const handleSelect = async (avatar: string) => {
    if (saving || avatar === props.profile.avatar) return

    setPendingAvatar(avatar)
    setSaving(true)
    try {
      const response = await updateUserProfile({ avatar })
      if (!response.success) throw new Error(response.message)

      await props.onProfileUpdate()
      setOpen(false)
      setPendingAvatar(null)
      toast.success(t('Avatar updated successfully'))
    } catch {
      setPendingAvatar(null)
      toast.error(t('Failed to update avatar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t('Choose your avatar')}
      description={t('Select an avatar that represents you')}
      trigger={props.trigger}
      contentClassName='sm:max-w-lg'
      bodyClassName='py-1'
    >
      <div className='flex flex-wrap justify-center gap-3'>
        {USER_AVATARS.map((avatar) => {
          const isSelected = selectedAvatar === avatar.id

          return (
            <button
              key={avatar.id}
              type='button'
              aria-label={t('Select avatar {{number}}', {
                number: avatar.id.slice(-2),
              })}
              aria-pressed={isSelected}
              disabled={saving}
              onClick={() => handleSelect(avatar.id)}
              className='group focus-visible:ring-ring relative size-16 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60'
            >
              <UserAvatar
                avatar={avatar.id}
                name={avatar.id}
                className='size-full rounded-full transition-transform duration-150 group-hover:scale-105'
              />
              {isSelected && (
                <span className='bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full ring-2'>
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    size={14}
                    strokeWidth={2.5}
                    aria-hidden='true'
                  />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </Dialog>
  )
}
