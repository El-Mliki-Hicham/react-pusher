import "./App.css";
import React, { useState, useEffect } from "react";
import Pusher from "pusher-js";
function App() {
  const [reservations, setReservations] = useState([]); // This will hold the list of regions
  const [csrf, setCsrf] = useState([]); // This will hold the list of regions
  const [isLoading, setIsLoading] = useState(true); // Manage loading state
  const [error, setError] = useState(null); // Store any error that occurs
  const [notification, setNotification] = useState(false); // New notification for added region

  useEffect(() => {
    // Fetch initial region data from the API
    const fetchReservation = async () => {
      try {
        const requestBody = {
          vehicule_id: 147, // Example property, replace with actual data fields
          connect: 1, // Example property, replace as needed
          chauffeur_id: 292, // Example property, replace as neede
        };
        const response = await fetch(
          "https://app.mojanah.com/api/connectAndDisconnectChauffeur",
          {
            method: "POST", // Specify the method
            headers: {
              "Content-Type": "application/json", // Specify the content type in the headers
            },
            body: JSON.stringify(requestBody), // Convert the JavaScript object to a JSON string
          }
        );
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        const data = await response.json();
        setReservations(data.reservations); // Assuming the data has a 'Region' property which is an array
        // setCsrf(data.csrf_token); // Assuming the data has a 'Region' property which is an array
        console.log(data.reservations);
        // console.log("csrf" + csrf);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();

    // Setup Pusher
    Pusher.logToConsole = true;
    var pusher = new Pusher("3ca89d3509f73d9722da", {
      cluster: "mt1",
    });

    const channel = pusher.subscribe("reservation-store");
    // Listen for a 'book-event' and update state accordingly
    channel.bind("reservation-event", (data) => {
      console.log(data);
      setReservations((prevReservations) => [
        ...prevReservations,
        data.reservation,
      ]); // Assuming data.book should be data.region
      setNotification(true); // ShDow notification on new region
    });
    const channelAccept = pusher.subscribe("reservation-accepted");
    // Listen for a 'book-event' and update state accordingly
    channelAccept.bind("reservation-accepted-event", (data) => {
      console.log(data);
      //   setReservations((prevReservations) => [
      //     ...prevReservations,
      //     data.reservation,
      //   ]); // Assuming data.book should be data.region
      //   setNotification(true); // ShDow notification on new region
    });
    const channelAnnuler = pusher.subscribe("reservation-annuler");
    // Listen for a 'book-event' and update state accordingly
    channelAnnuler.bind("reservation-annuler-event", (data) => {
      console.log(data);
    });

    // Cleanup
    // return () => {
    //   channel.unbind_all();
    //   channel.unsubscribe();
    // };
  }, []);

  // Handling the loading state
  if (isLoading) return <div>Loading...</div>;

  // Handling the error state
  if (error) return <div>Error: {error}</div>;

  // Rendering the list of regions, once data is loaded and there is no error
  return (
    <div>
      {notification && <p>New region added!</p>}
      <ul>
        {reservations.map((reservation) => (
          <li key={reservation.id}>{reservation.depart_place}</li> // Assuming each region has 'id' and 'label'
        ))}
      </ul>
    </div>
  );
}
export default App;
