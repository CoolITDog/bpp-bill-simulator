import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Table, Button, Space, Card, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const BillForm = () => {
  const [form] = Form.useForm();
  const [cargoData, setCargoData] = useState([
    {
      key: '1',
      cargoName: '',
      quantity: 0,
      weight: 0,
      volume: 0,
      packageType: '',
      description: '',
    },
  ]);

  // 货物明细表格列配置
  const columns = [
    {
      title: '货物名称',
      dataIndex: 'cargoName',
      key: 'cargoName',
      render: (text, record, index) => (
        <Form.Item
          name={['cargoInfo', index, 'cargoName']}
          rules={[{ required: true, message: '请输入货物名称' }]}
        >
          <Input placeholder="请输入货物名称" />
        </Form.Item>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record, index) => (
        <Form.Item
          name={['cargoInfo', index, 'quantity']}
          rules={[{ required: true, message: '请输入数量' }]}
        >
          <InputNumber min={1} placeholder="数量" />
        </Form.Item>
      ),
    },
    {
      title: '重量(kg)',
      dataIndex: 'weight',
      key: 'weight',
      render: (text, record, index) => (
        <Form.Item
          name={['cargoInfo', index, 'weight']}
          rules={[{ required: true, message: '请输入重量' }]}
        >
          <InputNumber min={0.1} step={0.1} placeholder="重量" />
        </Form.Item>
      ),
    },
    {
      title: '体积(m³)',
      dataIndex: 'volume',
      key: 'volume',
      render: (text, record, index) => (
        <Form.Item
          name={['cargoInfo', index, 'volume']}
          rules={[{ required: true, message: '请输入体积' }]}
        >
          <InputNumber min={0.1} step={0.1} placeholder="体积" />
        </Form.Item>
      ),
    },
    {
      title: '包装类型',
      dataIndex: 'packageType',
      key: 'packageType',
      render: (text, record, index) => (
        <Form.Item
          name={['cargoInfo', index, 'packageType']}
          rules={[{ required: true, message: '请选择包装类型' }]}
        >
          <Select placeholder="选择包装类型">
            <Option value="carton">纸箱</Option>
            <Option value="wooden">木箱</Option>
            <Option value="pallet">托盘</Option>
            <Option value="container">集装箱</Option>
          </Select>
        </Form.Item>
      ),
    },
    {
      title: '货物描述',
      dataIndex: 'description',
      key: 'description',
      render: (text, record, index) => (
        <Form.Item name={['cargoInfo', index, 'description']}>
          <TextArea rows={2} placeholder="货物描述" />
        </Form.Item>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record, index) => (
        <Space size="middle">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              const newData = [...cargoData];
              newData.splice(index, 1);
              setCargoData(newData);
            }}
            disabled={cargoData.length === 1}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 添加货物明细行
  const addCargoRow = () => {
    const newData = [...cargoData];
    newData.push({
      key: `${newData.length + 1}`,
      cargoName: '',
      quantity: 0,
      weight: 0,
      volume: 0,
      packageType: '',
      description: '',
    });
    setCargoData(newData);
  };

  // 提交表单
  const onFinish = (values) => {
    console.log('提单数据:', values);
    // 这里可以添加提交到BPP流程引擎的逻辑
    alert('提单数据已提交！');
  };

  // 保存表单数据
  const saveFormData = () => {
    form.validateFields()
      .then(values => {
        console.log('保存的提单数据:', values);
        localStorage.setItem('billData', JSON.stringify(values));
        alert('提单数据已保存到本地！');
      })
      .catch(info => {
        console.log('保存失败:', info);
      });
  };

  return (
    <Card title="提单数据模拟" extra={<Button icon={<SaveOutlined />} onClick={saveFormData}>保存模板</Button>}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          basicInfo: {
            billType: 'import',
          },
        }}
      >
        <h3>一、基本信息</h3>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name={['basicInfo', 'billNo']}
              label="提单号"
              rules={[{ required: true, message: '请输入提单号' }]}
            >
              <Input placeholder="请输入提单号" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['basicInfo', 'billType']}
              label="提单类型"
              rules={[{ required: true, message: '请选择提单类型' }]}
            >
              <Select placeholder="选择提单类型">
                <Option value="import">进口</Option>
                <Option value="export">出口</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['basicInfo', 'bookingNo']}
              label="订舱号"
              rules={[{ required: true, message: '请输入订舱号' }]}
            >
              <Input placeholder="请输入订舱号" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['basicInfo', 'consignee']}
              label="收货人"
              rules={[{ required: true, message: '请输入收货人' }]}
            >
              <Input placeholder="请输入收货人" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['basicInfo', 'shipper']}
              label="发货人"
              rules={[{ required: true, message: '请输入发货人' }]}
            >
              <Input placeholder="请输入发货人" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['basicInfo', 'notifyParty']}
              label="通知人"
            >
              <Input placeholder="请输入通知人" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['basicInfo', 'billDate']}
              label="提单日期"
              rules={[{ required: true, message: '请选择提单日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <h3>二、运输信息</h3>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name={['transportInfo', 'vessel']}
              label="船名"
              rules={[{ required: true, message: '请输入船名' }]}
            >
              <Input placeholder="请输入船名" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['transportInfo', 'voyage']}
              label="航次"
              rules={[{ required: true, message: '请输入航次' }]}
            >
              <Input placeholder="请输入航次" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['transportInfo', 'containerNo']}
              label="集装箱号"
              rules={[{ required: true, message: '请输入集装箱号' }]}
            >
              <Input placeholder="请输入集装箱号" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name={['transportInfo', 'pol']}
              label="装货港"
              rules={[{ required: true, message: '请输入装货港' }]}
            >
              <Input placeholder="请输入装货港" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['transportInfo', 'pod']}
              label="卸货港"
              rules={[{ required: true, message: '请输入卸货港' }]}
            >
              <Input placeholder="请输入卸货港" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name={['transportInfo', 'destination']}
              label="目的地"
            >
              <Input placeholder="请输入目的地" />
            </Form.Item>
          </Col>
        </Row>

        <h3>三、货物信息</h3>
        <Form.List name="cargoInfo">
          {(fields, { add, remove }) => (
            <>
              <Table
                columns={columns}
                dataSource={cargoData}
                pagination={false}
                bordered
              />
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={addCargoRow}
                  icon={<PlusOutlined />}
                  style={{ width: '100%' }}
                >
                  添加货物明细
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <h3>四、附加信息</h3>
        <Form.Item
          name={['additionalInfo', 'remarks']}
          label="备注"
        >
          <TextArea rows={4} placeholder="请输入备注信息" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} size="large">
              提交提单到BPP流程引擎
            </Button>
            <Button htmlType="reset" size="large">
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BillForm;