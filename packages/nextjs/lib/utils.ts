import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

const BASE37 = "0123456789abcdefghijklmnopqrstuvwxyz-."

export function isBase37(input: String) {
	for (let i = 0; i < input.length; i++) {
		if (!BASE37.includes(input[i])) {
			return false
		}
	}
	return true
}

export function generateFullMeName(input: String) {
	if (isBase37(input)) return input.split(".")[0] + ".me"
	else if (input.indexOf(".") == -1 && input.indexOf(" ") == -1)
		return input + ".me"
	return ""
}

export function base37ToId(input: String) {
	let ans = 0
	for (let i = input.length - 1; i >= 0; i--) {
		ans += (BASE37.indexOf(input[i]) + 1) * Math.pow(37, i)
	}
	return ans
}

export function idToBase37(input: number) {
	let ans = ""
	while (input > 1) {
		ans += BASE37.charAt((input - 1) % 37)
		input /= 37
	}

	return ans
}
