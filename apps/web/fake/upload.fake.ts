import Mock from 'mockjs'
// @ts-ignore
import { defineFakeRoute } from 'vite-plugin-fake-server'

export default defineFakeRoute([
  {
    url: '/api/file/upload',
    method: 'POST',
    response: () => {
      const imageWH = Mock.mock('@integer(100, 1000)x@integer(100, 1000)')
      return Mock.mock({
        ok: true,
        result: {
          data: {
            id: 'file-@integer(100000, 999999)',
            url: `@image('${imageWH}', '@color', '@color', '@first')`
          }
        }
      })
    }
  }
])
