import {
  FormItemInput,
  FormItemSelect,
  TableRowButton,
  PageListQuery,
  FormItemDatePickerRangePicker,
  ModalForm,
  useModal, FormItemTextArea, FormItemUploadImage, ModalView
} from '@fundam/antd'
import { Button } from 'antd'
import { useRef, useState } from 'react'

export default () => {
  const [editModalType, setEditModalType] = useState<'add' | 'edit' | 'detail'>('add')
  const [currentRecord, setCurrentRecord] = useState<any>(null)
  const tableRef = useRef<any>(null)
  const { open: editModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal()
  const { open: importModalOpen, openModal: openImportModal, closeModal: closeImportModal } = useModal()
  const { open: deleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal()

  const editModalTitle = {
    add: '新增',
    edit: '修改',
    detail: '查看',
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
      onCopy: (record: any) => record.id
    },
    {
      title: '字',
      dataIndex: 'char',
      width: 80
    },
    {
      title: '词',
      dataIndex: 'word',
      width: 120
    },
    {
      title: '句子',
      dataIndex: 'sentence',
      width: 200
    },
    {
      title: '拼音',
      dataIndex: 'py',
      width: 120
    },
    {
      title: '更新人',
      dataIndex: 'updater',
      width: 100
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      width: 140
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 140
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: 150,
      fixed: 'right',
      render: (_: any, record: any) => (
        <>
          <TableRowButton onClick={() => {
            setCurrentRecord(record)
            setEditModalType('detail')
            openEditModal()
          }}
          >查看</TableRowButton>
          <TableRowButton onClick={() => {
            setCurrentRecord(record)
            setEditModalType('edit')
            openEditModal()
          }}>编辑</TableRowButton>
          <TableRowButton danger onClick={() => {
            setCurrentRecord(record)
            openDeleteModal()
          }}>删除</TableRowButton>
        </>
      )
    },
  ]

  const formItems = (
    <>
      <FormItemInput
        isNumber
        name="id"
        label="ID"
      />
      <FormItemInput
        name="char"
        label="字"
      />
      <FormItemSelect
        name="creatorId"
        label="创建人员"
        dataApi="/user/getUsers"
        resDataPath="list"
        labelKey="name"
        valueKey="id"
        searchKey="name"
      />
      <FormItemDatePickerRangePicker
        names={['createStart', 'createEnd']}
        label="创建时间"
      />
      <FormItemSelect
        name="updaterId"
        label="更新人员"
        dataApi="/user/getUsers"
        resDataPath="list"
        labelKey="name"
        valueKey="id"
        searchKey="name"
      />
      <FormItemDatePickerRangePicker
        names={['updateStart', 'updateEnd']}
        label="更新时间"
      />
    </>
  )

  return (
    <>
      <PageListQuery
        tableRef={tableRef}
        formItems={formItems}
        parseQueryKeys={['id', 'page', 'pageSize']}
        tableProps={{
          rowKey: 'id',
          columns: columns as any,
          dataApi: '/api/char/getList'
        }}
        tableCardProps={{
          title: (
            <>
              <Button type="primary" onClick={() => {
                setCurrentRecord(null)
                setEditModalType('add')
                openEditModal()
              }} style={{marginRight: 16}}>新增</Button>
              <Button onClick={() => {
                openImportModal()
              }} style={{marginRight: 16}}>导入数据</Button>
            </>
          )
        }}
      />
      {/*新建/编辑/查看字弹窗*/}
      <ModalForm
        open={editModalOpen}
        title={editModalTitle[editModalType]}
        closeModal={closeEditModal}
        onSuccess={() => {
          // 刷新列表
          tableRef.current.refresh()
        }}
        dataApi={editModalType === 'add' ? '/api/char/add' : '/api/char/edit'}
        dataRule={editModalType !== 'detail'}
        formProps={{
          displayType: editModalType === 'detail' ? 'text' : 'default'
        }}
        initialValue={currentRecord}
      >
        <FormItemInput
          displayType="text"
          name="id"
          label="ID"
          visibleRule={editModalType !== 'add'}
        />
        <FormItemInput
          required
          name="char"
          label="字"
          disabled={editModalType === 'edit'}
        />
        <FormItemInput
          required
          name="word"
          label="词"
        />
        <FormItemTextArea
          required
          name="sentence"
          label="句子"
          placeholder="请输入由这个字组成的句"
          maxLength={200}
          count={{
            max: 200,
            show: true
          }}
        />
        <FormItemInput
          required
          name="py"
          label="拼音"
          placeholder="请输入由这个字组成的词"
          maxLength={20}
        />
        <FormItemUploadImage
          isObject
          label="音频文件"
          name="audio"
          dataApi="/api/file/upload"
          maxCount={1}
        />
      </ModalForm>
      {/*导入弹窗*/}
      <ModalForm
        open={importModalOpen}
        title="导入"
        closeModal={closeImportModal}
        onSuccess={() => {
          // 刷新列表
          tableRef.current.refresh()
        }}
        dataApi="/api/char/import"
      >
        <FormItemUploadImage
          isObject
          accept={'.mp3,.acc,.wav,.flac,.ogg,.m4a'}
          label="文件"
          name="audio"
          dataApi="/api/file/upload"
          maxCount={1}
          extra={(
            <a href="https://file-examples.com/storage/fe3f15b9da66a36baa1b51a/2017/02/file_example_XLS_10.xls">模版下载</a>
          )}
        />
      </ModalForm>
      {/*删除二次确认弹窗*/}
      <ModalView
        open={deleteModalOpen}
        title="提示"
        titleType="confirm"
        closeModal={closeDeleteModal}
        defaultButtonText="取消"
        modalProps={{
          width: 384
        }}
        dataApi="/api/char/delete"
        dataApiReqData={{
          id: currentRecord?.id
        }}
        successMessage="删除成功"
        onSuccess={() => {
          tableRef.current.refresh()
        }}
      >
        <div className="modal-description">你确定要删除该 字 吗？</div>
      </ModalView>
    </>
  )
}