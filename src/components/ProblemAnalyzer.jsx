import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Divider, Spin, Alert, Table, Tag, Space } from 'antd';
import { SearchOutlined, CodeOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 模拟：规则引擎（核心排查逻辑，基于你过往的生产问题经验）
const RULE_ENGINE = [
  // 场景1：字段映射错误（最高频）
  {
    id: 'R001',
    condition: (data) => {
      // 条件：提交数据≠回显数据 + 包含字段映射关键词
      const submitVal = data.submitFormData?.[data.exceptionField];
      const echoVal = data.echoFormData?.[data.exceptionField];
      return submitVal !== echoVal && 
             (data.logContent?.includes('mapping') || data.logContent?.includes('字段映射'));
    },
    result: {
      rootCause: '流程节点间字段映射配置错误，导致数据传递异常',
      confidence: 95,
      codePosition: 'src/flow/mapping.js:58 (mapNodeField函数)',
      fixSuggestion: '1. 检查异常节点的字段映射配置；2. 确认源字段与目标字段名一致'
    }
  },
  // 场景2：字段类型转换错误
  {
    id: 'R002',
    condition: (data) => {
      const submitVal = data.submitFormData?.[data.exceptionField];
      // 条件：提交数字但回显0/空 + 日志包含类型转换
      return typeof submitVal === 'number' && 
             (data.echoFormData?.[data.exceptionField] === 0 || data.echoFormData?.[data.exceptionField] === '') &&
             data.logContent?.includes('type convert');
    },
    result: {
      rootCause: '表单字段类型配置错误（数字值存入文本字段），导致类型转换异常',
      confidence: 90,
      codePosition: 'src/form/validate.js:32 (convertFieldType函数)',
      fixSuggestion: '1. 检查异常字段的类型配置；2. 将字段类型改为Number'
    }
  },
  // 场景3：权限/操作人数据过滤
  {
    id: 'R003',
    condition: (data) => {
      // 条件：操作人无权限 + 日志包含permission
      return data.logContent?.includes('permission') && data.logContent?.includes(data.operator);
    },
    result: {
      rootCause: '操作人无该流程节点的数据访问权限，导致数据被过滤',
      confidence: 85,
      codePosition: 'src/permission/filter.js:18 (checkDataPermission函数)',
      fixSuggestion: '1. 检查操作人角色权限；2. 调整流程节点的数据权限配置'
    }
  }
];

// 模拟：根据实例ID拉取日志（对接你的生产日志系统）
const fetchLogByInstanceId = async (instanceId) => {
  // 实际场景：对接ELK/日志平台API，拉取该实例ID的全链路日志
  await new Promise(resolve => setTimeout(resolve, 800));
  return `[${new Date().toLocaleString()}] instanceId:${instanceId} - mapping field travel_days → days error; 
          [${new Date().toLocaleString()}] submitData: {travel_days:3} → echoData: {days:1};
          [${new Date().toLocaleString()}] mapNodeField函数执行异常：目标字段未定义`;
};

// 模拟：代码检索（根据日志关键词定位代码）
const searchCodeByKeyword = (keywords) => {
  // 实际场景：对接代码仓库API（GitLab/GitHub），按关键词检索代码
  const codeMap = {
    'mapping': 'src/flow/mapping.js:58 - mapNodeField: (source, target) => { return target[sourceField] || 0; }',
    'type convert': 'src/form/validate.js:32 - convertFieldType: (val, type) => { return type === "text" ? val.toString() : Number(val); }',
    'permission': 'src/permission/filter.js:18 - checkDataPermission: (operator, data) => { return operator.roles.includes("admin") ? data : {}; }'
  };
  return keywords.map(key => codeMap[key] || '未匹配到代码').filter(Boolean);
};

const ProblemAnalyzer = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [codeSnippets, setCodeSnippets] = useState([]);

  // 一键分析核心逻辑
  const handleAnalyze = async (values) => {
    setLoading(true);
    try {
      // 步骤1：拉取该实例ID的全链路日志
      const logContent = await fetchLogByInstanceId(values.instanceId);
      
      // 步骤2：提取日志关键词（用于代码检索）
      const keywords = ['mapping', 'type convert', 'permission'].filter(key => logContent.includes(key));
      
      // 步骤3：检索关联代码
      const codeList = searchCodeByKeyword(keywords);
      setCodeSnippets(codeList);
      
      // 步骤4：规则引擎匹配根因
      const inputData = {
        ...values,
        logContent,
        submitFormData: JSON.parse(values.submitFormData || '{}'),
        echoFormData: JSON.parse(values.echoFormData || '{}')
      };
      
      // 匹配规则
      const matchedRule = RULE_ENGINE.find(rule => rule.condition(inputData));
      
      setAnalysisResult({
        success: true,
        logContent,
        ruleResult: matchedRule?.result || {
          rootCause: '未匹配到已知规则，可能是引擎底层逻辑异常',
          confidence: 50,
          codePosition: '未知',
          fixSuggestion: '1. 查看全链路日志；2. 检查流程引擎核心逻辑'
        }
      });
    } catch (error) {
      setAnalysisResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <Title level={3}>BPP流程异常一键分析工具</Title>
      <Text>输入最小化异常数据，快速定位代码问题根因</Text>
      
      <Divider />
      
      {/* 异常数据输入表单（极简） */}
      <Card title="异常数据输入" variant="outlined" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAnalyze}
          initialValues={{ exceptionField: '' }}
        >
          <Form.Item
            name="instanceId"
            label="流程实例ID"
            rules={[{ required: true, message: '请输入实例ID' }]}
          >
            <Input placeholder="例如：PROC-20251216-0001" prefix={<SearchOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="operator"
            label="操作人账号"
            rules={[{ required: true, message: '请输入操作人账号' }]}
          >
            <Input placeholder="例如：zhangsan@company.com" />
          </Form.Item>
          
          <Form.Item
            name="exceptionField"
            label="异常字段（可选）"
          >
            <Input placeholder="例如：travel_days（为空则分析全字段）" />
          </Form.Item>
          
          <Form.Item
            name="submitFormData"
            label="提交的表单数据（JSON）"
            // rules={[{ required: true, message: '请输入提交的表单数据' }]}
          >
            <TextArea 
              rows={3} 
              placeholder='例如：{"travel_days":3, "amount":1000}' 
            />
          </Form.Item>
          
          <Form.Item
            name="echoFormData"
            label="回显的表单数据（JSON）"
            // rules={[{ required: true, message: '请输入回显的表单数据' }]}
          >
            <TextArea 
              rows={3} 
              placeholder='例如：{"travel_days":1, "amount":1000}' 
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              一键分析问题
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {/* 分析结果展示 */}
      {analysisResult && (
        <Card title="分析结果" variant="outlined">
          {analysisResult.success ? (
            <>
              {/* 根因分析 */}
              <div style={{ marginBottom: 20 }}>
                <Title level={4}>根因定位</Title>
                <Alert
                  message={`置信度：${analysisResult.ruleResult.confidence}%`}
                  description={
                    <>
                      <Paragraph strong>问题原因：</Paragraph>
                      <Paragraph>{analysisResult.ruleResult.rootCause}</Paragraph>
                      <Paragraph strong>代码位置：</Paragraph>
                      <Text code style={{ fontSize: 14 }}>
                        {analysisResult.ruleResult.codePosition}
                      </Text>
                      <Paragraph strong>修复建议：</Paragraph>
                      <ul>
                        {analysisResult.ruleResult.fixSuggestion.split(';').map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </>
                  }
                  type={analysisResult.ruleResult.confidence > 80 ? 'success' : 'warning'}
                  showIcon
                />
              </div>
              
              {/* 关联代码片段 */}
              <div style={{ marginBottom: 20 }}>
                <Title level={4}>关联代码片段</Title>
                {codeSnippets.length > 0 ? (
                  <Table
                    dataSource={codeSnippets.map((code, i) => ({ key: i, code }))}
                    columns={[
                      {
                        title: '代码位置+内容',
                        dataIndex: 'code',
                        render: (text) => (
                          <pre style={{ 
                            backgroundColor: '#f5f5f5', 
                            padding: 10, 
                            borderRadius: 4,
                            fontSize: 12
                          }}>
                            {text}
                          </pre>
                        )
                      }
                    ]}
                    pagination={false}
                  />
                ) : (
                  <Text type="secondary">未检索到关联代码</Text>
                )}
              </div>
              
              {/* 全链路日志（可折叠） */}
              <div>
                <Title level={4}>
                  <Space>
                    <FileTextOutlined />
                    全链路日志
                  </Space>
                </Title>
                <pre style={{ 
                  backgroundColor: '#f9f9f9', 
                  padding: 10, 
                  borderRadius: 4,
                  maxHeight: 200,
                  overflow: 'auto',
                  fontSize: 12
                }}>
                  {analysisResult.logContent}
                </pre>
              </div>
            </>
          ) : (
            <Alert
              message="分析失败"
              description={analysisResult.error}
              type="error"
              showIcon
            />
          )}
        </Card>
      )}
      
      {/* 加载遮罩 */}
      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(255,255,255,0.8)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 9999
        }}>
          <Spin size="large" tip="正在分析异常数据..."></Spin>
        </div>
      )}
    </div>
  );
};

export default ProblemAnalyzer;