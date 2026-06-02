export function trackPageView() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  navigator.sendBeacon("/api/analytics", JSON.stringify({ path }));
}
