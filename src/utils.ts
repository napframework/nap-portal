/**
 * Retrieve an authentication ticket for the WebSocket connection
 * @param user The username for generating the authentication ticket
 * @param pass The password for generating the authentication ticket
 * @param url The HTTP endpoint of the NAP application
 * @returns A promise that resolves with the ticket after it has been retrieved
 */
export async function getTicket(user: string, pass: string, url: string): Promise<string> {
  const requestInit: RequestInit = {
    method: 'post',
    body: JSON.stringify({ user, pass }),
    headers: { 'Content-Type': 'application/json' },
  };
  const response: Response = await fetch(url, requestInit);
  if (!response.ok) {
    const error = `${response.url} ${response.status} (${response.statusText})`;
    throw new Error(`NAPWebClient failed to get connection ticket: ${error}`);
  }
  const ticket: string = await response.text();
  return ticket;
}
