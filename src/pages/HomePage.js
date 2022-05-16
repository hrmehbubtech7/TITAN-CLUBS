
import Page from 'components/Page';
import Button from 'components/Button';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  Row
} from 'reactstrap';
import {
  MdReportProblem, MdNotificationsActive
} from 'react-icons/md';
import Snackbar from "components/Snackbar.js";
import { GiLaurelCrown, GiMoneyStack, GiPayMoney, GiTrophy } from "react-icons/gi";
const HomePage = (props) => {
  var [modal, setModal] = useState(false);
  var [listNo, setListNo] = useState(0);
  //carousel
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [list, setList] = useState('');
  const [seniors, setSeniors] = useState([]);
  const [maxBets, setMaxBets] = useState([]);
  const [weeks, setWeeks] = useState(null);
  const [days, setDays] = useState(null);
  const [hours, setHours] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [review, setReview] = useState('');
  const [errorMessage, setErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  //products
  const [listVisible, setListVisible] = useState(list);
  const [items, setItems] = useState('');
  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  }

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  }

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  }
  const [slides, setSlides] = useState('');
  const postFeedback = async () => {
    if (!JSON.parse(localStorage.getItem('auth'))) {
      setErrorMessage("Please login");
      return;
    }
    const response = await fetch("/api/review", {
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "Authorization": JSON.parse(localStorage.getItem('auth')).userToken
      },
      body: JSON.stringify({
        feedback: review
      })
    });
    if (response.status == 200) {
      const data = await response.json();
      setSuccessMessage(data.message);
    } else if (response.status == 400) {
      const data = await response.json();
      setErrorMessage(data.message);
    } else if (response.status == 401) {
      const data = await response.json();
      setErrorMessage("Please login");
    } else {
      setErrorMessage("Server error!");
    }

  }
  //products
  useEffect(() => {
    if (list == '' && items == '' && listVisible == '') {
      (async () => {
        const response = await fetch("/json/List", {
          "method": "GET",
          "headers": {
            "content-type": "application/json"
          }
        });
        const data = await response.json();
        await setList(data.items);
        await setListVisible(data.items);
        await setItems(data.carousel);
        setSlides(data.carousel.map((item) => {
          return (
            <CarouselItem
              onExiting={() => setAnimating(true)}
              onExited={() => setAnimating(false)}
              key={item.src}
            >
              <img src={item.src} alt={item.altText} style={{ width: "100%" }} />
            </CarouselItem>
          );
        }));
      })();
    }
  }, []);
  //products
  useEffect(() => {
    (async () => {
      const response = await fetch("/api/top-users", {
        "method": "GET",
        "headers": {
          "content-type": "application/json"
        }
      });
      const data = await response.json();
      setSeniors(data.seniors);
      setMaxBets(data.maxBets);
      setReviews(data.reviews);
      setDays(data.days);
      setHours(data.hours);
      setWeeks(data.weeks);
    })();
  }, []);
  return (

    <Page
      className="DashboardPage"
    >
      <div className='home-title'>
      <h1>CROWN MALLS</h1>
        <small>Make money everyday with you. <br /> ( The Provably Fair Game. )</small>
      </div>
      {
        slides !== '' && slides.length !== 0 ? (
          <Carousel style={{ 'height': '300px', 'margin': '0 -16px' }}
            activeIndex={activeIndex}
            next={next}
            previous={previous}
          >
            <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
            {slides}
            <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
            <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
          </Carousel>
        ) : ''
      }
      <div className="section-title">
        <h4><span className='text-warning'><GiLaurelCrown /></span> <small>The Last Raffle Results</small>
          <Button component="a" size="sm" simple onClick={()=>props.history.push("/records")}
            color="info">Details</Button></h4>
      </div>
      <h6 style={{ padding: '10px 40px 0 40px' }}>Weekly</h6>
      <ul className="raffle-list">

        {
          weeks ? weeks.map((ele, key) => (
            <li className={(ele.place == 1 ? "first-place" : "second-place")} key={key} >
              <GiTrophy style={ele.place == 1 ? { padding: '5px', borderRadius: '10px', fontSize: '30px', background: '#333', color: 'gold' } : { padding: '5px', borderRadius: '10px', fontSize: '30px', background: '#333', color: 'silver' }} />
              <span className="ticket-no" style={ele.place == 1 ? { color: 'gold' } : { color: 'silver' }}>Ticket - {ele.ticket}</span> {ele.userid ? ele.userid.nickname + ` (${ele.userid.phone}) - Level ${ele.userid.level ? ele.userid.level : '1'}` : ""}
            </li>
          )) : ""
        }
      </ul>
      <h6 style={{ padding: '10px 40px 0 40px' }}>Daily</h6>
      <ul className="raffle-list">

        {
          days ? days.map((ele, key) => (
            <li className={(ele.place == 1 ? "first-place" : "second-place")} key={key} >
              <GiTrophy style={ele.place == 1 ? { padding: '5px', borderRadius: '10px', fontSize: '30px', background: '#333', color: 'gold' } : { padding: '5px', borderRadius: '10px', fontSize: '30px', background: '#333', color: 'silver' }} />
              <span className="ticket-no" style={ele.place == 1 ? { color: 'gold' } : { color: 'silver' }}>Ticket - {ele.ticket}</span> {ele.userid ? ele.userid.nickname + ` (${ele.userid.phone}) - Level ${ele.userid.level ? ele.userid.level : '1'}` : ""}
            </li>
          )) : ""
        }
      </ul>
      <h6 style={{ padding: '10px 40px 0 40px' }}>Hourly</h6>
      <ul className="raffle-list">

        {
          hours ? hours.map((ele, key) => (
            <li className={(ele.place == 1 ? "first-place" : "second-place")} key={key} >
              <GiTrophy style={ele.place == 1 ? { padding: '5px', borderRadius: '10px', fontSize: '30px', background: '#333', color: 'gold' } : { padding: '5px', borderRadius: '10px', fontSize: '30px', background: '#333', color: 'silver' }} />
              <span className="ticket-no" style={ele.place == 1 ? { color: 'gold' } : { color: 'silver' }}>Ticket - {ele.ticket}</span>
              <span style={ele.place == 1 ? { color: 'gold' } : { color: 'silver' }}>{ele.userid ? ele.userid.nickname + ` (${ele.userid.phone}) - Level ${ele.userid.level ? ele.userid.level : '1'}` : ""}</span>
            </li>
          )) : ""
        }
      </ul>
      <br />
      <div className="section-title">
        <h4><span className='text-warning'><GiLaurelCrown /></span> <small>Senior Forecasters</small></h4>
      </div>

      <ul className="section-list">

        {
          seniors.map((ele, key) => (
            <li className="section-item" key={key}>
              <img src={"/uploads/avatars/" + (ele.avatar ? ele.id + "." + ele.avatar : "user.png")} className="section-avatar" />
              <ul className="section-item-name">
                <li>{ele.nickname} <small>(level {ele.level ? ele.level : "1"})</small></li>
                <li className="item-email">{ele.phone}</li>
              </ul>
              <div className="item-content">
                   <span>₹ {ele.prize}</span>                  
              </div>
            </li>
          ))
        }
      </ul>
      <br />
      <div className="section-title">
        <h4><span className='text-warning'><GiPayMoney /></span> <small>Top Investors</small></h4>
      </div>
      <ul className="section-list">
        {
          maxBets.map((ele, key) => (
            <li className="section-item" key={key}>
              <img src={"/uploads/avatars/" + (ele.avatar ? ele.id + "." + ele.avatar : "user.png")} className="section-avatar" />
              <ul className="section-item-name">
                <li>{ele.nickname} <small>(level {ele.level ? ele.level : "1"})</small></li>
                <li className="item-email">{ele.phone}</li>
              </ul>            
              <div className="item-content">
                  <span>₹ {ele.bets}</span>                
              </div>
            </li>
          ))
        }
      </ul>
      <hr />
      <Row>
        <Col lg={12} style={{ textAlign: 'right' }}>
          <h4 className='feedback-header'>Feedback</h4>
          <ul className="section-list" style={{ textAlign: 'left' }}>
            {
              reviews ? reviews.map((ele, key) =>ele.userid && ele.content ? (
                <li className="section-item" key={key} style={{color:'white'}}>
                  <img style={{ borderRadius: '100px' }} src={"/uploads/avatars/" + (ele.avatar ? ele.id + "." + ele.avatar : "user.png")} className="section-avatar" />
                  <ul className="section-item-name">
                    <li>{ele.userid.nickname}</li>
                    <li className="item-email">{ele.userid.phone}</li>
                  </ul>
                  <br />
                  <div className="review-content">
                    <pre>
                    {ele.content}
                    </pre>
                  </div>
                </li>
              ) : '') : ''
            }
          </ul>
          <br />
          <br />
        </Col>
      </Row>
      <Snackbar
        place="tr"
        color="danger"
        icon={MdReportProblem}
        message={errorMessage}
        open={errorMessage != false}
        closeNotification={() => setErrorMessage(false)}
        close
      />
      <Snackbar
        place="tr"
        color="success"
        icon={MdNotificationsActive}
        message={successMessage}
        open={successMessage != false}
        closeNotification={() => setSuccessMessage(false)}
        close
      />

      <div style={{ height: "100px" }}>

      </div>

    </Page>
  );

}
export default HomePage;
