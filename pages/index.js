
import styles from '../styles/Home.less'
import React, { useEffect, useState } from 'react';
import {
  Form, Table, Switch, message,
} from 'antd';
// import { SearchOutlined } from '../../components/Icon';
import * as dayjs from 'dayjs';
import { decode } from 'js-base64'
import { fetchData, throttle, queryURLParams } from '../utils';
import { WECHAT_MALL_ACTIVITIES } from '../config'



// const { RangePicker } = DatePicker;
// const { Option } = Select;

let throttleResize = null;
const Home = () => {

  // const classes = useStyles();
  // const [clientWidth, setClintWidth] = useState(1001);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // const [form] = Form.useForm();

  const updateStatus = (info, value, record) => {
    const v = {
      ...info,
      status: value ? 1 : 0,
      promotionID: record.promotionID
    }
    fetchData('/crm_h/promotion_updatePromotionStatusByShop.ajax', {  method: 'GET', type: '', ...v })
      .then((res) => {
        if (res.code === '000') {
          message.success('修改成功');
          getInitTableData();
        } else {
          message.error('修改失败')
        }
      })
      .catch((error) => {
        console.error(error);
      })
  }

  const handleChangeChecked = (value, record) => {
    getSigns({status: value ? 1 : 0, promotionID: record.promotionID}).then((res) => {
      if (res.success === 'true' && res.code === '000') {
        // setInfo(response.data);
        updateStatus(res.data, value, record);
        // ...
      } else {
        return message.error(res.msg || '请求失败！')
      }
    })
    
  }
  // isActive 表示当前店铺的活动启动状态，因ProtoBuf的序列化问题，可能存在isActive=0的时候无此字段，因此当isActive不存在则和isActive=0同含义。
  // 为空判断
  const columns = () => ([
    {
      title: '序号',
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: '启用/暂停',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      render: (text, record, index) => {
        const defaultChecked = (record.isActive == '1' ? true : false);
        return (
          <Switch
            // size="small"
            checkedChildren='启用'
            unCheckedChildren='暂停'
            defaultChecked={defaultChecked}
            onChange={(v) => handleChangeChecked(v, record)}
          />
        )
      }
    },
    {
      title: '活动类型',
      dataIndex: 'promotionType',
      render: (promotionType) => {
        const text = (WECHAT_MALL_ACTIVITIES.find(({ key }) => key === `${promotionType}`) || {}).title
        return (<span title={text}>{text || '--'}</span>);
      },
    },
    {
      title: '活动名称',
      dataIndex: 'promotionName',
      className: '',
      render: (text) => (text || '--')
    },
    {
      title: '活动编码',
      dataIndex: 'promotionCode',
      className: '',
      render: (text) => (text || '--')
    },
    {
      title: '有效时间',
      dataIndex: 'startDate',
      className: '',
      render: (validDate, record) => {
        //  dayjs(new Date()).format('YYYYMMDDHHmmss')
        if (record.startDate == '0' || record.endDate == '0' ||
          record.startDate == '20000101' || record.endDate == '29991231') {
          return '不限制';
        }
        return validDate && record.endDate ? `${dayjs(record.startDate).format('YYYY-MM-DD HH:mm:ss')} - ${dayjs(record.endDate).format('YYYY-MM-DD HH:mm:ss')}` : '--';
      }
    },
    {
      title: '有效状态',
      dataIndex: 'isActive',
      className: '',
      align: 'center',
      render: (text) => {
        if (text == '1') {
          return <span className={styles.open}>执行中</span>
        } else if (text == '0') {
          return  <span className={styles.puse}>暂停中</span>
        }
      }
    },
    {
      title: '创建时间/修改时间',
      dataIndex: 'createTime',
      className: '',
      render: (validDate, record) => {
        //  dayjs(new Date()).format('YYYYMMDDHHmmss')
      return validDate ? `${dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')} - ${dayjs(record.actionTime).format('YYYY-MM-DD HH:mm:ss')}` : '--';
      },
    },
  ]);

  const getTableData = (params) => {
    const p = params;
    ///crm_h/promotion_getPromotionByShop.ajax?groupID=${groupID}&shopID=${shopID}&timestamp=${timestamp}&devKey=${devKey}&sign=${sign}
    fetchData(`/crm_h/promotion_getPromotionByShop.ajax`, {  method: 'GET', type: '', ...p })
      .then((res) => {
        const data = { promotionLst: [], ...res.data };
        // const pageObj = { pageNo: +data.pageNo, total: +data.totalSize };
        if (data.promotionLst && data.promotionLst.length > 0) {
          const pageObj = data.page;
          const dataList = data.promotionLst.map((item, id) => ({ ...item.master, id}))
          console.log('dataList: ', dataList);
          setData(dataList);
          setTotal(pageObj.totalSize);
          setPageSize(pageObj.pageSize);
        } else {
          setData([]);
        }
      })
      .catch((err) => { console.log(err) });
  }

  const getParams = () => {
    const href = queryURLParams(window.location.href);
    // window.location.search(window.location.href)
    // console.log('href: ', href);
    if (href.url) {
      const decodeHref = decodeURIComponent(href.url);
      const resultObj = queryURLParams(decodeHref);
      if (resultObj.paramLst) {
        return decode(resultObj.paramLst)
      }
    }
    return {};
  }

  const getSains = (params, options = {}) => {
      return fetchData('/crm_h/sain', {...options, accessToken: 'MDB_EMPLOYEE_SESSIONd3bd217f2b574f6b9d7b1892778bf13b' || '', ip: 'http://192.168.7.77:8090/saas/out/get'})
        .then((res) => {
          return res
        })
        .catch((err) => {
          return err
        })
  }


  // useEffect(() => {
  //   onResize();
  //   window.addEventListener('resize', throttleResize, false);
  //   return () => {
  //     window.removeEventListener('resize', throttleResize, false);
  //   };
  // }, [throttleResize]);
  const getSigns = (options = {}) => {
    const getUrlParams = getParams();
    async function getSain(getUrlParams) {
      const response = await getSains({...JSON.parse(getUrlParams)}, {...options});
      return response;
    }
    return getSain(getUrlParams);
  }

  const getInitTableData = () => {
    getSigns().then((res) => {
      if (res.success === 'true' && res.code === '000') {
        getTableData(res.data);
      } else {
        return message.error(res.msg || '请求失败！')
      }
   });
  }

  useEffect(() => {
    getInitTableData();
  }, [pageNo, pageSize])

  const handleChangePage = (currentPage, curPageSize) => {
    console.log('currentPage, pageSize: ', currentPage, pageSize);
    if (currentPage !== pageNo || pageSize !== curPageSize) {
      setPageNo(currentPage);
      setPageSize(curPageSize)
    }

  }

  return (
    <div className={styles.homeBox}>
      {/* <div className="home-box"> */}
      <div className={[styles.titleBox, styles.line].join(' ')}><h2 className="title">基础营销设置</h2></div>
      <div className={styles.tableBox}>
        <Table
          columns={columns()}
          dataSource={data}
          rowKey="id"
          pagination={{
            pageSize,
            pageNo,
            showSizeChanger: true,
            showQuickJumper: true,
            total,
            showTotal: (total, range) => `本页${range[0]}-${range[1]}/ 共 ${total}条`,
            position: ['none', 'bottomLeft'],
            onChange: (page, pageSize) => {
              handleChangePage(page, pageSize)
            },
          }}
          bordered
          scroll={{ x: 1800 }}
        // size="small"
        />
      </div>
    </div>
  )
}

export default Home;
Home.getInitialProps = function () {
  return {
      pageTitle: 'Next-H5',
      list: Array.from({length:100}, (v,k) => k),
      // sain: getUrlParams()
  }
}