import Mock from 'mockjs'
// @ts-ignore
import { defineFakeRoute } from 'vite-plugin-fake-server'

export default defineFakeRoute([
  {
    url: '/api/location/list',
    method: 'GET',
    response: () => {
      return Mock.mock({
        ok: true,
        result: {
          location: [
            {
              code: '510100',
              name: '成都',
              districts: [
                {
                  code: '510104',
                  name: '锦江区'
                },
                {
                  code: '510105',
                  name: '青羊区'
                },
                {
                  code: '510106',
                  name: '金牛区'
                },
                {
                  code: '510107',
                  name: '武侯区'
                },
                {
                  code: '510108',
                  name: '成华区',
                  districts: [
                    {
                      code: '51010801',
                      name: '二仙桥'
                    },
                    {
                      code: '51010802',
                      name: '成华大道'
                    },
                  ]
                },
                {
                  code: '510109',
                  name: '龙泉驿区'
                },
                {
                  code: '510110',
                  name: '青白江区'
                },
                {
                  code: '510111',
                  name: '新都区'
                },
                {
                  code: '510112',
                  name: '温江区'
                },
                {
                  code: '510113',
                  name: '双流区'
                },
              ]
            },
            {
              code: '510300',
              name: '自贡',
              districts: [
                {
                  code: '510302',
                  name: '自流井区'
                },
                {
                  code: '510303',
                  name: '贡井区'
                },
                {
                  code: '510304',
                  name: '大安区'
                },
              ]
            },
            {
              code: '510400',
              name: '攀枝花',
              districts: [
                {
                  code: '510402',
                  name: '东区'
                },
                {
                  code: '510403',
                  name: '西区'
                },
              ]
            }
          ]
        }
      })
    }
  }
])