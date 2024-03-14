import Mock from 'mockjs'
// @ts-ignore
import { defineFakeRoute } from 'vite-plugin-fake-server'

export default defineFakeRoute([
  {
    url: '/api/resource/period',
    method: 'GET',
    response: () => {
      return Mock.mock({
        ok: true,
        "result|1-5": ["2024-0@integer(1,3)-@integer(10,28) 00:00:00至2024-0@integer(4,9)-@integer(10,28) 23:59:59"]
      })
    }
  },
  {
    url: '/api/resource/tags',
    method: 'GET',
    response: () => {
      return Mock.mock({
        ok: true,
        result: {
          "list|2-5": [{
            id: '@integer(10000, 99999)',
            creator: '@cname',
            name: '@cword(2,5)标签',
          }]
        }
      })
    }
  }
])
