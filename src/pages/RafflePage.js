import React, { useState, useEffect } from 'react';
import PageSpinner from '../components/PageSpinner';
import { Redirect, Link } from 'react-router-dom';
import { stateSetter } from '../components/Service';
import {
  Row,
  Col,
  Card,
  Button as ReactStrapButton,
  CardHeader,
  CardBody,
  Table,
  Modal,
  ModalBody,
  ModalFooter, ButtonGroup,
  ModalHeader
} from 'reactstrap';
import Button from 'components/Button';
import Snackbar from "components/Snackbar.js";
import Page from 'components/Page';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import {
  MdReportProblem, MdCheckCircle
} from 'react-icons/md';
import { GiBuyCard } from 'react-icons/gi';

import { FaAngleDown, FaSyncAlt } from 'react-icons/fa';
import StyledTab from "components/StyledTab";
import StyledTabs from "components/StyledTabs";
import Typography from '../components/Typography';
import bn from 'utils/bemnames';
const bem = bn.create('page');

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 30,
    overflow: 'hidden',
    width: 40,
    '& svg': {
      display: 'none'
    },
    '& ul': {
      width: 35
    },
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  tickets: {
    borderRadius: '3px',
    padding: '3px 5px ',
    backgroundColor: '#aaa',
    color: 'gold',
    border: '1px solid grey'
  },
  timer: {
    color: "#16bdf9",
    marginLeft: '30px'
  },
  timerUrgent: {
    color: "red",
    marginLeft: '30px'
  }
}));

