import Page from 'components/Page';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Col,
  Row,Table
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
const RecordsPage = (props) => {
  const [records, setRecords] = useState('');
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(1);
  const [tab, setTab] = React.useState('hourly');
  const handleChange = (event, newValue) => {
    setTab(newValue);
    setPage(1);
  };
  useEffect(() => {
    (async () => {

      const response = await fetch("/api/game-records/" + page + "/" + tab, {
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
          await setRecords(data.records);
          await setLast(parseInt(data.last));
        }

      } catch (err) {

      }

    })();
  }, [page, tab]);
  return (
    <Page title={(<Link to="/"><Typography type="h4" className={bem.e('title')}><FaArrowCircleLeft /> Game Records</Typography></Link>)} className="MyPage"  >
      <StyledTabs variant="fullWidth" value={tab} onChange={handleChange} aria-label="styled tabs example">
        <StyledTab label="Hourly" value={'hourly'} />
        <StyledTab label="Daily" value={'daily'} />
        <StyledTab label="Weekly" value={'weekly'} />
      </StyledTabs>
      <Row>
        <Col xl={12} lg={12} md={12}>
          <Table>
            <thead>
              <tr>
                <th>Nonce</th>
                <th>Place</th>
                <th>Ticket</th>
                <th>Prize</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {
                records ? records.map((ele, key) => (
                  <tr key={key}>
                    <td><span>{ele.no}</span></td>
                    <td><span className='place-field' style={ele.place==1 ? {color:'gold'} : (ele.place==2 ? {color:'white'} : (ele.place==3 ? {color:'#CD7F32'} : {}))}>{ele.place}</span></td>
                    <td><span style={{padding:"3px 4px",backgroundColor:"#555", color:"#ffd", display:"inline-block", width:"60px"}}>{ele.ticket}</span></td>
                    <td>{ele.prize}</td>
                    <td>{ele.userid ? ele.userid.nickname : ""}</td>
                  </tr>
                )) : ''
              }

            </tbody>
          </Table>


        </Col>
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

export default RecordsPage 
