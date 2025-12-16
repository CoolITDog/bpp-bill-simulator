import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Timeline, Statistic, Row, Col, Button, Space, Tabs } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, BarChartOutlined } from '@ant-design/icons';

const ProcessMonitor = () => {
  const [processInstances, setProcessInstances] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [processLogs, setProcessLogs] = useState([]);
  const [processMetrics, setProcessMetrics] = useState({
    totalProcesses: 0,
    successfulProcesses: 0,
    failedProcesses: 0,
    averageExecutionTime: 0,
  });

  // 模拟流程实例数据
  useEffect(() => {
    const mockProcesses = [
      {
        id: 'proc_20250001',
        billNo: 'BPP20250001',
        status: 'running',
        startTime: new Date(Date.now() - 300000).toLocaleString(),
        endTime: null,
        executionTime: '5分钟',
        currentStep: '验证提单数据',
        errorCount: 0,
      },
      {
        id: 'proc_20250002',
        billNo: 'BPP20250002',
        status: 'success',
        startTime: new Date(Date.now() - 600000).toLocaleString(),
        endTime: new Date(Date.now() - 450000).toLocaleString(),
        executionTime: '2分钟30秒',
        currentStep: '完成',
        errorCount: 0,
      },
      {
        id: 'proc_20250003',
        billNo: 'BPP20250003',
        status: 'failed',
        startTime: new Date(Date.now() - 900000).toLocaleString(),
        endTime: new Date(Date.now() - 840000).toLocaleString(),
        executionTime: '1分钟',
        currentStep: '处理货物信息',
        errorCount: 2,
      },
      {
        id: 'proc_20250004',
        billNo: 'BPP20250004',
        status: 'success',
        startTime: new Date(Date.now() - 1200000).toLocaleString(),
        endTime: new Date(Date.now() - 1080000).toLocaleString(),
        executionTime: '2分钟',
        currentStep: '完成',
        errorCount: 0,
      },
      {
        id: 'proc_20250005',
        billNo: 'BPP20250005',
        status: 'failed',
        startTime: new Date(Date.now() - 1500000).toLocaleString(),
        endTime: new Date(Date.now() - 1440000).toLocaleString(),
        executionTime: '1分钟',
        currentStep: '验证运输信息',
        errorCount: 1,
      },
    ];

    setProcessInstances(mockProcesses);

    // 更新统计指标
    const total = mockProcesses.length;
    const successful = mockProcesses.filter(p => p.status === 'success').length;
    const failed = mockProcesses.filter(p => p.status === 'failed').length;
    const avgTime = mockProcesses
      .filter(p => p.executionTime)
      .reduce((sum, p) => sum + parseInt(p.executionTime), 0) / (successful + failed) || 0;

    setProcessMetrics({
      totalProcesses: total,
      successfulProcesses: successful,
      failedProcesses: failed,
      averageExecutionTime: avgTime,
    });
  }, []);

  // 模拟流程日志数据
  useEffect(() => {
    if (selectedProcess) {
      const mockLogs = [
        {
          id: `log_${selectedProcess.id}_1`,
          time: new Date(Date.now() - 300000).toLocaleString(),
          level: 'info',
          message: `开始处理提单: ${selectedProcess.billNo}`,
          step: '初始化',
        },
        {
          id: `log_${selectedProcess.id}_2`,
          time: new Date(Date.now() - 290000).toLocaleString(),
          level: 'info',
          message: '验证提单基本信息',
          step: '验证提单数据',
        },
        {
          id: `log_${selectedProcess.id}_3`,
          time: new Date(Date.now() - 280000).toLocaleString(),
          level: 'info',
          message: '验证货物信息',
          step: '处理货物信息',
        },
        {
          id: `log_${selectedProcess.id}_4`,
          time: new Date(Date.now() - 270000).toLocaleString(),
          level: 'info',
          message: '验证运输信息',
          step: '验证运输信息',
        },
        {
          id: `log_${selectedProcess.id}_5`,
          time: new Date(Date.now() - 260000).toLocaleString(),
          level: 'info',
          message: '生成流程实例ID',
          step: '创建流程实例',
        },
      ];

      // 如果流程失败，添加错误日志
      if (selectedProcess.status === 'failed') {
        mockLogs.push({
          id: `log_${selectedProcess.id}_error`,
          time: new Date(Date.now() - 250000).toLocaleString(),
          level: 'error',
          message: '处理货物信息时发生错误: 数量超出允许范围',
          step: '处理货物信息',
        });
      }

      // 如果流程成功，添加完成日志
      if (selectedProcess.status === 'success') {
        mockLogs.push({
          id: `log_${selectedProcess.id}_success`,
          time: new Date(Date.now() - 250000).toLocaleString(),
          level: 'info',
          message: `提单处理完成: ${selectedProcess.billNo}`,
          step: '完成',
        });
      }

      setProcessLogs(mockLogs);
    }
  }, [selectedProcess]);

  // 流程实例表格列配置
  const processColumns = [
    {
      title: '流程ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '提单号',
      dataIndex: 'billNo',
      key: 'billNo',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          running: { color: 'blue', icon: <LoadingOutlined />, text: '运行中' },
          success: { color: 'green', icon: <CheckCircleOutlined />, text: '成功' },
          failed: { color: 'red', icon: <CloseCircleOutlined />, text: '失败' },
          pending: { color: 'yellow', icon: <ClockCircleOutlined />, text: '待处理' },
        };
        const config = statusConfig[status] || { color: 'gray', icon: <ClockCircleOutlined />, text: '未知' };
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (endTime) => endTime || '-',
    },
    {
      title: '执行时间',
      dataIndex: 'executionTime',
      key: 'executionTime',
    },
    {
      title: '当前步骤',
      dataIndex: 'currentStep',
      key: 'currentStep',
    },
    {
      title: '错误数',
      dataIndex: 'errorCount',
      key: 'errorCount',
      render: (count) => <Tag color={count > 0 ? 'red' : 'green'}>{count}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Button type="link" onClick={() => setSelectedProcess(record)}>
          查看详情
        </Button>
      ),
    },
  ];

  // 流程日志表格列配置
  const logColumns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '日志级别',
      dataIndex: 'level',
      key: 'level',
      render: (level) => {
        const colorMap = {
          info: 'blue',
          warning: 'orange',
          error: 'red',
          debug: 'gray',
        };
        return <Tag color={colorMap[level]}>{level}</Tag>;
      },
    },
    {
      title: '步骤',
      dataIndex: 'step',
      key: 'step',
    },
    {
      title: '日志信息',
      dataIndex: 'message',
      key: 'message',
    },
  ];

  // 流程步骤时间线数据
  const getTimelineItems = () => {
    if (!selectedProcess || !processLogs.length) return [];

    return processLogs.map(log => ({
      children: log.message,
      color: log.level === 'error' ? 'red' : 'blue',
      dot: log.level === 'error' ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
    }));
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 统计指标卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总流程数"
              value={processMetrics.totalProcesses}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功流程数"
              value={processMetrics.successfulProcesses}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="失败流程数"
              value={processMetrics.failedProcesses}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均执行时间(秒)"
              value={processMetrics.averageExecutionTime}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="流程实例列表">
        <Table
          columns={processColumns}
          dataSource={processInstances}
          pagination={{ pageSize: 10 }}
          rowKey="id"
          bordered
        />
      </Card>

      {selectedProcess && (
        <Card title={`流程详情: ${selectedProcess.billNo}`}>
          <Tabs 
            defaultActiveKey="timeline" 
            items={[
              {
                key: 'timeline',
                label: '流程时间线',
                children: <Timeline items={getTimelineItems()} />,
              },
              {
                key: 'logs',
                label: '流程日志',
                children: (
                  <Table
                    columns={logColumns}
                    dataSource={processLogs}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                    bordered
                    scroll={{ y: 400 }}
                  />
                ),
              },
              {
                key: 'metrics',
                label: '流程指标',
                children: (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card>
                        <Statistic
                          title="流程ID"
                          value={selectedProcess.id}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card>
                        <Statistic
                          title="提单号"
                          value={selectedProcess.billNo}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card>
                        <Statistic
                          title="开始时间"
                          value={selectedProcess.startTime}
                          prefix={<ClockCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card>
                        <Statistic
                          title="结束时间"
                          value={selectedProcess.endTime || '运行中'}
                          prefix={<ClockCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card>
                        <Statistic
                          title="执行时间"
                          value={selectedProcess.executionTime}
                          prefix={<ClockCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card>
                        <Statistic
                          title="当前步骤"
                          value={selectedProcess.currentStep}
                        />
                      </Card>
                    </Col>
                  </Row>
                ),
              },
            ]}
          />
        </Card>
      )}
    </Space>
  );
};

export default ProcessMonitor;