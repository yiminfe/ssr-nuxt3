import { AsyncData, BaseParams, SearchParams } from '../types/fetchType'

function getKey(url: string, method: string, { params, query }: BaseParams) {
  let key = url
  if (method === 'GET') {
    key = url + JSON.stringify(params || query)
  }
  return key
}

function baseFetch(
  url: string,
  method: string,
  { params, query, body }: BaseParams,
  cache: boolean
) {
  const path = `/api${url}`
  return useFetch(path, {
    baseURL: import.meta.env.VITE_APP_API_URL,
    key: getKey(url, method, { params, query }),
    method,
    params,
    query,
    body,
    initialCache: cache,
    async onRequest({ request, options }) {
      console.info('------------------api request start------------------')
      console.info('request:', JSON.stringify(request, null, 4))
      console.info('options:', JSON.stringify(options, null, 4))
    },
    async onRequestError({ request, options, error }) {
      console.error('------------------api request error------------------')
      console.error('request:', JSON.stringify(request, null, 4))
      console.error('options:', JSON.stringify(options, null, 4))
      console.error('error:', JSON.stringify(error, null, 4))
    },
    async onResponse({ request, response, options }) {
      if (response.status === 200) {
        console.info('------------------api request success------------------')
        console.info('request:', JSON.stringify(request, null, 4))
        console.info('options:', JSON.stringify(options, null, 4))
        // console.info('response:', JSON.stringify(response, null, 4))
        return response._data
      }
    },
    async onResponseError({ request, response, options }) {
      if (response.status !== 200) {
        console.error('------------------api response error------------------')
        console.error('status:', response.status)
        console.error('request:', JSON.stringify(request, null, 4))
        console.error('options:', JSON.stringify(options, null, 4))
        console.error('response:', JSON.stringify(response, null, 4))
      }
    }
  })
}

export function getFetch(
  url: string,
  params?: SearchParams
): Promise<AsyncData<any>> {
  return baseFetch(url, 'GET', { params }, true)
}

export function postFetch(
  url: string,
  body?: Record<string, any>
): Promise<AsyncData<any>> {
  return baseFetch(url, 'POST', { body }, false)
}
