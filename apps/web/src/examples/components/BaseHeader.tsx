import { Button } from 'antd'
import { useNavigate } from 'react-router';

export default () => {
  const navigate = useNavigate()

  return (
    <div className="top-bar">
      <Button onClick={() => navigate('/list_pro')} style={{marginRight: 4}}>简化列表</Button>
      <Button onClick={() => navigate('/list_base_page')} style={{marginRight: 4}}>基础列表</Button>
      <Button onClick={() => navigate('/base_form')} style={{marginRight: 4}}>基础表单</Button>
      <Button onClick={() => navigate('/list')}>列表</Button>
    </div>
  )
}
