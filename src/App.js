import React, { useState } from 'react';
import './App.css';
import axios from "axios"
import { Alert, Card, Form, Jumbotron, Spinner } from 'react-bootstrap';
import { useEffect } from 'react';
import Clock from "react-live-clock"
import tzlookup from "tz-lookup"
axios.defaults.baseURL = "https://api.openweathermap.org/data/2.5/weather"
const dateBuilder = (d) => {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();


  return `${day}, ${date} ${month} ${year}`;
};

function App() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null)
  const [timeZone, setTimeZone] = useState("America/Los_Angeles")

  useEffect(() => {
    const fetchData = () => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { data } = await axios.get("", {
            params: {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              units: "metric",
              APPID: process.env.REACT_APP_OWM_API_KEY
            }
          });
          console.log(data)
          setWeather(prevState => data)
          setLoading(false);
          setTimeZone(tzlookup(data.coord?.lat, data.coord?.lon))

        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      });
    }
    fetchData();
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get("", {
        params: {
          q: query,
          units: "metric",
          APPID: process.env.REACT_APP_OWM_API_KEY
        }
      });
      setWeather(prevState => data)
      setLoading(false);
      setTimeZone(tzlookup(data.coord?.lat, data.coord?.lon))
      setQuery(prevState => "")
      console.log(data)
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }

  }
  return (
    <Jumbotron style={{ "width": "20rem" }}>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Control
            placeholder="Search..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form.Group>
      </Form>
      {error && <div className="text-center">
        <Alert variant="warning">{error}</Alert></div>}
      {loading && <div className="text-center"> <Spinner animation="grow" /></div>}
      {weather.main &&
        <Card className="text-center" >
          <Card.Body >
            <Card.Title>{weather.name}, {weather.sys?.country}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{dateBuilder(new Date(new Date().toLocaleString("en-US", { timeZone: timeZone })))}</Card.Subtitle>
            <span>
              <Clock format={'HH:mm:ss A'} ticking={true} timezone={timeZone} />
            </span>
            <h1>{Math.round(weather.main.temp)} <sup>&deg;C</sup></h1>
            <div className="d-flex justify-content-between">
              <span>{Math.round(weather.main.temp_min)} <sup>&deg;C</sup></span>
              <span>{Math.round(weather.main.temp_max)} <sup>&deg;C</sup></span>
            </div>
            <Card.Img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt={weather.weather[0]}></Card.Img>
            <Card.Text className="text-muted">{weather.weather[0].description.toUpperCase()}</Card.Text>
          </Card.Body>
        </Card>
      }
    </Jumbotron >
  );
}

export default App;
