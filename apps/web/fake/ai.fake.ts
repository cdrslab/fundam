import Mock from 'mockjs'
// @ts-ignore
import { defineFakeRoute } from 'vite-plugin-fake-server'
import { numRandom } from '../src/utils/fake';

export default defineFakeRoute([
  {
    url: '/api/char/list',
    method: 'GET',
    response: ({ query, body }) => {
      const page = query.page ? parseInt(query.page) : 1 // 当前页码
      const pageSize = query.pageSize ? parseInt(query.pageSize) : 20 // 每页最多条数
      const totalCount = 118 // 总条数，测试固定分页
      const count = numRandom(0, pageSize)
      const {
        id,
        char,
        createId,
        updateId,
        createStart,
        createEnd,
        updateStart,
        updateEnd,
      } = query

      const res = {
        ok: true,
        result: {
          page,
          pageSize,
          total: char ? 1 : (createId || updateId) ? count : totalCount, // 模拟 名称、id 搜索
          list: []
        }
      }

      const curChar = Mock.mock('@cword(1, 1)')
      if (char) {
        res.result.list.push({
          id: numRandom(10000, 9999999),
          char: curChar,
          word: curChar + Mock.mock('@cword(1, 1)'),
          sentence: curChar + Mock.mock('@cword(3, 12)'),
          py: Mock.mock('@name').substring(0, numRandom(2, 3)).toLowerCase(),
          creator: Mock.mock('@cname'),
          updater: Mock.mock('@cname'),
          createTime: Mock.mock('2023-0@integer(2, 3)-@integer(10, 29) @time("HH:mm:ss")'),
          updateTime: Mock.mock('2024-0@integer(2, 7)-@integer(10, 29) @time("HH:mm:ss")'),
        })
        return res
      }

      for (let index = 0; index < pageSize; index++) {
        const currentChar = Mock.mock('@cword(1, 1)')
        res.result.list.push({
          id: numRandom(10000, 9999999),
          char: currentChar,
          word: currentChar + Mock.mock('@cword(1, 1)'),
          sentence: currentChar + Mock.mock('@cword(3, 12)'),
          py: Mock.mock('@name').substring(0, numRandom(2, 3)).toLowerCase(),
          creator: Mock.mock('@cname'),
          updater: Mock.mock('@cname'),
          createTime: Mock.mock('2023-0@integer(2, 3)-@integer(10, 29) @time("HH:mm:ss")'),
          updateTime: Mock.mock('2024-0@integer(2, 7)-@integer(10, 29) @time("HH:mm:ss")'),
        })
      }

      return res
    }
  },
  {
    url: '/api/user/getList',
    method: 'GET',
    response: ({ query, body }) => {
      const {
        name
      } = query

      const res = {
        ok: true,
        result: []
      }

      for (let index = 0; index < 20; index++) {
        res.result.push({
          value: numRandom(10000, 9999999),
          label: Mock.mock('@cword(1, 2)') + (name || '')
        })
      }

      return res
    }
  }
])
