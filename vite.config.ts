import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
	fmt: {
		tabWidth: 4,
		useTabs: true,
		svelte: true,
		sortTailwindcss: {
			stylesheet: "./src/app.css",
		},
	},
	lint: {
		categories: {
			correctness: "error",
			nursery: "allow",
			pedantic: "allow",
			perf: "warn",
			restriction: "allow",
			style: "allow",
			suspicious: "warn",
		},
		options: {
			typeAware: true,
		},
		rules: {
			"typescript/adjacent-overload-signatures": "error",
			"typescript/no-floating-promises": "allow",
			"unicorn/filename-case": [
				"error",
				{
					cases: {
						kebabCase: true,
						pascalCase: true,
					},
				},
			],
			"unicorn/no-null": "allow",
			"unicorn/number-literal-case": "error",
			"unicorn/require-post-message-target-origin": "allow",
		},
	},
	plugins: [tailwindcss(), sveltekit()],
});
