/* @flow weak */
import axios from 'axios'
import { qs } from './url-helpers'
import config from '../config'

const request = axios.create({
  baseURL: config.baseURL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...(config.isPlatform && {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/vnd.coding.v2+json'
    })
  },
  mode: 'cors',
  withCredentials: true,
  // only applicable for request methods 'PUT', 'POST', and 'PATCH'
  transformRequest: [function (data, headers) {
    switch (headers['Content-Type']) {
      case 'application/json':
        return JSON.stringify(data)
      case 'application/x-www-form-urlencoded':
        return qs.stringify(data)
      default:
        return data
    }
  }]
})

const requestInterceptor = request.interceptors.request.use((options) => {
  if (config.isPlatform && config.spaceKey) {
    options.headers['X-Space-Key'] = config.spaceKey
  }
  return options
})

const responseInterceptor = request.interceptors.response.use((response) => {
  if (config.isPlatform && response.headers['requests-auth'] === '1') {
    const authUrl = response.headers['requests-auth-url']
    return location.href = authUrl
  }
  return response.data
})

request.get = function (url, params, options = {}) {
  return request({
    method: 'get',
    url,
    params,
    ...options,
  })
}

request.upload = function (url, data, options) {
  return request({
    method: 'POST',
    transformRequest: d => d,
    url,
    data,
    ...options,
  })
}

request.delete = function (url, params, options = {}) {
  return request({
    method: 'delete',
    url,
    params,
    ...options,
  })
}

request.diff = function (url, params, options = {}) {
  return request({
    url,
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/vnd.coding.v2.diff+json',
    },
    ...options,
  })
}

request.diffFilesList = function (url, params, options = {}) {
  return request({
    url,
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/vnd.coding.v2.diff-files-list+json',
    },
    ...options,
  })
}

request.raw = function (options) {
  return axios(options)
}

request.axios = axios

export default request
