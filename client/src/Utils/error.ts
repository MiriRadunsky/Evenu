import axios from "axios";

export function getErrorMessage(error: unknown, fallback = "אירעה שגיאה") {
  // קודם כל – AxiosError עם response
  if (
    axios.isAxiosError(error) &&
    error.response?.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  ) {
    const data = error.response.data as { message?: string };
    if (data.message) return data.message;
  }

  // במקרה כללי של אובייקט עם response (בלי axios.isAxiosError)
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const maybeAxiosError = error as {
      response?: { data?: { message?: string } };
    };
    if (maybeAxiosError.response?.data?.message) {
      return maybeAxiosError.response.data.message;
    }
  }

  // אם השגיאה היא string
  if (typeof error === "string") {
    return error;
  }

  // שגיאה רגילה
  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
