import config from "@antfu/eslint-config";
import prettier from "eslint-config-prettier";

export default config({
	stylistic: false,
	svelte: true,
}).append(prettier);
