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
package model

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestUserBeforeCreateAssignsAvatar(t *testing.T) {
	user := &User{}

	require.NoError(t, user.BeforeCreate(nil))
	require.True(t, IsValidUserAvatar(user.Avatar))
}

func TestUserBeforeCreateKeepsValidAvatar(t *testing.T) {
	user := &User{Avatar: "avatar-07"}

	require.NoError(t, user.BeforeCreate(nil))
	require.Equal(t, "avatar-07", user.Avatar)
}

func TestUserBeforeCreateRejectsInvalidAvatar(t *testing.T) {
	user := &User{Avatar: "avatar-invalid"}

	require.Error(t, user.BeforeCreate(nil))
}
