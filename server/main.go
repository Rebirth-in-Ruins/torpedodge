package main

import "fmt"

func main() {
	fmt.Println("hello World!")

	f := "apple"
	// var ff string = "apple"
	fmt.Println(f)

	b, c := backtoback()
	fmt.Println(b)
	fmt.Println(c)
}

func backtoback() (int, int) {
	return 1, 2
}
