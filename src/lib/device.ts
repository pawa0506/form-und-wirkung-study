import type { DeviceType } from "../types/study";

export function detectDeviceType(): DeviceType {
  const width = window.innerWidth;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const userAgent = navigator.userAgent.toLowerCase();

  if (/ipad|tablet|kindle|playbook|silk/.test(userAgent) || (coarsePointer && width >= 768)) {
    return "tablet";
  }
  if (/mobi|iphone|android/.test(userAgent) || (coarsePointer && width < 768)) {
    return "mobile";
  }
  return "desktop";
}
