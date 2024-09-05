package datastr

import "fmt"

func NewGrid[T any](size int) [][]*T {
	result := make([][]*T, size)

	for i := range size {
		result[i] = make([]*T, size)
	}

	return result
}

func PrintGrid[T any](grid [][]*T) {
	result := ""

	for _, row := range grid {
		for _, entry := range row {
			if entry == nil {
				result += "[ ]"
				continue
			}

			result += "[X]"
		}
		result += "\n"
	}

	fmt.Println(result)
}
