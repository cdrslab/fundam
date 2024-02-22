const schema = {
  id: 'Page_XJkMI4',
  component: 'Page',
  componentProps: {
    backgroundColor: 'white',
  },
  properties: {
    FormVertical_75Uu02: {
      id: 'FormVertical_75Uu02',
      component: 'FormVertical',
      alias: 'formData',
      name: 'formData',
      type: 'default', // default-正常渲染、view-数据预览、disabled-表单项置灰
      properties: {
        TittleMiddle_MuKa57: {
          id: 'TittleMiddle_MuKa57',
          component: 'TittleMiddle',
          content: '基本信息',
        },
        Input_75Uu03: {
          id: 'Input_75Uu03',
          component: 'Input',
          name: 'resourceName',
          label: '活动名称',
          required: true,
          requiredErrorMessage: '请输入活动名称',
          pattern: /^[A-Za-z0-9一-龥]+$/,
          patternErrorMessage: '支持中文、数字、英文输入，不支持符号',
          placeholder: '1-20个字',
          minLength: 1,
          maxLength: 20,
        },
        Cascader_n5Bq8l: {
          id: 'Cascader_n5Bq8l',
          component: 'Cascader',
          name: 'resourceCode',
          label: '资源位',
          required: true,
          requiredErrorMessage: '请选择资源位',
          placeholder: '请选择',
        },
        TableForm_aykRC1: {
          id: 'TableForm_aykRC1',
          component: 'TableForm',
          name: 'recommends',
          label: '资源位配置',
          required: true,
          requiredErrorMessage: '请将资源位配置填写完整',
          sortable: true, // 开启拖动排序
          allowRemove: true, // 可移除
          allowAdd: true, // 可添加
          removeConfirm: true, // 删除时二次确认
          addButtonContent: '添加推荐词',
          showSerialNumber: true, // 展示序号
          minItems: 1, // 最小1行（仅剩一行的时候，不展示删除按钮）
          maxItems: 8, // 最多8行（已有8行数据时，不展示添加按钮）
          columns: {
            TableFormColumn_XmX70M: {
              id: 'TableFormColumn_XmX70M',
              component: 'TableFormColumn',
              title: '搜索推荐词',
              tooltip: '搜索词',
              properties: {
                Input_XmX71M: {
                  id: 'Input_XmX71M',
                  component: 'Input',
                  name: 'recommend',
                  required: true,
                  requiredErrorMessage: '请输入搜索推荐词，最多8个字',
                  pattern: /^[A-Za-z0-9一-龥]+$/,
                  patternErrorMessage: '支持中文、数字、英文输入，不支持符号',
                  placeholder: '1-8个字',
                  minLength: 1,
                  maxLength: 8,
                },
              },
            },
          },
        },
        FormButtonGroup_75Uu04: {
          id: 'FormButtonGroup_75Uu04',
          component: 'FormButtonGroup',
          properties: {
            FormButton_75Uu05: {
              id: 'FormButton_75Uu05',
              component: 'FormButton',
              type: 'default',
              content: '返回',
              action: 'GO_BACK',
            },
            FormButton_75Uu06: {
              id: 'FormButton_75Uu06',
              component: 'FormButton',
              content: '提交',
              action: 'SUBMIT',
            },
          },
        },
      },
    },
    FormHorizontal_77Uu03: {
      id: 'FormHorizontal_77Uu03',
      component: 'FormVertical',
      alias: 'formData',
      name: 'formData',
      type: 'default', // default-正常渲染、view-数据预览、disabled-表单项置灰
      properties: {
        Input_77Uu03: {
          id: 'Input_77Uu03',
          component: 'Input',
          name: 'resourceName',
          label: '活动名称',
          required: true,
          requiredErrorMessage: '请输入活动名称',
          pattern: /^[A-Za-z0-9一-龥]+$/,
          patternErrorMessage: '支持中文、数字、英文输入，不支持符号',
          placeholder: '1-20个字',
          minLength: 1,
          maxLength: 20,
        },
        FormButtonGroup_77Uu04: {
          id: 'FormButtonGroup_77Uu04',
          component: 'FormButtonGroup',
          properties: {
            FormButton_77Uu05: {
              id: 'FormButton_77Uu05',
              component: 'FormButton',
              type: 'default',
              content: '返回',
              action: 'GO_BACK',
            },
            FormButton_77Uu06: {
              id: 'FormButton_77Uu06',
              component: 'FormButton',
              content: '提交',
              action: 'SUBMIT',
            },
          },
        },
      },
    },
  },
}

// 实现formatSchema方法：递归将schema内部以Form开头的组件下面所有子组件都增加一个formId属性，值为父级的form id（如：FormVertical_75Uu02、FormHorizontal_75Uu03）
// const formatSchema = (schema) => {
// }

const FormComponentNames = ['FormVertical', 'FormHorizontal']

const formatSchema = (schema) => {
  const addFormId = (properties, formId) => {
    Object.values(properties).forEach((component) => {
      if (FormComponentNames.includes(component.component)) {
        formId = component.id;
      }
      component.formId = formId;
      if (component.properties) {
        addFormId(component.properties, formId);
      }
      if (component.columns) {
        addFormId(component.columns, formId);
      }
    });
  };

  if (schema.properties) {
    addFormId(schema.properties, null);
  }

  return schema;
};

const formattedSchema = formatSchema(schema);
console.log(JSON.stringify(formattedSchema, null, 2));

const formValues = {
  formData: {

  }
}
