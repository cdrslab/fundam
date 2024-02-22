const schema = {
  "id": "Page_XJkMI4",
  "component": "Page",
  "componentProps": {
    "backgroundColor": "white"
  },
  "properties": {
    "FormVertical_75Uu02": {
      "id": "FormVertical_75Uu02",
      "component": "FormVertical",
      "alias": "formData",
      "name": "formData",
      "type": "default",
      "properties": {
        "TittleMiddle_MuKa57": {
          "id": "TittleMiddle_MuKa57",
          "component": "TittleMiddle",
          "content": "基本信息",
          "formId": "FormVertical_75Uu02"
        },
        "Input_75Uu03": {
          "id": "Input_75Uu03",
          "component": "Input",
          "name": "resourceName",
          "label": "活动名称",
          "required": true,
          "requiredErrorMessage": "请输入活动名称",
          "pattern": {},
          "patternErrorMessage": "支持中文、数字、英文输入，不支持符号",
          "placeholder": "1-20个字",
          "minLength": 1,
          "maxLength": 20,
          "formId": "FormVertical_75Uu02"
        },
        "Cascader_n5Bq8l": {
          "id": "Cascader_n5Bq8l",
          "component": "Cascader",
          "name": "resourceCode",
          "label": "资源位",
          "required": true,
          "requiredErrorMessage": "请选择资源位",
          "placeholder": "请选择",
          "formId": "FormVertical_75Uu02"
        },
        "TableForm_aykRC1": {
          "id": "TableForm_aykRC1",
          "component": "TableForm",
          "name": "recommends",
          "label": "资源位配置",
          "required": true,
          "requiredErrorMessage": "请将资源位配置填写完整",
          "sortable": true,
          "allowRemove": true,
          "allowAdd": true,
          "removeConfirm": true,
          "addButtonContent": "添加推荐词",
          "showSerialNumber": true,
          "minItems": 1,
          "maxItems": 8,
          "columns": {
            "TableFormColumn_XmX70M": {
              "id": "TableFormColumn_XmX70M",
              "component": "TableFormColumn",
              "title": "搜索推荐词",
              "tooltip": "搜索词",
              "properties": {
                "Input_XmX71M": {
                  "id": "Input_XmX71M",
                  "component": "Input",
                  "name": "recommend",
                  "required": true,
                  "requiredErrorMessage": "请输入搜索推荐词，最多8个字",
                  "pattern": {},
                  "patternErrorMessage": "支持中文、数字、英文输入，不支持符号",
                  "placeholder": "1-8个字",
                  "minLength": 1,
                  "maxLength": 8,
                  "formId": "FormVertical_75Uu02"
                }
              },
              "formId": "FormVertical_75Uu02"
            }
          },
          "formId": "FormVertical_75Uu02"
        },
        "FormButtonGroup_75Uu04": {
          "id": "FormButtonGroup_75Uu04",
          "component": "FormButtonGroup",
          "properties": {
            "FormButton_75Uu05": {
              "id": "FormButton_75Uu05",
              "component": "FormButton",
              "type": "default",
              "content": "返回",
              "action": "GO_BACK",
              "formId": "FormVertical_75Uu02"
            },
            "FormButton_75Uu06": {
              "id": "FormButton_75Uu06",
              "component": "FormButton",
              "content": "提交",
              "action": "SUBMIT",
              "formId": "FormVertical_75Uu02"
            }
          },
          "formId": "FormVertical_75Uu02"
        }
      },
      "formId": "FormVertical_75Uu02"
    },
    "FormHorizontal_77Uu03": {
      "id": "FormHorizontal_77Uu03",
      "component": "FormVertical",
      "alias": "formData",
      "name": "formData",
      "type": "default",
      "properties": {
        "Input_77Uu03": {
          "id": "Input_77Uu03",
          "component": "Input",
          "name": "resourceName",
          "label": "活动名称",
          "required": true,
          "requiredErrorMessage": "请输入活动名称",
          "pattern": {},
          "patternErrorMessage": "支持中文、数字、英文输入，不支持符号",
          "placeholder": "1-20个字",
          "minLength": 1,
          "maxLength": 20,
          "formId": "FormHorizontal_77Uu03"
        },
        "FormButtonGroup_77Uu04": {
          "id": "FormButtonGroup_77Uu04",
          "component": "FormButtonGroup",
          "properties": {
            "FormButton_77Uu05": {
              "id": "FormButton_77Uu05",
              "component": "FormButton",
              "type": "default",
              "content": "返回",
              "action": "GO_BACK",
              "formId": "FormHorizontal_77Uu03"
            },
            "FormButton_77Uu06": {
              "id": "FormButton_77Uu06",
              "component": "FormButton",
              "content": "提交",
              "action": "SUBMIT",
              "formId": "FormHorizontal_77Uu03"
            }
          },
          "formId": "FormHorizontal_77Uu03"
        }
      },
      "formId": "FormHorizontal_77Uu03"
    }
  }
}