const RafflePage = (props) => {
  const classes = useStyles();
  const [errorStatus, setErrorStatus] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [tab, setTab] = React.useState('hourly');
  const [first, setFirst] = useState(0);
  const [second, setSecond] = useState(0);
  const [third, setThird] = useState(0);
  const [fourth, setFourth] = useState(0);
  const [soldTickets, setSoldTickets] = useState([{ ticket: 12, userid: { nickname: 'mamber' } }, { ticket: 23, userid: { nickname: 'test' } }]);
  const [time, setTime] = useState(3600);
  const [nonce, setNonce] = useState('');
  const [hash, setHash] = useState('');
  const [fairness_modal, setFairness_Modal] = useState(false);
  const [prize_modal, setPrize_Modal] = useState(false);

  useEffect(() => {

    const timer = setTimeout(() => {
      if (time <= 1) {
        getRaffle();
      }
      else
        setTime(time - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [time]);
  const handleChange = (event, newValue) => {
    setTab(newValue);
  };
  const getRaffle = async () => {
    fetch("/api/raffle/" + tab, {
      "method": "GET",
      "headers": {
        "content-type": "application/json",
        "Authorization": props.auth.userToken
      }
    })
      .then(response => {
        if (response.status < 400) {
          response.json().then(res => {
              props.auth.user.budget = res.wallet;
              localStorage.setItem("auth", JSON.stringify(props.auth));
              setTime(res.time);
              setSoldTickets(res.soldTickets);
              setNonce(res.period);
              setHash(res.hash);

          });
        } else if (response.status == 400) {
          response.json().then(res => {
            setErrorStatus(true);
            setErrorMessage(res.message);
            setTime(res.time);
          });
        } else {
          setErrorStatus(true);
          setErrorMessage("Server error!");
        }
      });
  }
  useEffect(() => {
    getRaffle();
  }, [tab]);
  const onReload = () => {
    getRaffle();
  }
  const copySeed = () => {
    const tmp_tag = document.createElement("input");
    tmp_tag.value = hash;
    document.body.appendChild(tmp_tag);
    tmp_tag.select();
    document.execCommand("copy");
    document.body.removeChild(tmp_tag);
    setSuccessMessage("Server Hash is copied.");
  };
  const buyAction = async () => {
    fetch("/api/raffle/" + tab, {
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "Authorization": props.auth.userToken
      },
      "body": JSON.stringify({
        first, second, third, fourth
      })
    })
      .then(response => {
        if (response.status < 400) {
          response.json().then(res => {
              props.auth.user.budget = res.wallet;
              localStorage.setItem("auth", JSON.stringify(props.auth));
              setTime(res.time);
              setSoldTickets(res.soldTickets);
              // setSuccessMessage(res.message);

          });
        } else if (response.status == 400) {
          response.json().then(res => {
            setErrorStatus(true);
            setErrorMessage(res.message);
            setTime(res.time);
          });
        } else {
          setErrorStatus(true);
          setErrorMessage("Server error!");
        }
      });
  }
  return (
    <Page
      className="EnjoyPage"
      title={(
        <div className="header-userinfo">
          <img src={`/uploads/avatars/${props.auth.user.avatar ? props.auth.user.id + ".jpg" : "user.png"}`} />
          <div>
            <span className="header-nickname">{props.auth.user.nickname}</span>
            <span className="header-balance"><small>₹</small>{props.auth.user.budget}</span>
          </div>
        </div>
      )}
      breadcrumbs={
        (
          <div className="header-buttons">
            <Button component="a" size="sm"
              color="success" onClick={() => setPrize_Modal(true)}>
              Tickets
              </Button>
            <Button component="a" size="sm"
              color="info" onClick={() => setFairness_Modal(true)}>
              Fairness
              </Button>
            <Button component="a" size="sm"
              color="primary" onClick={() => props.history.push("/wallet")}>
              Recharge
              </Button>
            <ReactStrapButton color="link" onClick={onReload} style={{ "float": "right" }}><FaSyncAlt /></ReactStrapButton>
          </div>
        )
      }
    >

      <StyledTabs variant="fullWidth" value={tab} onChange={handleChange} aria-label="styled tabs example">
        <StyledTab label="Hourly" value="hourly" />
        <StyledTab label="Daily" value="daily" />
        <StyledTab label="Weekly" value="weekly" />
      </StyledTabs>
      <Modal
        isOpen={fairness_modal}
        toggle={() => setFairness_Modal(!fairness_modal)}
        className={props.className}>
        <ModalHeader toggle={() => setFairness_Modal(!fairness_modal)}>The current Nonce and Hash</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={12} lg={12}>
              <div>
                Current Nonce :  {nonce}
              </div>
              <div>
                Current Hash :
              </div>
              <div style={{ overflow: 'auto' }}> {hash}
              </div>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={copySeed}>
            Copy
                      </Button>{' '}
          <Button color="primary" onClick={() => window.open("/fairness.htm")}>
            Verify
                      </Button>{' '}
          <Button onClick={() => setFairness_Modal(!fairness_modal)}>
            Cancel
                      </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={prize_modal}
        toggle={() => setPrize_Modal(!prize_modal)}
        className={props.className}>
        <ModalHeader toggle={() => setPrize_Modal(!prize_modal)}>{tab.toUpperCase()} RAFFLE Tickets</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={12} lg={12}>
              There are {tab == 'hourly' ? '100' : (tab == "daily" ? '1000' : '10000')} tickets.
            </Col>
          </Row>
          {
            tab == "hourly" ? (
              <Row>
                <h5 style={{ padding: '0 20px' }}>Prizes</h5>
                <Col xs={12} lg={12}>
                  <div>
                    Place 1 : <small>₹</small> 1500 (1 ticket)
              </div>
                  <div>
                    Place 2 : <small>₹</small> 500 (2 tickets)
              </div>
                  <div>
                    Place 3 : <small>₹</small> 250 (2 tickets)
              </div>

                </Col>
              </Row>
            ) : (
              tab == "daily" ? (
                <Row>
                  <h5 style={{ padding: '0 20px' }}>Prizes</h5>
                  <Col xs={12} lg={12}>
                    <div>
                      Place 1 : <small>₹</small> 10000 (1 ticket)
                  </div>
                    <div>
                      Place 2 : <small>₹</small> 1000 (5 tickets)
                  </div>
                    <div>
                      Place 3 : <small>₹</small> 500 (10 tickets)
                  </div>
                    <div>
                      Place 4 : <small>₹</small> 200 (25 tickets)
                  </div>
                    <div>
                      Place 4 : <small>₹</small> 100 (50 tickets)
                  </div>
                  </Col>
                </Row>
              ) : (
                <Row>
                  <h5 style={{ padding: '0 20px' }}>Prizes</h5>
                  <Col xs={12} lg={12}>
                    <div>
                      Place 1 : <small>₹</small> 500000 (1 ticket)
                  </div>
                    <div>
                      Place 2 : <small>₹</small> 100000 (5 tickets)
                  </div>
                    <div>
                      Place 3 : <small>₹</small> 50000 (10 tickets)
                  </div>
                    <div>
                      Place 4 : <small>₹</small> 20000 (25 tickets)
                  </div>
                    <div>
                      Place 5 : <small>₹</small> 10000 (50 tickets)
                  </div>
                    <div>
                      Place 6 : <small>₹</small> 5000 (60 tickets)
                  </div>
                    <div>
                      Place 7 : <small>₹</small> 2000 (100 tickets)
                  </div>
                  </Col>
                </Row>
              )
            )
          }
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setPrize_Modal(!prize_modal)}>
            Close
                      </Button>
        </ModalFooter>
      </Modal>

      <Row>
        <Card style={{ width: "calc(100% - 20px)", marginLeft: 'auto', marginRight: 'auto', marginTop: '10px' }}>
          <CardHeader>
            Buy the ticket (<small>₹</small> {tab == 'weekly' ? "1000" : "100"})

            <small className={time > 300 ? classes.timer : classes.timerUrgent}>{time > 24 * 3600 ? Math.floor(time / (24 * 3600)) + "d, " : ""}{(time % (24 * 3600)) > 3600 ? Math.floor((time % (24 * 3600)) / 3600) + " : " : ""}{Math.floor(((time % (24 * 3600)) % 3600) / 60) + " : " + Math.floor(((time % (24 * 3600)) % 60) % 60)}</small>

          </CardHeader>
          <CardBody style={{ 'padding': '5px 15px' }}>
            <Row>
              <Col xs={12} lg={12} style={{ textAlign: 'center' }}>
                {tab == "weekly" ? (
                  <FormControl variant="outlined" className={classes.formControl}>
                    <Select
                      id="demo-simple-select-outlined4"
                      value={fourth}
                      onChange={(e) => setFourth(e.target.value)}
                    >
                      <MenuItem value={0}>0</MenuItem>
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                      <MenuItem value={4}>4</MenuItem>
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={6}>6</MenuItem>
                      <MenuItem value={7}>7</MenuItem>
                      <MenuItem value={8}>8</MenuItem>
                      <MenuItem value={9}>9</MenuItem>
                    </Select>
                  </FormControl>
                ) : ''}
                {tab != "hourly" ? (
                  <FormControl variant="outlined" className={classes.formControl}>
                    <Select
                      id="demo-simple-select-outlined3"
                      value={third}
                      onChange={(e) => setThird(e.target.value)}
                    >
                      <MenuItem value={0}>0</MenuItem>
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                      <MenuItem value={4}>4</MenuItem>
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={6}>6</MenuItem>
                      <MenuItem value={7}>7</MenuItem>
                      <MenuItem value={8}>8</MenuItem>
                      <MenuItem value={9}>9</MenuItem>
                    </Select>
                  </FormControl>
                ) : ''}
                <FormControl variant="outlined" className={classes.formControl}>
                  <Select
                    id="demo-simple-select-outlined2"
                    value={second}
                    onChange={(e) => setSecond(e.target.value)}
                  >
                    <MenuItem value={0}>0</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={7}>7</MenuItem>
                    <MenuItem value={8}>8</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="outlined" className={classes.formControl}>
                  <Select
                    id="demo-simple-select-outlined1"
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                  >
                    <MenuItem value={0}>0</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={7}>7</MenuItem>
                    <MenuItem value={8}>8</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                  </Select>
                </FormControl>
              </Col>
              <Col xs={12} lg={12} style={{ textAlign: 'center' }}>
                <Button color="success" onClick={buyAction}><GiBuyCard /> Buy</Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Row>
      <Row>
        <Card className="mt-3" style={{ width: "calc(100% - 20px)", marginLeft: 'auto', marginRight: 'auto' }}>
          <CardHeader>
            Tickets already sold
          </CardHeader>
          <CardBody style={{ 'padding': '5 15px' }}>
            <Row>

              {
                soldTickets.map((ele, key) => (
                  <Col xs={6} sm={4} md={3} style={{ textAlign: 'center' }} key={key}>
                    <span className={classes.tickets}>Ticket {ele.ticket} </span>: {ele.userid.nickname}
                  </Col>
                ))
              }


            </Row>
          </CardBody>
        </Card>
      </Row>
      <Row>
        <div style={{ "height": '60px' }}></div>
      </Row>
      <Snackbar
        place="tr"
        color="danger"
        icon={MdReportProblem}
        message={errorMessage}
        open={errorStatus}
        closeNotification={() => setErrorStatus(false)}
        close
      />
      <Snackbar
        place="tr"
        color="success"
        icon={MdCheckCircle}
        message={successMessage}
        open={successMessage != false}
        closeNotification={() => setSuccessMessage(false)}
        close
      />
    </Page>
  );
}

export default RafflePage;
