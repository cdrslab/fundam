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
  },
  {
    url: '/api/location/listById',
    method: 'GET',
    response: ({ query }) => {
      const mockMap = {
        '-1': [
          {
            label: '四川省',
            value: 5000
          },
          {
            label: '浙江省',
            value: 6000
          },
          {
            label: '重庆市',
            value: 7000
          }
        ],
        '5000': [
          {
            label: '成都市',
            value: 5001
          },
          {
            label: '绵阳市',
            value: 5002
          },
        ],
        '6000': [
          {
            label: '杭州市',
            value: 6001
          },
          {
            label: '温州市',
            value: 6002
          },
        ],
        '7000': [
          {
            label: '沙坪坝区',
            value: 7001
          },
          {
            label: '逾中区',
            value: 7002
          }
        ],
        '5001': [
          {
            label: '武侯区',
            value: 50011,
          },
          {
            label: '成华区',
            value: 50012,
          },
        ],
        '5002': [
          {
            label: '涪城区',
            value: 50021,
          }
        ],
        '6001': [
          {
            label: '上城区',
            value: 60011,
          },
          {
            label: '滨江区',
            value: 60012,
          },
        ],
        '6002': [
          {
            label: '鹿城区',
            value: 60021,
          },
          {
            label: '龙湾区',
            value: 60022,
          },
        ]
      }
      return {
        ok: true,
        result: mockMap[query.id]
      }
    }
  }
])
