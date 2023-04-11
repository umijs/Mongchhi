import { request } from 'alita';

export async function query(): Promise<any> {
  return request('/api/hello', { method: 'POST' });
}

export async function call(params: any): Promise<any> {
  // socket.send({
  //   type: 'call',
  //   payload: {
  //     type: 'simple-hi',
  //   },
  // });
  return request('/__mongchhi/socket', {
    method: 'POST',
    data: params,
  });
}
