// Turns an Axios error into a safe, user-friendly message.
const getErrorMessage = (error) => {
  // No response at all: server down, no internet, CORS, or timeout
  if (!error.response) {
    return "Cannot reach the server. Please check your connection and try again.";
  }

  const { status, data } = error.response;
  if ((status === 403 || status === 404) && typeof data?.message === "string") return data.message;
  if (status === 429) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  // 5xx: backend may send raw error.message, so never show it to the user
  if (status >= 500) {
    return "Something went wrong on our side. Please try again later.";
  }

  // 400 messages from your auth controller are written for users, safe to show
  if (status === 400 && typeof data?.message === "string") {
    return data.message;
  }

  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 404) return "Service not found. Please try again later.";

  return "Something went wrong. Please try again.";
};


export default getErrorMessage;