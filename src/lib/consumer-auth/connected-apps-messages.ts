/** Client-safe. */
/** User-facing reasons for Core connected-app error codes. */
export function connectErrorMessage(code: string | undefined): string {
  switch (code) {
    case "authorization_expired":
      return "The sign-in took too long or was already used. Please try again.";
    case "provider_rejected":
      return "The app didn't accept the sign-in. Please try again.";
    case "provider_error":
      return "The app couldn't be reached. Please try again in a moment.";
    case "client_not_configured":
      return "This app isn't set up for Vox yet.";
    case "access_denied":
      return "You cancelled the sign-in, so nothing was connected.";
    case "not_configured":
      return "Connecting apps isn't available right now.";
    default:
      return "Something went wrong while connecting. Please try again.";
  }
}
