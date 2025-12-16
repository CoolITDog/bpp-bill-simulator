import React, { useState } from 'react';
import { Layout, Menu, ConfigProvider, Typography } from 'antd';
import { HomeOutlined, GitlabOutlined, AlertOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import './App.css';

// 导入新组件
import Dashboard from './components/Dashboard';
import GitConfig from './components/GitConfig';
import ExceptionAnalysis from './components/ExceptionAnalysis';
import AnalysisResult from './components/AnalysisResult';
import ProblemAnalyzer from './components/ProblemAnalyzer';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [gitRepos, setGitRepos] = useState([]);

  // 更新仓库列表
  const updateGitRepos = (repos) => {
    setGitRepos(repos);
  };

  // 菜单配置项
  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: '仪表盘',
      onClick: () => setActiveTab('dashboard'),
    },
    {
      key: 'problemAnalyzer',
      icon: <AlertOutlined />,
      label: '问题分析器',
      onClick: () => setActiveTab('problemAnalyzer'),
    },
    {
      key: 'gitConfig',
      icon: <GitlabOutlined />,
      label: 'Git仓库配置',
      onClick: () => setActiveTab('gitConfig'),
    },
    {
      key: 'exceptionAnalysis',
      icon: <AlertOutlined />,
      label: '异常数据分析',
      onClick: () => setActiveTab('exceptionAnalysis'),
    },
    {
      key: 'analysisResult',
      icon: <FileTextOutlined />,
      label: '分析结果',
      onClick: () => setActiveTab('analysisResult'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => setActiveTab('settings'),
    },
  ];

  // 根据当前激活的标签页渲染对应的组件
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'problemAnalyzer':
        return <ProblemAnalyzer />;
      case 'gitConfig':
        return <GitConfig gitRepos={gitRepos} updateGitRepos={updateGitRepos} />;
      case 'exceptionAnalysis':
        return <ExceptionAnalysis gitRepos={gitRepos} onAnalysisComplete={setAnalysisResult} />;
      case 'analysisResult':
        return <AnalysisResult result={analysisResult} />;
      case 'settings':
        return <div>系统设置功能开发中...</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header className="header">
          <Title level={2} style={{ color: 'white', margin: 0, fontSize: '24px' }}>BPP流程异常智能分析平台</Title>
        </Header>
        <Layout>
          <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
            <div className="logo" />
            <Menu 
              theme="dark" 
              defaultSelectedKeys={['dashboard']} 
              mode="inline" 
              items={menuItems}
            />
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Content style={{ 
              margin: '24px 0', 
              padding: 24, 
              background: '#fff', 
              minHeight: 280, 
              borderRadius: 8, 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' 
            }}>
              {renderContent()}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;