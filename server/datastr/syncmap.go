package datastr

import "sync"

func ToSlice[T any](m *sync.Map) []T {
	result := make([]T, 0)

	m.Range(func(key any, value any) bool {
		converted := value.(T)
		result = append(result, converted)

		return true
	})

	return result
}
