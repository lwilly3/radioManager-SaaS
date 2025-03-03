
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
}

/**
 * Check if a JWT token is expired
 * @param token - The JWT token to check
 * @returns true if the token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true; // Consider token expired if it can't be decoded
  }
};
