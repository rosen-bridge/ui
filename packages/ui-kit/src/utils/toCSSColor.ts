const isCSSColor = (input: string): boolean => {
	const option = new Option();

	option.style.color = input;

	return option.style.color !== '';
};

export const toCSSColor = (input?: string): string | undefined => {
	if (!input) return;

	if (isCSSColor(input)) return input;

	const key = input
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/[_\s.:]+/g, '-')
		.replace(/-+/g, '-')
		.toLowerCase()
		.replace(/^-+|-+$/g, '');

	return `var(--rosen-color-${key})`;
};
