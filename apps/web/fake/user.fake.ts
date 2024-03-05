import Mock from 'mockjs'
// @ts-ignore
import { defineFakeRoute } from 'vite-plugin-fake-server'

export default defineFakeRoute([
  {
    url: '/api/user/list',
    method: 'GET',
    response: () => {
      return Mock.mock({
        id: '@integer(1, 9999)',
        name: '@first',
        email: '@email',
        avatar: '@image("240x240")',
        roleId: '@integer(100, 200)'
      })
    }
  },
  {
    url: '/api/user/genders',
    method: 'GET',
    response: () => {
      // 多层提取模拟
      return Mock.mock({
        ok: true,
        result: {
          data: {
            genders: [
              {
                name: '男',
                id: 1
              },
              {
                name: '女',
                id: 2
              },
            ]
          }
        }
      })
    }
  }
])
