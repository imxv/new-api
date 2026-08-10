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
export const USER_AVATARS = [
  { id: 'avatar-01', file: '01-chiikawa.png' },
  { id: 'avatar-02', file: '02-hachiware.png' },
  { id: 'avatar-03', file: '03-usagi.png' },
  { id: 'avatar-04', file: '04-momonga.png' },
  { id: 'avatar-05', file: '05-rakko.png' },
  { id: 'avatar-06', file: '06-furuhonya.png' },
  { id: 'avatar-07', file: '07-kurimanju.png' },
  { id: 'avatar-08', file: '08-shisa.png' },
  { id: 'avatar-09', file: '09-pouchette.png' },
  { id: 'avatar-10', file: '10-roudou.png' },
  { id: 'avatar-11', file: '11-ramen.png' },
] as const

export function getUserAvatarURL(avatar?: string): string | undefined {
  const item = USER_AVATARS.find((candidate) => candidate.id === avatar)
  return item ? `/avatars/${item.file}` : undefined
}
