/** Presentation only: the wire field remains `fromAddress`. */
export const getSourceIdentifier = (chain?: string, value?: string, addressUrl?: string) => {
  const match = chain === 'zcash' && value?.match(/^box:[0-9a-f]{64}\.(0|[1-9][0-9]*)$/);
  const inputReference = Boolean(match && Number(match[1]) <= 0xffffffff);
  return {
    inputReference,
    label: inputReference ? 'Input reference' : 'From Address',
    description: inputReference
      ? 'Transaction input outpoint (previous transaction ID and output index), not a sender address.'
      : undefined,
    href: inputReference ? undefined : addressUrl,
  };
};
