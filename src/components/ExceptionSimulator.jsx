import React, { useState } from 'react';
import { Card, Form, Switch, Select, Slider, Button, Space, Table, Tag, Input, Row, Col } from 'antd';
import { AlertOutlined, PlayCircleOutlined, StopOutlined, ClearOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const ExceptionSimulator = () => {
  const [form] = Form.useForm();
  const [activeExceptions, setActiveExceptions] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [exceptionHistory, setExceptionHistory] = useState([]);

  // 异常类型配置
  const exceptionTypes = [
    {
      id: 'required_field_missing',
      name: '必填项缺失',
      description: '模拟必填字段为空的情况',
      severity: 'high',
      fields: ['billNo', 'consignee', 'shipper', 'vessel', 'voyage'],
    },
    {
      id: 'format_error',
      name: '格式错误',
      description: '模拟数据格式不符合要求的情况',
      severity: 'medium',
      fields: ['containerNo', 'weight', 'volume'],
    },
    {
      id: 'value_out_of_range',
      name: '数值超出范围',
      description: '模拟数值超出允许范围的情况',
      severity: 'high',
      fields: ['quantity', 'weight', 'volume'],
    },
    {
      id: 'data_inconsistency',
      name: '数据不一致',
      description: '模拟相关字段数据不一致的情况',
      severity: 'high',
      fields: ['pol', 'pod', 'destination'],
    },
    {
      id: 'business_rule_violation',
      name: '业务规则违反',
      description: '模拟违反业务规则的情况',
      severity: 'critical',
      fields: ['billType', 'packageType', 'cargoInfo'],
    },
    {
      id: 'duplicate_data',
      name: '重复数据',
      description: '模拟重复提交或重复数据的情况',
      severity: 'medium',
      fields: ['billNo', 'bookingNo'],
    },
  ];

  // 生成异常记录
  const generateExceptionRecord = (exceptionType) => {
    const now = new Date();
    const record = {
      id: `exception_${now.getTime()}`,
      time: now.toLocaleString(),
      type: exceptionType.name,
      severity: exceptionType.severity,
      field: exceptionType.fields[Math.floor(Math.random() * exceptionType.fields.length)],
      description: `${exceptionType.description} - 影响字段: ${exceptionType.fields.join(', ')}`,
      status: 'pending',
    };
    return record;
  };

  // 开始模拟异常
  const startSimulation = () => {
    form.validateFields()
      .then(values => {
        console.log('异常模拟配置:', values);
        setSimulationRunning(true);
        
        // 生成初始异常记录
        const newExceptions = [];
        exceptionTypes.forEach(type => {
          if (values.enabledExceptions[type.id]) {
            const record = generateExceptionRecord(type);
            newExceptions.push(record);
          }
        });
        
        setActiveExceptions(newExceptions);
        setExceptionHistory(prev => [...prev, ...newExceptions]);
        
        alert('异常模拟已开始！');
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };

  // 停止模拟异常
  const stopSimulation = () => {
    setSimulationRunning(false);
    setActiveExceptions([]);
    alert('异常模拟已停止！');
  };

  // 清除历史记录
  const clearHistory = () => {
    setExceptionHistory([]);
    alert('历史记录已清除！');
  };

  // 批量生成异常
  const generateBatchExceptions = () => {
    form.validateFields()
      .then(values => {
        const batchCount = values.batchCount || 5;
        const newExceptions = [];
        
        for (let i = 0; i < batchCount; i++) {
          // 随机选择一个启用的异常类型
          const enabledTypes = exceptionTypes.filter(type => values.enabledExceptions[type.id]);
          if (enabledTypes.length > 0) {
            const randomType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
            const record = generateExceptionRecord(randomType);
            newExceptions.push(record);
          }
        }
        
        setExceptionHistory(prev => [...prev, ...newExceptions]);
        alert(`已生成 ${newExceptions.length} 条异常记录！`);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };

  // 历史记录表格列配置
  const historyColumns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '异常类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const colorMap = {
          critical: 'red',
          high: 'orange',
          medium: 'blue',
          low: 'green',
        };
        return <Tag color={colorMap[severity]}>{severity}</Tag>;
      },
    },
    {
      title: '影响字段',
      dataIndex: 'field',
      key: 'field',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          pending: 'blue',
          processed: 'green',
          failed: 'red',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="异常情况模拟" extra={<AlertOutlined style={{ color: '#ff4d4f' }} />}>
        <Form form={form} layout="vertical" initialValues={{ probability: 50, batchCount: 5 }}>
          <h3>1. 异常类型配置</h3>
          {exceptionTypes.map(type => (
            <Card key={type.id} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col span={4}>
                  <Form.Item
                    name={['enabledExceptions', type.id]}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <strong>{type.name}</strong>
                  <Tag color={type.severity === 'critical' ? 'red' : type.severity === 'high' ? 'orange' : 'blue'}>
                    {type.severity}
                  </Tag>
                </Col>
                <Col span={12}>
                  <span style={{ color: '#666' }}>{type.description}</span>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={24}>
                  <Form.Item
                    name={['affectedFields', type.id]}
                    label="影响字段"
                  >
                    <Select mode="multiple" placeholder="选择影响字段">
                      {type.fields.map(field => (
                        <Option key={field} value={field}>{field}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}

          <h3>2. 模拟参数设置</h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="probability" label="异常概率 (%)">
                <Slider min={0} max={100} step={5} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="batchCount" label="批量生成数量">
                <InputNumber min={1} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="customException" label="自定义异常规则">
            <TextArea rows={4} placeholder="输入自定义异常规则描述" />
          </Form.Item>

          <Form.Item>
            <Space size="large">
              {!simulationRunning ? (
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={startSimulation} size="large">
                  开始模拟异常
                </Button>
              ) : (
                <Button danger icon={<StopOutlined />} onClick={stopSimulation} size="large">
                  停止模拟异常
                </Button>
              )}
              <Button icon={<ClearOutlined />} onClick={clearHistory} size="large">
                清除历史记录
              </Button>
              <Button type="default" onClick={generateBatchExceptions} size="large">
                批量生成异常记录
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`活跃异常 (${activeExceptions.length})`}>
        {activeExceptions.length > 0 ? (
          <Table
            columns={[
              { title: '类型', dataIndex: 'type', key: 'type' },
              { title: '严重程度', dataIndex: 'severity', key: 'severity', render: (s) => <Tag color={s === 'critical' ? 'red' : 'orange'}>{s}</Tag> },
              { title: '影响字段', dataIndex: 'field', key: 'field' },
              { title: '时间', dataIndex: 'time', key: 'time' },
            ]}
            dataSource={activeExceptions}
            pagination={false}
            bordered
          />
        ) : (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            当前没有活跃的异常模拟
          </p>
        )}
      </Card>

      <Card title={`异常历史记录 (${exceptionHistory.length})`}>
        {exceptionHistory.length > 0 ? (
          <Table
            columns={historyColumns}
            dataSource={exceptionHistory}
            pagination={{ pageSize: 10 }}
            bordered
          />
        ) : (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            暂无异常历史记录
          </p>
        )}
      </Card>
    </Space>
  );
};

export default ExceptionSimulator;