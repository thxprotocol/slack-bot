export const EMAIL_REGEX =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const SECRET = process.env.SECRET || 'fallbackstring';

export const EMOJI_REGEX = /:[^:\s]*(?:::[^:\s]*)*:/;
