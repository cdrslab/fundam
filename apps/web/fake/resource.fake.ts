import Mock from 'mockjs'
// @ts-ignore
import { defineFakeRoute } from 'vite-plugin-fake-server'
import { numRandom } from '../src/utils/fake';

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
          "list|2-10": [{
            "id|+1": 1,
            creator: '@cname',
            name: '@cword(2,5)标签',
          }]
        }
      })
    }
  },
  {
    url: '/api/resource/type',
    method: 'GET',
    response: () => {
      return Mock.mock({
        ok: true,
        result: [
          {
            title: 'APP',
            code: 'APP',
            sub: [
              {
                title: '启动页',
                code: 'LAUNCH_PAGE'
              },
              {
                title: '频道',
                code: 'CHANNEL'
              },
              {
                title: '轮播图',
                code: 'BANNER'
              }
            ]
          },
          {
            title: 'PC',
            code: 'PC',
            sub: [
              {
                title: '启动页',
                code: 'LAUNCH_PAGE'
              },
              {
                title: '频道',
                code: 'CHANNEL'
              },
              {
                title: '轮播图',
                code: 'BANNER'
              }
            ]
          }
        ]
      })
    }
  },
  {
    url: '/api/resource/list',
    method: 'GET',
    response: ({ query, body }) => {
      const page = query.page ? parseInt(query.page) : 1 // 当前页码
      const pageSize = query.pageSize ? parseInt(query.pageSize) : 20 // 每页最多条数
      const totalCount = 118 // 总条数，测试固定分页
      const count = numRandom(0, pageSize)
      const { id, name } = query

      const res = {
        ok: true,
        result: {
          page,
          pageSize,
          total: id ? 1 : name ? count : totalCount, // 模拟 名称、id 搜索
          list: []
        }
      }

      const randomType = [
        {
          type: ['APP', 'LAUNCH_PAGE'],
          desc: 'APP/启动页'
        },
        {
          type: ['APP', 'CHANNEL'],
          desc: 'APP/频道'
        },
        {
          type: ['APP', 'BANNER'],
          desc: 'APP/轮播图'
        },
        {
          type: ['PC', 'LAUNCH_PAGE'],
          desc: 'PC/启动页'
        },
        {
          type: ['PC', 'CHANNEL'],
          desc: 'PC/频道'
        },
        {
          type: ['PC', 'BANNER'],
          desc: 'PC/轮播图'
        },
      ]

      // 仅搜索出一页的内容
      if ((id || name) && page > 1) return res

      if (id) {
        // 通过ID搜索
        res.result.list.push({
          id: parseInt(id),
          name: Mock.mock('@cword(2, 5)资源位'),
          type: ['APP', 'LAUNCH_PAGE'],
          typeDesc: "APP/启动页",
          time: Mock.mock('2023-@integer(10, 12)-@integer(10, 28) @time("HH:mm:ss") ~ 2024-0@integer(1, 9)-@integer(10, 29) @time("HH:mm:ss")'),
          status: 1,
          statusDesc: '进行中',
          createUser: Mock.mock('@cname'),
          createTime: Mock.mock('2024-0@integer(2, 3)-@integer(10, 29) @time("HH:mm:ss")'),
        })
        return res
      }

      if (name) {
        // 通过名称搜索
        for (let index = 0; index < count; index++) {
          const resType = randomType[numRandom(0, 5)]
          const status = numRandom(1, 4)
          const statusDesc = ['待发布', '未开始', '进行中', '已结束'][status]
          res.result.list.push({
            id: numRandom(10000, 99999),
            name: Mock.mock('@cword(0, 2)') + name + Mock.mock('@cword(0, 2)') + '资源位',
            type: resType.type,
            typeDesc: resType.desc,
            time: Mock.mock('2023-@integer(10, 12)-@integer(10, 28) @time("HH:mm:ss") ~ 2024-0@integer(1, 9)-@integer(10, 29) @time("HH:mm:ss")'),
            status,
            statusDesc,
            createUser: Mock.mock('@cname'),
            createTime: Mock.mock('2024-0@integer(2, 3)-@integer(10, 29) @time("HH:mm:ss")'),
          })
        }
      }

      for (let index = 0; index < pageSize; index++) {
        const resType = randomType[numRandom(0, 5)]
        const status = numRandom(1, 4)
        const statusDesc = ['待发布', '未开始', '进行中', '已结束'][status]

        res.result.list.push({
          id: numRandom(10000, 99999),
          name: Mock.mock('@cword(2, 5)') + '资源位',
          type: resType.type,
          typeDesc: resType.desc,
          time: Mock.mock('2023-@integer(10, 12)-@integer(10, 28) @time("HH:mm:ss") ~ 2024-0@integer(1, 9)-@integer(10, 29) @time("HH:mm:ss")'),
          status,
          statusDesc,
          createUser: Mock.mock('@cname'),
          createTime: Mock.mock('2024-0@integer(2, 3)-@integer(10, 29) @time("HH:mm:ss")'),
        })
      }

      return res
    }
  }
])
