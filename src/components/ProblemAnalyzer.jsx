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

// 模拟：本地代码读取（根据路径和关键词检索代码）
const readLocalCode = (localCodePath, keywords) => {
  // 实际场景：通过electron等技术实现本地文件系统访问
  // 模拟实现：根据本地路径和关键词返回相关代码片段
  const basePath = localCodePath || 'src';
  const codeMap = {
    'mapping': `${basePath}/flow/mapping.js:58 - mapNodeField: (source, target) => { return target[sourceField] || 0; }`,
    'type convert': `${basePath}/form/validate.js:32 - convertFieldType: (val, type) => { return type === "text" ? val.toString() : Number(val); }`,
    'permission': `${basePath}/permission/filter.js:18 - checkDataPermission: (operator, data) => { return operator.roles.includes("admin") ? data : {}; }`
  };
  return keywords.map(key => codeMap[key] || '未匹配到代码').filter(Boolean);
};

// 魔塔（ModelScope）平台大模型API调用配置
const META_TOWER_CONFIG = {
  // API密钥配置（从环境变量获取）
  // 请在.env文件中配置您的魔塔平台API Key：https://modelscope.cn
  API_KEY: import.meta.env.VITE_META_TOWER_API_KEY || 'YOUR_META_TOWER_API_KEY',
  
  // API端点配置（从环境变量获取）
  API_BASE_URL: import.meta.env.VITE_META_TOWER_API_BASE_URL || 'https://api.modelscope.cn/mcp/v1',
  
  // 模型名称（从环境变量获取，可根据需要选择不同模型）
  MODEL_NAME: import.meta.env.VITE_META_TOWER_MODEL_NAME || 'qwen/qwen1.5-7b-chat',
  
  // 请求超时时间
  TIMEOUT: 30000
};

