import Page from "components/Page";
import React, { useState, useEffect, useRef } from "react";
import {
  Col,
  InputGroup,
  InputGroupAddon,
  Input,
  FormGroup,
  Label,
  Row,
} from "reactstrap";
import { MdReportProblem } from "react-icons/md";
import { Link } from "react-router-dom";
import Typography from "../components/Typography";
import PageSpinner from "../components/PageSpinner";
import Button from "components/Button";
import Snackbar from "components/Snackbar.js";
import bn from "utils/bemnames";
import { ConsoleTransportOptions } from "winston/lib/winston/transports";
const bem = bn.create("page");
const RechargePage = (props) => {
  const razorpay_div = useRef(null);
  const [errorMessage, setErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState(props.auth.user.budget);
  const [money, setMoney] = useState("");
  const [account, setAccount] = useState("");
  const [accountItems, setAccountItems] = useState("");
  const triggerLayer = (token, accesskey, data) => {
    window.Layer.checkout(
      {
        token,
        accesskey,
      },
      function (response) {
        console.log(response);
        var f = document.createElement("form");
        f.setAttribute("method", "post");
        f.setAttribute("action", data.url);
        f.setAttribute("name","layer_payment_int_form");
  
        var i = document.createElement("input");
        i.setAttribute("type", "hidden");
        i.setAttribute("value", data.tokenid);
        i.setAttribute("name", "layer_pay_token_id");
        f.appendChild(i);
        i = document.createElement("input");
        i.setAttribute("type", "hidden");
        i.setAttribute("value", data.mtx);
        i.setAttribute("name", "tranid");
        f.appendChild(i);
        i = document.createElement("input");
        i.setAttribute("type", "hidden");
        i.setAttribute("value", data.amount);
        i.setAttribute("name", "layer_order_amount");
        f.appendChild(i);      
        i = document.createElement("input");
        i.setAttribute("type", "hidden");
        i.setAttribute("value", data.hash);
        i.setAttribute("name", "hash");
        f.appendChild(i);
        i = document.createElement("input");
        i.setAttribute("type", "hidden");
        i.setAttribute("value", '');
        i.setAttribute("name", "fallback_url");
        i.setAttribute("id", "fallback_url");
        f.appendChild(i);
        i = document.createElement("input");
        i.setAttribute("type", "hidden");
        i.setAttribute("value", '');
        i.setAttribute("name", "layer_payment_id");
        i.setAttribute("id", "layer_payment_id");
        
        if (response !== null || response.length > 0) {
          if (response.payment_id !== undefined) {
            i.setAttribute("value", response.payment_id);            
          }
        }
        f.appendChild(i);
        console.log(f);
        if (document.getElementById("payment_div").hasChildNodes()) {
          document.getElementById("payment_div").removeChild(document.getElementById("payment_div").firstChild);
        }
        document.getElementById("payment_div").appendChild(f);
        setTimeout(() => {
          f.submit();
        }, 300);
      },
      function (err) {
        console.log(err);
        alert(err.message);
      }
    );
  };
  const apply = async () => {
    //recharge
    if (money == "") {
      setErrorMessage("Please input the amount to recharge.");
      return;
    }
  
    if (money < 300) {
      setErrorMessage("More than ₹ 300 allowed.");
      return;
    }
    const response = await fetch("/api/recharge", {
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "Authorization": props.auth.userToken

      },
      body: JSON.stringify({ money })
    });
    const data = await response.json();
    if (response.status == 200) {
      const pd = {
        orderId: data.orderId,
        mid: data.mid,
        txnToken: data.txnToken      
      };
      try {
        var f = document.createElement("form");
        f.setAttribute('method', "post");
        f.setAttribute('action', `https://securegw.paytm.in/theia/api/v1/showPaymentPage?mid=${pd.mid}&orderId=${pd.orderId}`);
        const sortedkeys = Object.keys(pd);
        for (var k = 0; k < sortedkeys.length; k++) {
          var i = document.createElement("input"); //input element, text
          i.setAttribute('type', "hidden");
          i.setAttribute('name', sortedkeys[k]);
          i.setAttribute('value', pd[sortedkeys[k]]);
          f.appendChild(i);

        }
        document.getElementsByTagName('body')[0].appendChild(f);
        f.submit();
      } catch (err) {
        console.log(err);
      }
    }
    else
      setErrorMessage(data.error);
  };
  useEffect(() => {
    (async () => {
      const response = await fetch("/api/budget", {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: props.auth.userToken,
        },
      });
      if (response.status == 401) props.history.push("/login");
      const data = await response.json();
      var tmp = props.auth;
      tmp.user.budget = data.budget;
      localStorage.setItem("auth", JSON.stringify(tmp));
      setBudget(data.budget);
      const response1 = await fetch("/static/account.json", {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      const data1 = await response1.json();
      setAccount(data1);
      setAccountItems(Object.getOwnPropertyNames(data1));
    })();
  }, []);
  return (
    <>
      <Row>
        {/* <Col xl={12} lg={12} md={12} style={{textAlign:'center'}}>
          <img src="/img/bank/bank.jpg" style={{width:'300px'}} />
        </Col> */}
        {/* <Col xl={12} lg={12} md={12} style={{padding:"0 30px"}}>
          {accountItems && accountItems.map((ele,key)=>(
            <h6 key={key}>{ele+' '}:{' '+account[ele]}</h6> 
          ))}
          <h6></h6>
        </Col> */}
        <Col xl={12} lg={12} md={12}>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <span className="input-group-text">₹</span>
            </InputGroupAddon>
            <Input
              value={money}
              type="number"
              max="15000"
              min="0"
              placeholder="Enter Recharge amount"
              onChange={(e) => {
                setMoney(e.target.value);
              }}
            />
          </InputGroup>
        </Col>
        <Col xl={12} lg={12} md={12} className="amount-button">
          <Button
            component="a"
            color="reddit"
            round
            className={"ml-3 mr-3 mt-2"}
            onClick={() => setMoney(300)}
          >
            ₹ 300
          </Button>
          <Button
            component="a"
            color="reddit"
            round
            className={"ml-3 mr-3 mt-2"}
            onClick={() => setMoney(1000)}
          >
            ₹ 1000
          </Button>
          <Button
            component="a"
            color="reddit"
            round
            className={"ml-3 mr-3 mt-2"}
            onClick={() => setMoney(2000)}
          >
            ₹ 2000
          </Button>
          <Button
            component="a"
            color="reddit"
            round
            className={"ml-3 mr-3 mt-2"}
            onClick={() => setMoney(5000)}
          >
            ₹ 5000
          </Button>
          <Button
            component="a"
            color="reddit"
            round
            className={"ml-3 mr-3 mt-2"}
            onClick={() => setMoney(10000)}
          >
            ₹ 10000
          </Button>
          <Button
            component="a"
            color="reddit"
            round
            className={"ml-3 mr-3 mt-2"}
            onClick={() => setMoney(15000)}
          >
            ₹ 15000
          </Button>
        </Col>

        <Col md={12} style={{ textAlign: "center" }} className={"mt-3"}>
          {!isLoading ? (
            <Button onClick={apply} color="success">
              {" "}
              Recharge{" "}
            </Button>
          ) : (
            <PageSpinner />
          )}
        </Col>
        <Col md={12} style={{ textAlign: "center" }}>
          <Button
            to="/records/recharge-list"
            component={Link}
            color="info"
            simple
          >
            {" "}
            Recharge Records
          </Button>
        </Col>
        <Col md={12} style={{ textAlign: "center" }}>
          <div ref={razorpay_div}></div>
        </Col>
        <Snackbar
          place="tr"
          color="danger"
          icon={MdReportProblem}
          message={errorMessage}
          open={errorMessage}
          closeNotification={() => setErrorMessage(false)}
          close
        />
      </Row>
      <Row>
        <div style={{ height: "100px" }}></div>
      </Row>
    </>
  );
};

export default RechargePage;
