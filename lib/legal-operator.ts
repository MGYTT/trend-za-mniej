/**
 * Identity is published from deployment environment, not from source control.
 * For a natural person providing online services the identification duties
 * under art. 5 of the Polish Act on Electronic Services still apply.
 */
export const LEGAL_OPERATOR_NAME =
  process.env.LEGAL_OPERATOR_NAME?.trim() ||
  process.env.NEXT_PUBLIC_LEGAL_NAME?.trim() ||
  "";

export const LEGAL_OPERATOR_ADDRESS =
  process.env.LEGAL_OPERATOR_ADDRESS?.trim() || "";

export const LEGAL_IDENTITY_COMPLETE =
  Boolean(LEGAL_OPERATOR_NAME && LEGAL_OPERATOR_ADDRESS);