// 大模型API调用（魔塔平台）
const callLLM = async (inputData) => {
  // 构建提示词
  const prompt = `
    请作为一位资深的后端开发工程师，分析以下流程异常问题：
    
    1. 异常描述：
       - 实例ID：${inputData.instanceId}
       - 操作人：${inputData.operator}
       - 异常字段：${inputData.exceptionField || '未知'}
       
    2. 日志内容：
       ${inputData.logContent}
       
    3. 本地代码片段：
       ${inputData.codeSnippets.join('\n')}
       
    4. 表单数据：
       - 提交数据：${JSON.stringify(inputData.submitFormData || {}, null, 2)}
       - 回显数据：${JSON.stringify(inputData.echoFormData || {}, null, 2)}
       
    请分析：
    - 问题的根本原因
    - 代码中的具体问题位置
    - 修复建议
    - 置信度（0-100）
    
    请以JSON格式返回结果，包含以下字段：rootCause, confidence, codePosition, fixSuggestion
    例如：{"rootCause":"字段映射错误","confidence":95,"codePosition":"src/flow/mapping.js:58","fixSuggestion":"检查映射配置"}
  `;
  
  try {
    // 检查API Key是否配置
    if (META_TOWER_CONFIG.API_KEY === 'YOUR_META_TOWER_API_KEY' || META_TOWER_CONFIG.API_KEY === 'YOUR_META_TOWER_API_KEY_HERE') {
      // 如果是默认值，返回模拟结果
      console.warn('使用模拟大模型结果，请在.env文件中配置您的魔塔API Key');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        rootCause: '根据本地代码分析，mapNodeField函数中目标字段未定义，导致字段映射错误',
        confidence: 92,
        codePosition: `${inputData.localCodePath || 'src'}/flow/mapping.js:58 (mapNodeField函数)`,
        fixSuggestion: `1. 检查${inputData.localCodePath || 'src'}/flow/mapping.js文件中的mapNodeField函数；2. 确保sourceField变量已正确定义；3. 添加字段存在性检查`
      };
    }
    
    // 构建API请求参数（兼容魔塔平台OpenAI格式）
    const requestBody = {
      model: META_TOWER_CONFIG.MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: '你是一位资深的前端开发工程师，擅长分析和定位流程异常问题'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
      response_format: {
        type: 'json_object'
      }
    };
    
    // 发送API请求
    const response = await fetch(`${META_TOWER_CONFIG.API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${META_TOWER_CONFIG.API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // 处理响应
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API请求失败: ${response.status} ${response.statusText}${errorData.error?.message ? ` - ${errorData.error.message}` : ''}`);
    }
    
    const data = await response.json();
    
    // 解析大模型返回的JSON结果
    try {
      // 魔塔平台返回格式与OpenAI兼容
      const content = data.choices[0].message.content.trim();
      const llmResponse = JSON.parse(content);
      
      // 验证返回结果是否包含必要字段
      if (!llmResponse.rootCause || !llmResponse.confidence || !llmResponse.codePosition || !llmResponse.fixSuggestion) {
        throw new Error('大模型返回结果缺少必要字段');
      }
      
      return llmResponse;
    } catch (parseError) {
      // 如果解析失败，尝试提取文本中的关键信息
      console.error('解析大模型返回结果失败:', parseError);
      const content = data.choices[0].message.content;
      
      // 尝试从自然语言中提取信息
      return {
        rootCause: content.match(/问题的根本原因[:：]\s*(.*?)(?=\n|$)/i)?.[1] || 
                  content.match(/根本原因[:：]\s*(.*?)(?=\n|$)/i)?.[1] || 
                  '分析失败',
        confidence: parseInt(content.match(/置信度[:：]\s*(\d+)%?/i)?.[1] || '80'),
        codePosition: content.match(/代码位置[:：]\s*(.*?)(?=\n|$)/i)?.[1] || 
                     content.match(/位置[:：]\s*(.*?)(?=\n|$)/i)?.[1] || 
                     '未知',
        fixSuggestion: content.match(/修复建议[:：]\s*(.*?)(?=\n|$)/i)?.[1] || 
                      content.match(/建议[:：]\s*(.*?)(?=\n|$)/i)?.[1] || 
                      '请查看详细分析'
      };
    }
  } catch (error) {
    console.error('大模型API调用失败:', error);
    
    // 调用失败时返回模拟结果
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      rootCause: '根据本地代码分析，mapNodeField函数中目标字段未定义，导致字段映射错误',
      confidence: 85,
      codePosition: `${inputData.localCodePath || 'src'}/flow/mapping.js:58 (mapNodeField函数)`,
      fixSuggestion: `1. 检查${inputData.localCodePath || 'src'}/flow/mapping.js文件中的mapNodeField函数；2. 确保sourceField变量已正确定义；3. 添加字段存在性检查`
    };
  }
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
      
      // 步骤3：检索关联代码（优先使用本地代码路径）
      const codeList = values.localCodePath 
        ? readLocalCode(values.localCodePath, keywords)
        : searchCodeByKeyword(keywords);
      setCodeSnippets(codeList);
      
      // 步骤4：准备分析数据
      const inputData = {
        ...values,
        logContent,
        codeSnippets: codeList,
        submitFormData: JSON.parse(values.submitFormData || '{}'),
        echoFormData: JSON.parse(values.echoFormData || '{}')
      };
      
      // 步骤5：规则引擎匹配根因（传统规则分析）
      const matchedRule = RULE_ENGINE.find(rule => rule.condition(inputData));
      const ruleResult = matchedRule?.result || {
        rootCause: '未匹配到已知规则，可能是引擎底层逻辑异常',
        confidence: 50,
        codePosition: '未知',
        fixSuggestion: '1. 查看全链路日志；2. 检查流程引擎核心逻辑'
      };
      
      // 步骤6：大模型深度分析（结合本地代码和日志）
      const llmResult = await callLLM(inputData);
      
      // 步骤7：综合分析结果（规则引擎+大模型）
      // 优先使用大模型结果，或根据置信度选择
      const finalResult = llmResult.confidence > ruleResult.confidence 
        ? llmResult 
        : ruleResult;
      
      setAnalysisResult({
        success: true,
        logContent,
        ruleResult: ruleResult,
        llmResult: llmResult,
        finalResult: finalResult
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
      
      {/* 大模型使用说明 */}
      <Alert
        message="魔塔平台大模型配置说明"
        description={
          <>
            <p>1. 请在魔塔平台注册账号获取API Key：<a href="https://modelscope.cn" target="_blank" rel="noopener noreferrer">https://modelscope.cn</a></p>
            <p>2. 在项目根目录的 <code>.env</code> 文件中配置API Key：<code>VITE_META_TOWER_API_KEY=你的API密钥</code></p>
            <p>3. 每日免费额度：2000 tokens，超出需付费</p>
            <p>4. 当前使用模型：<code>{META_TOWER_CONFIG.MODEL_NAME}</code></p>
            {META_TOWER_CONFIG.API_KEY === 'YOUR_META_TOWER_API_KEY' || META_TOWER_CONFIG.API_KEY === 'YOUR_META_TOWER_API_KEY_HERE' ? (
              <div style={{ marginTop: 10, padding: 10, backgroundColor: '#fff3f3', borderRadius: 4, borderLeft: '3px solid #ff4d4f' }}>
                <Text strong type="danger">注意：当前使用模拟数据，未启用真实大模型调用。请配置API Key以使用真实大模型分析功能。</Text>
              </div>
            ) : null}
          </>
        }
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      
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
            name="localCodePath"
            label="本地代码路径（可选）"
          >
            <Input placeholder="例如：D:/workspace/project/src" />
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
              {/* 最终根因分析 */}
              <div style={{ marginBottom: 20 }}>
                <Title level={4}>最终根因定位</Title>
                <Alert
                  message={`置信度：${analysisResult.finalResult.confidence}% | 分析方式：${analysisResult.finalResult === analysisResult.llmResult ? '大模型深度分析' : '传统规则匹配'}`}
                  description={
                    <>
                      <Paragraph strong>问题原因：</Paragraph>
                      <Paragraph>{analysisResult.finalResult.rootCause}</Paragraph>
                      <Paragraph strong>代码位置：</Paragraph>
                      <Text code style={{ fontSize: 14 }}>
                        {analysisResult.finalResult.codePosition}
                      </Text>
                      <Paragraph strong>修复建议：</Paragraph>
                      <ul>
                        {analysisResult.finalResult.fixSuggestion.split(';').map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </>
                  }
                  type={analysisResult.finalResult.confidence > 80 ? 'success' : 'warning'}
                  showIcon
                />
              </div>
              
              {/* 规则引擎分析结果 */}
              <div style={{ marginBottom: 20 }}>
                <Title level={4}>传统规则分析</Title>
                <Alert
                  message={`置信度：${analysisResult.ruleResult.confidence}%`}
                  description={
                    <>
                      <Paragraph>{analysisResult.ruleResult.rootCause}</Paragraph>
                      <Text code>{analysisResult.ruleResult.codePosition}</Text>
                    </>
                  }
                  type="info"
                  showIcon
                />
              </div>
              
              {/* 大模型分析结果 */}
              <div style={{ marginBottom: 20 }}>
                <Title level={4}>大模型深度分析</Title>
                <Alert
                  message={`置信度：${analysisResult.llmResult.confidence}%`}
                  description={
                    <>
                      <Paragraph>{analysisResult.llmResult.rootCause}</Paragraph>
                      <Text code>{analysisResult.llmResult.codePosition}</Text>
                    </>
                  }
                  type="success"
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