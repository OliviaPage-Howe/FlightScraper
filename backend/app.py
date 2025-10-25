from flask import Flask, jsonify, request
from amadeus import Client, ResponseError
from dotenv import load_dotenv
import os

#load two variables from .env file APIKEY && SECRET
load_dotenv()

app = Flask(__name__)

#create Amadeus client 
amadeus = Client(
    client_id=os.getenv("AMADEUS_CLIENT_ID"),
    client_secret=os.getenv("AMADEUS_CLIENT_SECRET")
)


def searchFlights():
    
    origin = request.args.get("origin")
    destination = request.args.get("destination")
    date = request.args.get("date")

    if not all([origin, destination, date]):
        return jsonify({"error": "Missing parameters"}), 400

    try:
        # Call Amadeus API to get flight offers
        response = amadeus.shopping.flight_offers_search.get(
            originLocationCode=origin,
            destinationLocationCode=destination,
            departureDate=date,
            adults=1,
            currencyCode="USD",
            max=5
        )
        return jsonify(response.data)
    except ResponseError as e:
        return jsonify({"error": str(e)}), 500
    #Simplify flight info for frontend
        flights = []
        for offer in response.data:
            itinerary = offer["itineraries"][0]
            segment = itinerary["segments"][0]
            flights.append({
                "airline": segment["carrierCode"],
                "departure": segment["departure"]["at"],
                "arrival": segment["arrival"]["at"],
                "price": offer["price"]["total"]
            })

        return jsonify(flights)

    except ResponseError as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)