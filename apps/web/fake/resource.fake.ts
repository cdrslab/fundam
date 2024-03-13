import Mock from 'mockjs'
// @ts-ignore
import { defineFakeRoute } from 'vite-plugin-fake-server'

export default defineFakeRoute([
  {
    url: '/api/resource/period',
    method: 'GET',
    response: () => {
      const imageWH = Mock.mock('@integer(100, 1000)x@integer(100, 1000)')
      return Mock.mock({
        ok: true,
        "result|1-5": ["2024-0@integer(1,3)-@integer(10,28) 00:00:00至2024-0@integer(4,9)-@integer(10,28) 23:59:59"]
      })
    }
  }
])
