export const logEvent = (event: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[VideoChat][${timestamp}] ${event}`, data ? data : '');
};
