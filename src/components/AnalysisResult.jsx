import React from 'react';
import { Card, Typography, Tag, Table, Space, Divider, Empty, Button, Avatar, message } from 'antd';
import { AlertOutlined, CodeOutlined, BulbOutlined, ClockCircleOutlined, GitlabOutlined, FileTextOutlined, CopyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph, Pre } = Typography;

const AnalysisResult = ({ result }) => {
  // 如果没有分析结果，显示空状态
  if (!result) {
    return (
      <div>
        <Title level={3}>分析结果</Title>
        <Text>以下是系统对异常数据的分析结果，包括潜在问题和建议解决方案。</Text>
        
        <Divider />
        
        <Card variant="outlined">
          <Empty 
            description="暂无分析结果"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Paragraph style={{ marginTop: 16 }}>
            请先在"异常数据分析"页面提交异常数据进行分析，分析结果将在此处显示。
          </Paragraph>
        </Card>
      </div>
    );
  }

  // 表列配置
  const columns = [
    {
      title: '问题类型',
      dataIndex: 'type',
      key: 'type',
      width: 200,
      render: (type) => (
        <Tag color={type.includes('数据') ? 'red' : type.includes('字段') ? 'blue' : type.includes('流程') ? 'orange' : 'purple'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '问题描述',
      dataIndex: 'message',
      key: 'message',
      render: (message) => <Text strong>{message}</Text>,
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 120,
      render: (confidence) => (
        <Tag color={confidence > 0.9 ? 'green' : confidence > 0.7 ? 'blue' : 'orange'}>
          {Math.round(confidence * 100)}%
        </Tag>
      ),
    },
    {
      title: '代码位置',
      dataIndex: 'location',
      key: 'location',
      width: 250,
      render: (location) => (
        <Space>
          <CodeOutlined />
          <a href={`https://gitlab.com/xxx/blob/main/${location}`} target="_blank" rel="noopener noreferrer">
            {location}
          </a>
        </Space>
      ),
    },
    {
      title: '修复建议',
      dataIndex: 'suggestion',
      key: 'suggestion',
      render: (suggestion) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
          <BulbOutlined style={{ color: '#faad14', marginTop: 2 }} />
          <Text>{suggestion}</Text>
        </div>
      ),
    },
  ];

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 复制分析结果
  const handleCopyResult = () => {
    const resultJson = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(resultJson)
      .then(() => {
        message.success('分析结果已复制到剪贴板');
      })
      .catch(err => {
        message.error('复制失败，请手动复制');
        console.error('复制失败:', err);
      });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>分析结果</Title>
        <Button 
          type="primary" 
          icon={<CopyOutlined />} 
          onClick={handleCopyResult}
          size="small"
        >
          复制完整结果
        </Button>
      </div>
      <Text>以下是系统对异常数据的分析结果，包括潜在问题和建议解决方案。</Text>
      
      <Divider />
      
      {/* 分析概览卡片 */}
      <Card variant="outlined" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar size={48} icon={<AlertOutlined style={{ fontSize: 24 }} />} style={{ backgroundColor: '#ff4d4f' }} />
              <div>
                <Text strong style={{ fontSize: 18 }}>异常分析报告</Text>
                <br />
                <Text type="secondary">生成时间：{formatTime(result.timestamp)}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: 24, display: 'block' }}>{result.analysis.potentialIssues.length}</Text>
                <Text type="secondary">潜在问题</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Tag color={result.analysis.severity === 'high' ? 'red' : result.analysis.severity === 'medium' ? 'orange' : 'green'} style={{ fontSize: 16, padding: '4px 16px' }}>
                  {result.analysis.severity === 'high' ? '高' : result.analysis.severity === 'medium' ? '中' : '低'} 严重度
                </Tag>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GitlabOutlined />
              <Text strong>仓库：</Text>
              <Text>{result.inputData.gitRepo}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined />
              <Text strong>流程ID：</Text>
              <Text>{result.inputData.processInstanceId}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClockCircleOutlined />
              <Text strong>操作时间：</Text>
              <Text>{result.inputData.operateTime}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertOutlined />
              <Text strong>异常场景：</Text>
              <Text>{result.inputData.exceptionDesc}</Text>
            </div>
          </div>
        </Space>
      </Card>
      
      {/* 分析摘要 */}
      <Card 
        title="分析摘要" 
        variant="outlined" 
        style={{ marginBottom: 24 }}
        extra={<AlertOutlined style={{ color: result.analysis.severity === 'high' ? '#ff4d4f' : '#faad14' }} />}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <AlertOutlined 
            style={{ 
              fontSize: 32, 
              color: result.analysis.severity === 'high' ? '#ff4d4f' : result.analysis.severity === 'medium' ? '#faad14' : '#52c41a',
              marginTop: 4
            }} 
          />
          <div style={{ flex: 1 }}>
            <Paragraph style={{ fontSize: 16 }}>
              {result.analysis.summary}
            </Paragraph>
            <div style={{ marginTop: 8 }}>
              <Tag 
                color={result.analysis.severity === 'high' ? 'red' : result.analysis.severity === 'medium' ? 'orange' : 'green'} 
                style={{ marginRight: 8 }}
              >
                严重程度：{result.analysis.severity === 'high' ? '高' : result.analysis.severity === 'medium' ? '中' : '低'}
              </Tag>
              <Tag color="blue">
                发现问题：{result.analysis.potentialIssues.length} 个
              </Tag>
            </div>
          </div>
        </div>
      </Card>
      
      {/* 详细问题列表 */}
      <Card title="潜在问题列表" variant="outlined" style={{ marginBottom: 24 }}>
        {result.analysis.potentialIssues.length > 0 ? (
          <Table
            columns={columns}
            dataSource={result.analysis.potentialIssues}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: '未发现潜在问题' }}
          />
        ) : (
          <Empty 
            description="未发现匹配的异常规则，建议使用大模型进行进一步分析" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
      
      {/* 原始数据预览 */}
      <Card title="原始数据预览" variant="outlined">
        <Space direction="vertical" size="16" style={{ width: '100%' }}>
          <div>
            <Text strong>异常场景描述：</Text>
            <Paragraph>{result.inputData.exceptionDesc}</Paragraph>
          </div>
          <div>
            <Text strong>表单提交数据：</Text>
            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto', marginTop: 8 }}>
              <Pre>{JSON.stringify(result.inputData.submitData, null, 2)}</Pre>
            </div>
          </div>
          {result.inputData.nodeConfig && Object.keys(result.inputData.nodeConfig).length > 0 && (
            <div>
              <Text strong>节点配置：</Text>
              <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto', marginTop: 8 }}>
                <Pre>{JSON.stringify(result.inputData.nodeConfig, null, 2)}</Pre>
              </div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default AnalysisResult;