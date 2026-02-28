const isCSSUnit = (input: string): boolean => {
	const option = new Option();

	option.style.width = input;

	return option.style.width !== '';
};

export const toCSSUnit = (key: string, input?: number | string): string | undefined => {
	if (typeof input === 'string' && isCSSUnit(input)) {
		return input;
	}

	if (typeof input === 'number' || (typeof input === 'string' && !Number.isNaN(Number(input)))) {
		return `calc(var(--rosen-spacing, 1px) * ${input})`;
	}
	
	return `var(--rosen-${key}-${input})`;
};
