// Mock
const api = {
  getResourceType: async () => {
    const res = await fetchPost('/resource_publish/resource_manage_b2b/get_resource_type', {
      id: parseInt(this.query.id)
    })
    return res
  }
}
// 手写部分
export default {
  // 初始化方法
  async onMount() {
    // 请求 & 数据转换
    const res = await this.api.getResourceType()
    this.formData = {
      ...res,
      xxEnumValue: res.xxx ? 0 : 1,
    }
    this.component.Input_75Uu03.tooltip = 'xxxx'
  },
  async onUnmount() {

  },

  // this.data
  // this.Text_75Uur1.hidden = true
  // pipeResourceType(data) {
  //   return data
  // }
}
