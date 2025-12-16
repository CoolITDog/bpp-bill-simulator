import React, { useState } from 'react';
import { Card, Form, Input, Button, Table, message, Space, Typography, Divider, Select, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined, GitlabOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RadioGroup } = Radio;

const GitConfig = ({ gitRepos, updateGitRepos }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [repoType, setRepoType] = useState('local'); // local 或 git

  // 模拟可用的分支选项
  const branchOptions = [
    { value: 'main', label: 'main' },
    { value: 'develop', label: 'develop' },
    { value: 'release', label: 'release' },
  ];

  // 提交表单
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRepo = {
        key: Date.now().toString(),
        ...values,
        type: repoType,
        status: '已配置',
        lastPullTime: null
      };
      
      const updatedRepos = [...gitRepos, newRepo];
      updateGitRepos(updatedRepos);
      form.resetFields();
      setRepoType('local'); // 重置为默认值
      message.success('代码仓库配置成功');
    } catch (error) {
      message.error('代码仓库配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除仓库
  const handleDelete = (key) => {
    const updatedRepos = gitRepos.filter(repo => repo.key !== key);
    updateGitRepos(updatedRepos);
    message.success('代码仓库删除成功');
  };

  // 表列配置
  const columns = [
    {
      title: '仓库名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name, record) => (
        <Space>
          {record.type === 'git' ? <GitlabOutlined /> : <FileTextOutlined />}
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <span style={{ 
          padding: '2px 8px', 
          borderRadius: 4, 
          backgroundColor: type === 'git' ? '#e6f7ff' : '#f6ffed',
          color: type === 'git' ? '#1890ff' : '#52c41a'
        }}>
          {type === 'git' ? 'Git仓库' : '本地代码'}
        </span>
      ),
    },
    {
      title: '地址/路径',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (url, record) => (
        <Text>{record.type === 'git' ? url : record.localPath}</Text>
      ),
    },
    {
      title: '分支',
      dataIndex: 'branch',
      key: 'branch',
      width: 120,
      render: (branch) => branch || '-',
    },
    {
      title: '核心目录',
      dataIndex: 'coreDir',
      key: 'coreDir',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span style={{ 
          padding: '2px 8px', 
          borderRadius: 4, 
          backgroundColor: status === '已拉取' ? '#e6f7ff' : '#f0f0f0',
          color: status === '已拉取' ? '#1890ff' : '#666'
        }}>
          {status}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.key)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>代码仓库配置</Title>
      <Text>配置您的BPP流程引擎代码仓库，系统将使用这些仓库进行异常分析。</Text>
      
      <Divider />
      
      <Card title="添加代码仓库" variant="outlined" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="仓库名称"
            rules={[{ required: true, message: '请输入仓库名称' }]}
          >
            <Input placeholder="例如：bpp-process-engine" />
          </Form.Item>
          
          <Form.Item
            name="repoType"
            label="仓库类型"
            initialValue="local"
            rules={[{ required: true, message: '请选择仓库类型' }]}
          >
            <RadioGroup onChange={(e) => setRepoType(e.target.value)}>
              <Radio value="local">本地代码文件夹</Radio>
              <Radio value="git">Git仓库</Radio>
            </RadioGroup>
          </Form.Item>
          
          {/* Git仓库配置 */}
          {repoType === 'git' && (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Form.Item
                name="url"
                label="仓库URL"
                rules={[
                  { required: true, message: '请输入仓库地址' },
                  { type: 'url', message: '请输入有效的URL地址' }
                ]}
              >
                <Input placeholder="例如：https://github.com/your-company/bpp-process-engine.git" prefix={<GitlabOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="branch"
                label="分支"
                initialValue="main"
                rules={[{ required: true, message: '请选择分支' }]}
              >
                <Select placeholder="请选择分支">
                  {branchOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>
          )}
          
          {/* 本地代码文件夹配置 */}
          {repoType === 'local' && (
            <Form.Item
              name="localPath"
              label="本地代码路径"
              rules={[{ required: true, message: '请输入本地代码路径' }]}
            >
              <Input placeholder="例如：D:\Projects\bpp-process-engine" prefix={<FileTextOutlined />} />
            </Form.Item>
          )}
          
          <Form.Item
            name="coreDir"
            label="核心代码目录"
            initialValue="src"
            rules={[{ required: true, message: '请输入核心代码目录' }]}
          >
            <Input placeholder="例如：src" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="仓库描述"
          >
            <TextArea rows={3} placeholder="请输入仓库描述，方便后续管理" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
              添加仓库
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      <Card title="已配置的代码仓库" variant="outlined">
        <Table 
          columns={columns} 
          dataSource={gitRepos} 
          pagination={false}
          rowKey="key"
          locale={{ emptyText: '暂无配置的代码仓库' }}
        />
      </Card>
    </div>
  );
};

export default GitConfig;