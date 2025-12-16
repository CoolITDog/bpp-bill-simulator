import React from 'react';
import { Card, Statistic, Row, Col, Typography, Button } from 'antd';
import { BarChartOutlined, AlertOutlined, GitlabOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  return (
    <div>
      <Title level={3}>BPP流程异常智能分析平台</Title>
      <Paragraph>
        欢迎使用BPP流程异常智能分析平台，该平台可以帮助您快速分析BPP流程引擎中的数据异常问题。
      </Paragraph>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card variant="outlined">
            <Statistic
              title="待分析异常"
              value={0}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card variant="outlined">
            <Statistic
              title="已分析案例"
              value={0}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card variant="outlined">
            <Statistic
              title="配置的Git仓库"
              value={0}
              prefix={<GitlabOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="快速开始" variant="outlined">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <Title level={5} style={{ marginBottom: 8 }}>1. 配置Git仓库</Title>
                <Paragraph>首先配置您的BPP流程引擎代码仓库地址，以便系统能够获取相关代码进行分析。</Paragraph>
                <Button type="primary" icon={<GitlabOutlined />} href="#" onClick={() => {
                  // 切换到Git配置页面
                  const event = new CustomEvent('navigateTo', { detail: { tab: 'gitConfig' } });
                  window.dispatchEvent(event);
                }}>
                  前往配置
                </Button>
              </div>
              
              <div>
                <Title level={5} style={{ marginBottom: 8 }}>2. 提交异常数据</Title>
                <Paragraph>提供您的表单异常数据，系统将结合代码分析可能存在的问题。</Paragraph>
                <Button type="primary" icon={<AlertOutlined />} href="#" onClick={() => {
                  // 切换到异常数据分析页面
                  const event = new CustomEvent('navigateTo', { detail: { tab: 'exceptionAnalysis' } });
                  window.dispatchEvent(event);
                }}>
                  提交数据
                </Button>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="平台功能" variant="outlined">
            <ul style={{ listStyleType: 'disc', paddingLeft: 20 }}>
              <li>支持多Git仓库配置</li>
              <li>异常数据导入与解析</li>
              <li>智能代码分析</li>
              <li>异常原因自动推断</li>
              <li>分析结果可视化展示</li>
              <li>历史分析记录查询</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;