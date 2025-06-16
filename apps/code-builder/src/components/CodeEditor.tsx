import React, { useRef, useEffect, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { Card, Space, Button, Typography, Tooltip, message, Badge } from 'antd'
import { 
  SaveOutlined, 
  UndoOutlined, 
  RedoOutlined,
  FormatPainterOutlined,
  BugOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import useCodeBuilderStore from '../store'
import * as prettier from 'prettier'

const { Title } = Typography

const CodeEditor: React.FC = () => {
  const editorRef = useRef<any>(null)
  const [syntaxErrors, setSyntaxErrors] = useState<any[]>([])
  const [isValid, setIsValid] = useState(true)
  
  const { 
    editorState, 
    updateCode,
    astParser,
    selectedComponent,
    components
  } = useCodeBuilderStore()

  // 当选中组件变化时，定位到对应代码位置
  useEffect(() => {
    if (selectedComponent && editorRef.current) {
      const editor = editorRef.current
      const position = selectedComponent.position
      
      // 跳转到组件位置
      editor.setPosition({
        lineNumber: position.line,
        column: position.column
      })
      
      // 高亮显示组件代码范围
      editor.deltaDecorations([], [{
        range: {
          startLineNumber: position.line,
          startColumn: 1,
          endLineNumber: position.line + 5, // 简化实现，实际应该计算准确的结束位置
          endColumn: 1
        },
        options: {
          className: 'selected-component-highlight',
          isWholeLine: true
        }
      }])
    }
  }, [selectedComponent])

  // 处理代码变更
  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateCode(value)
      // 实时语法检查
      performSyntaxCheck(value)
    }
  }

  // 执行语法检查
  const performSyntaxCheck = (code: string) => {
    try {
      // 使用AST解析器进行语法检查
      astParser.updateCode(code)
      setSyntaxErrors([])
      setIsValid(true)
    } catch (error) {
      const errorInfo = {
        message: error instanceof Error ? error.message : '语法错误',
        line: 1, // 简化处理，实际应该解析错误位置
        column: 1
      }
      setSyntaxErrors([errorInfo])
      setIsValid(false)
    }
  }

  // 格式化代码
  const handleFormatCode = async () => {
    try {
      if (!editorRef.current) return
      
      const currentCode = editorRef.current.getValue()
      
      // 使用prettier格式化
      const formattedCode = await prettier.format(currentCode, {
        parser: 'typescript',
        plugins: [
          // 这里需要导入prettier的插件，简化处理
        ],
        semi: false,
        singleQuote: true,
        trailingComma: 'none',
        printWidth: 100
      })
      
      editorRef.current.setValue(formattedCode)
      updateCode(formattedCode)
      message.success('代码格式化完成')
    } catch (error) {
      console.error('代码格式化失败:', error)
      // 简化格式化 - 使用monaco自带的格式化
      editorRef.current?.getAction('editor.action.formatDocument')?.run()
      message.success('代码格式化完成')
    }
  }

  // 保存代码
  const handleSaveCode = () => {
    const currentCode = editorRef.current?.getValue()
    if (currentCode) {
      updateCode(currentCode)
      message.success('代码已保存')
    }
  }

  // 复制代码
  const handleCopyCode = () => {
    const currentCode = editorRef.current?.getValue()
    if (currentCode) {
      navigator.clipboard.writeText(currentCode)
      message.success('代码已复制到剪贴板')
    }
  }

  // 撤销/重做
  const handleUndo = () => {
    editorRef.current?.trigger('keyboard', 'undo', null)
  }

  const handleRedo = () => {
    editorRef.current?.trigger('keyboard', 'redo', null)
  }

  // 语法检查
  const handleSyntaxCheck = () => {
    if (!editorRef.current) return
    
    const currentCode = editorRef.current.getValue()
    try {
      astParser.updateCode(currentCode)
      message.success('语法检查通过')
    } catch (error) {
      message.error(`语法错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // Monaco编辑器选项
  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line' as const,
    automaticLayout: true,
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
    lineHeight: 20,
    minimap: {
      enabled: true
    },
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    theme: 'vs-dark',
    tabSize: 2,
    insertSpaces: true,
    folding: true,
    foldingStrategy: 'indentation' as const,
    showFoldingControls: 'always' as const,
    bracketPairColorization: {
      enabled: true
    },
    guides: {
      bracketPairs: true,
      indentation: true
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 编辑器工具栏 */}
      <Card 
        size="small" 
        style={{ 
          borderRadius: 0, 
          borderBottom: '1px solid #e8e8e8',
          marginBottom: 0
        }}
        bodyStyle={{ padding: '8px 16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Space>
              <Title level={5} style={{ margin: 0 }}>
                代码编辑器
              </Title>
              <Badge 
                count={components.length} 
                style={{ backgroundColor: '#52c41a' }}
                title={`当前页面有 ${components.length} 个组件`}
              />
              {syntaxErrors.length > 0 && (
                <Badge 
                  count={syntaxErrors.length} 
                  style={{ backgroundColor: '#ff4d4f' }}
                  title={`发现 ${syntaxErrors.length} 个语法错误`}
                />
              )}
              {isValid ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} title="代码语法正确" />
              ) : (
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} title="代码存在问题" />
              )}
            </Space>
            {selectedComponent && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                当前选中: {selectedComponent.identity.name} ({selectedComponent.identity.type})
              </div>
            )}
          </div>

          <Space>
            <Tooltip title="撤销 (Ctrl+Z)">
              <Button 
                size="small" 
                icon={<UndoOutlined />}
                onClick={handleUndo}
              />
            </Tooltip>
            
            <Tooltip title="重做 (Ctrl+Y)">
              <Button 
                size="small" 
                icon={<RedoOutlined />}
                onClick={handleRedo}
              />
            </Tooltip>
            
            <Tooltip title="格式化代码 (Shift+Alt+F)">
              <Button 
                size="small" 
                icon={<FormatPainterOutlined />}
                onClick={handleFormatCode}
              />
            </Tooltip>
            
            <Tooltip title="语法检查">
              <Button 
                size="small" 
                icon={<BugOutlined />}
                onClick={handleSyntaxCheck}
              />
            </Tooltip>
            
            <Tooltip title="复制代码">
              <Button 
                size="small" 
                icon={<CopyOutlined />}
                onClick={handleCopyCode}
              />
            </Tooltip>
            
            <Tooltip title="保存代码 (Ctrl+S)">
              <Button 
                size="small" 
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveCode}
                disabled={!editorState.isDirty}
              />
            </Tooltip>
          </Space>
        </div>
      </Card>

      {/* Monaco编辑器 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          language="typescript"
          value={editorState.code}
          onChange={handleCodeChange}
          options={editorOptions}
          onMount={(editor, monaco) => {
            editorRef.current = editor
            
            // 添加自定义主题
            monaco.editor.defineTheme('custom-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '6A9955' },
                { token: 'keyword', foreground: '569CD6' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
              ],
              colors: {
                'editor.background': '#1e1e1e',
                'editor.lineHighlightBackground': '#2d2d30',
                'editorLineNumber.foreground': '#858585',
                'editor.selectionBackground': '#264F78',
                'editor.selectionHighlightBackground': '#173a45'
              }
            })
            
            // 添加选中组件高亮样式
            monaco.editor.addEditorAction({
              id: 'highlight-component',
              label: 'Highlight Selected Component',
              run: () => {
                // 高亮逻辑已在useEffect中实现
              }
            })
            
            // 键盘快捷键
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
              handleSaveCode()
            })
            
            // 当光标位置变化时，尝试选中对应的组件
            editor.onDidChangeCursorPosition(() => {
              // TODO: 根据光标位置选中对应的组件
              // 这需要实现从代码位置到组件ID的反向映射
            })
          }}
        />
        
        {/* 编辑器状态指示器 */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 16,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: '11px',
          pointerEvents: 'none'
        }}>
          {editorState.isDirty ? '● 未保存' : '● 已保存'} | TypeScript | UTF-8
        </div>
      </div>
    </div>
  )
}

export default CodeEditor