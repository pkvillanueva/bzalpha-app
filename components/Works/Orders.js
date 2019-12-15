import React, { useState, useContext, useEffect } from 'react';
import { Table, Tag, Modal, Icon, Empty } from 'antd';
import { map, isEmpty, filter } from 'lodash';
import { parseCookies } from 'nookies';
import axios from 'axios';
import RankAvatar from './RankAvatar';
import OrderPending from './OrderPending';
import withProvider from '~/utils/withProvider';
import { OrdersProvider, OrdersContext } from '~/store/orders';
import styles from './styles.less';

const Orders = ( { vessel } ) => {
  const [ loading, setLoading ] = useState( true );
  const [ orders, setOrders ] = useState( {} );

  const fetchOrders = () => {
    const { token } = parseCookies();
    setLoading( true );

    axios.get( `${ process.env.API_URL }/wp-json/bzalpha/v1/bz-order`, {
      params: {
        vessel: vessel,
        posts_per_page: -1
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ token }`
      }
    } ).then( ( res ) => {
      setOrders( res.data );
    } ).finally( () => {
      setLoading( false );
    } );
  };

  // Initial fetch.
  useEffect( fetchOrders, [] );

  if ( loading ) {
    return (
      <div className={ styles.vesselLoading }>
        <Icon type="loading" />
      </div>
    );
  } else if ( isEmpty( orders ) ) {
    return <Empty />;
  }

  const deleteOrder = ( id ) => {
    const { token } = parseCookies();
    id = parseInt( id );
    setLoading( true );

    axios.delete( `${ process.env.API_URL }/wp-json/bzalpha/v1/bz-order/${ id }`, {
      headers: { 'Authorization': `Bearer ${ token }` },
      data: {
        id: id,
        force: 'true'
      }
    } ).then( () => {
      setOrders( filter( orders, order => order.id !== id ) );
    } ).finally( () => {
      setLoading( false );
    } );
  }

  const handleDelete = ( id ) => {
    Modal.confirm( {
      title: 'Are you sure cancel this order?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => deleteOrder( id )
    } );
  }

  const columns = [
    {
      dataIndex: 'position',
      key: 'position',
      width: 65,
      render: ( position ) => <RankAvatar>{ position }</RankAvatar>
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      className: styles.orderId,
      render: ( id, { position, seaman } ) => {
        return `${ position && `${ position }-` }${ id }${ seaman ? ` ${ seaman.post_title }` : '' }`;
      }
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      width: '5%',
      render: ( orderStatus ) => <Tag>{ orderStatus }</Tag>
    },
    {
      title: 'Details',
      dataIndex: 'seaman',
      key: 'seaman',
      render: ( seaman ) => seaman && seaman.title
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      align: 'right',
      render: ( actions, { id } ) => {
        return (
          <Icon type="delete" onClick={ () => handleDelete( id ) } />
        );
      }
    }
  ];

  const expandedRowRender = ( order ) => {
    switch ( order.order_status ) {
      case 'pending':
        return <OrderPending data={ order } />
    }

    return null;
  };

  return (
    <Table
      className={ styles.orders }
      pagination={ false }
      columns={ columns }
      defaultExpandAllRows={ true }
      expandedRowRender={ expandedRowRender }
      dataSource={ map( orders, ( order ) => ( { key: order.id, ...order } ) ) }
    />
  )
};

export default withProvider( OrdersProvider, Orders );
