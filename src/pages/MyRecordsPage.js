import Page from 'components/Page';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Col,
  Row, Table
} from 'reactstrap';
import {
  FaRegTired, FaFileUpload, FaHourglassHalf,
  FaArrowCircleLeft, FaRegCheckCircle, FaRegTimesCircle
} from 'react-icons/fa';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { Link } from 'react-router-dom';
import Typography from '../components/Typography';
import StyledTab from "components/StyledTab";
import StyledTabs from "components/StyledTabs";
import { Pagination, PaginationItem } from '@material-ui/lab';
import bn from 'utils/bemnames';
const bem = bn.create('page');
const MyRecordsPage = (props) => {
  const [records, setRecords] = useState('');
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(1);
  const [tab, setTab] = React.useState(0);
  const handleChange = (event, newValue) => {
    setTab(newValue);
    setPage(1);
  };
  useEffect(() => {
    (async () => {

      const response = await fetch("/api/my-records/" + tab + "/" + page, {
        "method": "GET",
        "headers": {
          "content-type": "application/json",
          "Authorization": props.auth.userToken
        }
      });
      if (response.status == 401)
        props.history.push('/login');
      try {
        if (response.status < 400) {
          const data = await response.json();
          setRecords(data.my_records);
          setLast(parseInt(data.last_records_my_page));
        }

      } catch (err) {

      }

    })();
  }, [page, tab]);
  return (
    <Page title={(<Link to="/account"><Typography type="h4" className={bem.e('title')}><FaArrowCircleLeft /> My Records</Typography></Link>)} className="MyPage"  >
      <StyledTabs variant="scrollable" value={tab} onChange={handleChange} aria-label="styled tabs example">
        <StyledTab label="Weekly" value={0} />
        <StyledTab label="Daily" value={1} />
        <StyledTab label="Hourly" value={2} />
        <StyledTab label="Color" value={3} />
        <StyledTab label="Flip" value={4} />
      </StyledTabs>
      <Row>
        {
          tab > 2 ? (
            <Col xl={12} lg={12} md={12}>
              <Table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Betting Amount</th>
                    <th>Select</th>
                    <th>Result</th>
                    <th>Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    records ? records.map((ele, key) => (
                      <tr key={key}>
                        <td>{ele.period}</td>
                        <td>₹ {ele.contract}</td>
                        <td>{tab == 3 ? (ele.select === 10 ? (<span className="green-circle"></span>) : (
                          ele.select === 11 ? (<span className="red-circle"></span>) : (
                            ele.select === 12 ? (<span className="violet-circle"></span>) : ele.select
                          )
                        )
                        ) : (
                          ele.select
                        )

                        }</td>
                        <td>{ele.result}{' '} {
                          tab == 3 ? (
                            parseInt(ele.result) % 2 === 1 ? (<span className="green-circle"></span>) : (<span className="red-circle"></span>)
                          ) : ''} {tab == 1 ? (
                            parseInt(ele.result) % 5 === 0 ? (<span className="violet-circle"></span>) : ""
                          ) : ''}</td>
                        <td>₹ {ele.amount}</td>
                      </tr>
                    )) : ''
                  }

                </tbody>
              </Table>
            </Col>
          ) : (
            <Col xl={12} lg={12} md={12}>
              <Table>
                <thead>
                  <tr>
                    <th>Nonce</th>
                    <th>Ticket</th>
                    <th>Place</th>
                    <th>Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    records ? records.map((ele, key) => (
                      <tr key={key}>
                        <td>{ele.details? ele.details.period : ''}</td>
                        <td>{ele.details? ele.details.ticket : ''}</td>
                        <td>{ele.details? ele.details.place : ''}</td>                        
                        <td>₹ {ele.amount}</td>
                      </tr>
                    )) : ''
                  }

                </tbody>
              </Table>
            </Col>
          )
        }
      </Row>
      <Row>
        <Pagination color="primary" count={last}
          page={page} onChange={(e, v) => setPage(v)}
          renderItem={(item) => <PaginationItem component="a" {...item} />} size="small" />
      </Row>

      <Row>
        <div style={{ "height": '100px' }}></div>
      </Row>
    </Page>
  );
};

export default MyRecordsPage
