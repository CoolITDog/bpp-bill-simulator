import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Upload, message, Typography, Divider, Space, Spin, Modal } from 'antd';
import { SendOutlined, ClearOutlined, CopyOutlined, FileTextOutlined } from '@ant-design/icons';
import { InboxOutlined } from '@ant-design/icons';

// 导入规则引擎
import { analyzeException, generateAnalysisSummary, generateSeverity } from '../utils/ruleEngine';

const { Title, Text, Paragraph, Pre } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

const ExceptionAnalysis = ({ gitRepos, onAnalysisComplete }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [jsonVisible, setJsonVisible] = useState(false);
  const [structuredJson, setStructuredJson] = useState(null);

  // 生成可用的仓库选项
  const gitRepoOptions = gitRepos.map(repo => ({
    value: repo.key,
    label: repo.name
  }));

  // 模拟可用的异常场景选项
  const exceptionSceneOptions = [
    { value: 'field_value_error', label: '字段值在节点流转后数值错误' },
    { value: 'field_missing', label: '缺少必填字段' },
    { value: 'field_type_error', label: '字段类型错误' },
    { value: 'flow_not_progress', label: '流程未正常流转' },
    { value: 'node_config_error', label: '节点配置错误' },
  ];

  // 提交表单
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 模拟API请求，实际应该调用后端服务进行分析
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 生成标准化的结构化异常数据JSON
      const structuredData = {
        "processInstanceId": values.processId,
        "exceptionNode": values.exceptionNode || "unknown-node",
        "exceptionField": values.exceptionField || "unknown-field",
        "exceptionDesc": values.exceptionDescription,
        "submitData": values.formData ? JSON.parse(values.formData) : {},
        "nodeConfig": values.nodeConfig ? JSON.parse(values.nodeConfig) : {},
        "operateTime": new Date().toISOString().slice(0, 19).replace('T', ' '),
        "gitRepo": values.gitRepo,
        "exceptionScene": values.exceptionScene
      };
      
      setStructuredJson(structuredData);
      setJsonVisible(true);
      
      // 使用规则引擎生成分析结果
      const potentialIssues = analyzeException(structuredData);
      const severity = generateSeverity(potentialIssues);
      const summary = generateAnalysisSummary(potentialIssues);
      
      // 生成分析结果
      const analysisResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        inputData: structuredData,
        analysis: {
          severity: severity,
          potentialIssues: potentialIssues,
          summary: summary
        }
      };
      
      // 调用父组件传递的回调函数，更新分析结果
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
      
      // 显示成功消息
      message.success('异常数据已生成，即将进行分析');
      
      // 重置表单
      form.resetFields();
      setFileList([]);
      
    } catch (error) {
      message.error('生成异常数据失败，请检查输入格式');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理文件上传
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 上传前的校验
  const beforeUpload = (file) => {
    const isJSON = file.type === 'application/json' || file.name.endsWith('.json');
    if (!isJSON) {
      message.error('请上传JSON格式的文件');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('文件大小不能超过2MB');
    }
    return isJSON && isLt2M;
  };

  // 清空表单
  const handleClear = () => {
    form.resetFields();
    setFileList([]);
    message.info('表单已清空');
  };

  // 关闭JSON预览模态框
  const handleJsonClose = () => {
    setJsonVisible(false);
    setStructuredJson(null);
  };

  // 复制JSON到剪贴板
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(structuredJson, null, 2))
      .then(() => {
        message.success('JSON已复制到剪贴板');
      })
      .catch(err => {
        message.error('复制失败，请手动复制');
        console.error('复制失败:', err);
      });
  };

  // 开始分析
  const handleStartAnalysis = () => {
    setJsonVisible(false);
    // 这里可以添加额外的分析逻辑
    message.success('分析已开始');
  };

  return (
    <div>
      <Title level={3}>异常数据分析</Title>
      <Text>提交您的BPP流程异常数据，系统将结合代码分析可能存在的问题。</Text>
      
      <Divider />
      
      <Card title="异常数据提交" variant="outlined">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="gitRepo"
            label="选择代码仓库"
            rules={[{ required: true, message: '请选择要分析的代码仓库' }]}
          >
            <Select placeholder="请选择代码仓库">
              {gitRepoOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="exceptionScene"
            label="异常场景"
            rules={[{ required: true, message: '请选择异常场景' }]}
          >
            <Select placeholder="请选择异常场景">
              {exceptionSceneOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="processId"
            label="流程实例ID"
            rules={[{ required: true, message: '请输入异常流程的ID' }]}
          >
            <Input placeholder="例如：PROC-2025-00123" />
          </Form.Item>
          
          <Form.Item
            name="exceptionNode"
            label="异常节点ID"
          >
            <Input placeholder="例如：approve-node-01" />
          </Form.Item>
          
          <Form.Item
            name="exceptionField"
            label="异常字段名"
          >
            <Input placeholder="例如：travel_days" />
          </Form.Item>
          
          <Form.Item
            name="exceptionDescription"
            label="异常描述"
            rules={[{ required: true, message: '请简要描述异常情况' }]}
          >
            <TextArea rows={3} placeholder="请简要描述异常情况，例如：填写3天，审批节点显示1天" />
          </Form.Item>
          
          <Form.Item
            name="formData"
            label="表单数据（JSON格式）"
            rules={[
              { required: true, message: '请输入表单数据' }
            ]}
          >
            <TextArea 
              rows={8} 
              placeholder='请输入或粘贴JSON格式的表单数据，例如：{"travel_days": 3, "amount": 1000}'
              style={{ fontFamily: 'monospace' }}
              autoSize={{ minRows: 8, maxRows: 16 }}
            />
          </Form.Item>
          
          <Form.Item
            name="nodeConfig"
            label="异常节点配置（JSON格式）"
          >
            <TextArea 
              rows={6} 
              placeholder='请输入或粘贴JSON格式的节点配置，例如：{"mapping": {"travel_days": "days"}}'
              style={{ fontFamily: 'monospace' }}
              autoSize={{ minRows: 6, maxRows: 12 }}
            />
          </Form.Item>
          
          <Form.Item label="或上传异常数据JSON文件">
            <Dragger
              name="file"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleFileChange}
              accept=".json"
              multiple={false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽JSON文件到此处上传</p>
              <p className="ant-upload-hint">
                支持单个JSON文件上传，文件大小不超过2MB
              </p>
            </Dragger>
          </Form.Item>
          
          <Form.Item>
            <Space size="middle">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SendOutlined />}
                size="large"
              >
                生成结构化数据
              </Button>
              <Button 
                icon={<ClearOutlined />}
                onClick={handleClear}
                size="large"
              >
                清空表单
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      {/* JSON预览模态框 */}
      <Modal
        title="结构化异常数据"
        open={jsonVisible}
        onCancel={handleJsonClose}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyJson}>
            复制JSON
          </Button>,
          <Button key="back" onClick={handleJsonClose}>
            返回编辑
          </Button>,
          <Button key="analysis" type="primary" icon={<SendOutlined />} onClick={handleStartAnalysis}>
            开始分析
          </Button>
        ]}
        width={1000}
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Text strong>生成的标准化结构化异常数据：</Text>
            <Paragraph>该数据将用于后续的智能分析，请确认数据格式正确。</Paragraph>
          </div>
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto', maxHeight: 500 }}>
            <Pre>{JSON.stringify(structuredJson, null, 2)}</Pre>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Text type="secondary">
                数据格式说明：
                <br />- processInstanceId：流程实例ID
                <br />- exceptionNode：异常节点ID
                <br />- exceptionField：异常字段名
                <br />- exceptionDesc：异常描述
                <br />- submitData：前端提交原始数据
                <br />- nodeConfig：异常节点的配置
                <br />- operateTime：操作时间
              </Text>
            </Space>
          </div>
        </div>
      </Modal>
      
      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(255, 255, 255, 0.8)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 9999
        }}>
          <Spin size="large" tip="正在生成结构化数据..." />
        </div>
      )}
    </div>
  );
};

export default ExceptionAnalysis;