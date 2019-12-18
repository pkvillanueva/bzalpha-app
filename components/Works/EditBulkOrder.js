/**
 * External dependencies.
 */
import React, { useState } from 'react';
import { map, isEmpty } from 'lodash';
import axios from 'axios';
const { token } = parseCookies();
import { parseCookies } from 'nookies';
import { Row, Col, Form, Input, InputNumber, Select, Checkbox, DatePicker, message } from 'antd';

/**
 * Internal dependencies.
 */
import { ranks } from '~/utils/ranks';
import { currencies } from '~/utils/currencies';
import SelectFetch from '~/components/SelectFetch';
import ModalForm from '~/components/ModalForm';
import styles from './styles.less';

const EditBulkOrder = ( { principalId, principalName, vesselId, vesselName, children, onSave } ) => {
  const [ principal, setPrincipal ] = useState( '' );

  const handleSave = ( { values, form }, done, error ) => {
    const { resetFields } = form;

    axios.post( `${ process.env.API_URL }/wp-json/bzalpha/v1/bz-order/bulk`, values, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ token }`
      },
    } ).then( () => {
      if ( onSave ) onSave( values.vessel );
      resetFields();
      done();
      message.success( 'Order created.' );
    } ).catch( ( err ) => {
      error();
      console.log( err );
      message.error( 'Failed to create an order.' );
    } );
  };

  return (
    <ModalForm
      title="Add New Order"
      className={ styles.editOrderModal }
      width={ '100%' }
      onSave={ handleSave }
      modalForm={ ( getFieldDecorator, { setFieldsValue } ) => (
        <Form>
          <Row gutter={ 36 }>
            <Col lg={ 12 }>
              <Form.Item label="Owner">
                { ! isEmpty( principalId ) || ! isEmpty( vesselId ) ?
                  <SelectFetch
                    disabled={ true }
                    placeholder={ principalName }
                  /> :
                  <SelectFetch
                    value={ principal }
                    allowClear={ true }
                    placeholder="Select owner"
                    dataKey="id"
                    labelKey="name"
                    action={ `${ process.env.API_URL }/wp-json/bzalpha/v1/principal` }
                    onChange={ ( value ) => {
                      setPrincipal( value );
                      setFieldsValue( { vessel: '' } );
                    } }
                  />
                }
              </Form.Item>
              <Form.Item label="Vessel">
                { getFieldDecorator( 'vessel', {
                  rules: [ { required: true, message: 'Vessel is required.' } ],
                  initialValue: vesselId || ''
                } )(
                  <SelectFetch
                    disabled={ ! isEmpty( vesselId ) }
                    allowClear={ true }
                    placeholder={ vesselName ? vesselName : 'Enter vessel name' }
                    action={ `${ process.env.API_URL }/wp-json/bzalpha/v1/vessel` }
                    customParams= { {
                      principal: principalId ? principalId : principal
                    } }
                  />
                ) }
              </Form.Item>
              <Row gutter={ 24 }>
                <Col lg={ 16 }>
                  <Form.Item label="Wage">
                    { getFieldDecorator( 'wage', {} )(
                      <InputNumber placeholder="960" style={ { width: '100%' } } />
                    ) }
                  </Form.Item>
                </Col>
                <Col lg={ 8 }>
                  <Form.Item label="Currency">
                    { getFieldDecorator( 'currency', {
                      initialValue: 'USD'
                    } )(
                      <Select>
                        { map( currencies, ( currency ) => <Select.Option value={ currency.code } key={ currency.code }>{ `(${ currency.symbol }) ${ currency.name }` }</Select.Option> ) }
                      </Select>
                    ) }
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Positions">
                { getFieldDecorator( 'positions', {
                  rules: [ { required: true, message: 'Position is required.' } ]
                } )(
                  <Select
                    mode="multiple"
                    placeholder="Select positions"
                    showSearch={ true }
                  >
                    { map( ranks, ( rank ) => <Select.Option value={ rank.value } key={ rank.value }>{ rank.name }</Select.Option> ) }
                  </Select>
                ) }
              </Form.Item>
            </Col>
            <Col lg={ 12 }>
              <Row gutter={ 24 }>
                <Col lg={ 12 }>
                  <Form.Item label="Port">
                    { getFieldDecorator( 'port', {} )(
                      <Input />
                    ) }
                  </Form.Item>
                </Col>
                <Col lg={ 12 }>
                  <Form.Item label="Uniform">
                    { getFieldDecorator( 'uniform', {
                      valuePropName: 'checked'
                    } )(
                      <Checkbox />
                    ) }
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={ 24 }>
                <Col lg={ 12 }>
                  <Form.Item label="Join Date">
                    { getFieldDecorator( 'sign_on', {} )(
                      <DatePicker placeholder="YYYY-MM-DD" />
                    ) }
                  </Form.Item>
                </Col>
                <Col lg={ 12 }>
                  <Form.Item label="Deadline">
                    { getFieldDecorator( 'deadline', {} )(
                      <DatePicker placeholder="YYYY-MM-DD" />
                    ) }
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Contract" className={ styles.contractField }>
                <Form.Item className={ styles.item }>
                  { getFieldDecorator( 'contract_plus', {} )(
                    <InputNumber placeholder="0" />
                  ) }
                </Form.Item>
                <span className={ styles.unit }>+/-</span>
                <Form.Item className={ styles.item }>
                  { getFieldDecorator( 'contract_minus', {} )(
                    <InputNumber placeholder="0" />
                  ) }
                </Form.Item>
              </Form.Item>
              <Form.Item label="Remark">
                { getFieldDecorator( 'remark', {} )(
                  <Input.TextArea rows={ 6 } />
                ) }
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ) }
    >
      { children }
    </ModalForm>
  );
};

export default EditBulkOrder;